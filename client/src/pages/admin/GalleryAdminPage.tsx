import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, X, Upload, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { postImageForm, uploadErrorMessage } from '../../utils/imageUpload';
import {
  GALLERY_ALBUMS,
  DEFAULT_ALBUM,
  UNFILED_LABEL,
  orderAlbums,
  type GalleryAlbum,
} from '../../constants/albums';
import toast from 'react-hot-toast';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  album: string;
  created_at: string;
}

interface UploadForm {
  files: File[];
  caption: string;
  album: GalleryAlbum;
}

interface FailedUpload {
  name: string;
  reason: string;
}

const EMPTY_FORM: UploadForm = { files: [], caption: '', album: DEFAULT_ALBUM };

const ALL_ALBUMS = 'All';

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function albumOf(image: GalleryImage): string {
  return image.album?.trim() ? image.album : UNFILED_LABEL;
}

export default function GalleryAdminPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failures, setFailures] = useState<FailedUpload[]>([]);
  const [form, setForm] = useState<UploadForm>(EMPTY_FORM);
  const [filter, setFilter] = useState<string>(ALL_ALBUMS);

  async function load() {
    try {
      const { data } = await api.get('/admin/gallery');
      setImages(data.data ?? []);
    } catch {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Tabs only for albums that actually hold photos, so the filter never offers
  // an empty album. Legacy/blank albums collapse into one "Unfiled" tab.
  const albumTabs = useMemo(() => {
    const present = [...new Set(images.map(albumOf))];
    return [ALL_ALBUMS, ...orderAlbums(present)];
  }, [images]);

  const visibleImages = useMemo(
    () => (filter === ALL_ALBUMS ? images : images.filter(image => albumOf(image) === filter)),
    [images, filter]
  );

  const totalBytes = form.files.reduce((sum, file) => sum + file.size, 0);

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setFailures([]);
  }

  // Uploaded one at a time: each file is compressed in the browser first, and a
  // single bad photo in a 40-photo batch should not sink the rest, so failures
  // are collected and reported at the end rather than aborting the run.
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (form.files.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }

    setUploading(true);
    setFailures([]);
    const failed: FailedUpload[] = [];
    let uploaded = 0;

    for (const [index, file] of form.files.entries()) {
      setProgress({ done: index, total: form.files.length });
      try {
        await postImageForm('/admin/gallery', file, { caption: form.caption, album: form.album });
        uploaded += 1;
      } catch (err) {
        failed.push({ name: file.name, reason: uploadErrorMessage(err) });
      }
    }

    setProgress(null);
    setUploading(false);
    setFailures(failed);

    if (uploaded > 0) {
      toast.success(`${uploaded} photo${uploaded === 1 ? '' : 's'} uploaded to ${form.album}`);
      setFilter(form.album);
      load();
    }

    if (failed.length === 0) {
      closeForm();
      return;
    }

    // Keep only the failures selected so a retry does not re-upload duplicates.
    toast.error(`${failed.length} photo${failed.length === 1 ? '' : 's'} could not be uploaded`);
    setForm({
      ...form,
      files: form.files.filter(file => failed.some(failure => failure.name === file.name)),
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this image?')) return;
    try {
      await api.delete(`/admin/gallery/${id}`);
      toast.success('Image deleted');
      load();
    } catch {
      toast.error('Failed to delete image');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-600 mt-1">Manage church photos and images</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-5 h-5" />
          Upload Photos
        </button>
      </div>

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Upload Photos</h3>
              <button
                onClick={closeForm}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos
                </label>
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-700">
                    {form.files.length > 0
                      ? `${form.files.length} photo${form.files.length === 1 ? '' : 's'} selected · ${formatBytes(totalBytes)}`
                      : 'Click to select images'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    JPG, PNG, WebP, GIF — pick as many as you like, large photos are shrunk automatically
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setForm({ ...form, files: Array.from(e.target.files ?? []) })}
                    className="hidden"
                  />
                </label>

                {form.files.length > 0 && (
                  <ul className="mt-2 max-h-28 overflow-y-auto text-xs text-gray-600 space-y-1">
                    {form.files.map(file => (
                      <li key={`${file.name}-${file.size}`} className="flex justify-between gap-3">
                        <span className="truncate">{file.name}</span>
                        <span className="shrink-0 text-gray-400">{formatBytes(file.size)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Album */}
              <div>
                <label htmlFor="album" className="block text-sm font-medium text-gray-700 mb-1">
                  Album
                </label>
                <select
                  id="album"
                  value={form.album}
                  onChange={e => setForm({ ...form, album: e.target.value as GalleryAlbum })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {GALLERY_ALBUMS.map(album => (
                    <option key={album} value={album}>{album}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Applied to every photo in this batch.</p>
              </div>

              {/* Caption */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (optional)
                </label>
                <input
                  id="caption"
                  type="text"
                  placeholder="e.g., Thanksgiving Service, March 2026"
                  value={form.caption}
                  onChange={e => setForm({ ...form, caption: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">Applied to every photo in this batch.</p>
              </div>

              {/* Progress */}
              {progress && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading {progress.done + 1} of {progress.total}…</span>
                    <span>{Math.round((progress.done / progress.total) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Failures */}
              {failures.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-800 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    These photos did not upload
                  </div>
                  <ul className="text-xs text-red-700 space-y-1 max-h-28 overflow-y-auto">
                    {failures.map(failure => (
                      <li key={failure.name}>
                        <span className="font-medium">{failure.name}</span> — {failure.reason}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-700 mt-2">
                    They are still selected — fix and press Upload to retry.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-40"
                >
                  {failures.length > 0 ? 'Done' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={form.files.length === 0 || uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {uploading ? 'Uploading…' : `Upload${form.files.length > 0 ? ` ${form.files.length}` : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Album Filter */}
      {!loading && images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {albumTabs.map(album => (
            <button
              key={album}
              onClick={() => setFilter(album)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === album
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {album}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Loading gallery...</div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <svg
                className="w-16 h-16 mx-auto opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No photos uploaded yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Upload First Photos
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {visibleImages.length} photo{visibleImages.length === 1 ? '' : 's'}
              {filter !== ALL_ALBUMS && ` in ${filter}`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleImages.map(image => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={image.url}
                    alt={image.caption || 'Gallery image'}
                    className="w-full h-40 object-cover"
                  />
                  {image.album && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium">
                      {image.album}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs font-medium line-clamp-1">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
