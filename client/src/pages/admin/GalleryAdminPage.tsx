import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, X, Upload, AlertCircle, Star } from 'lucide-react';
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
  is_cover?: number;
  created_at: string;
}

/** A picked file plus the story line that will be saved with it. */
interface UploadItem {
  key: string;
  file: File;
  caption: string;
}

interface UploadForm {
  items: UploadItem[];
  album: GalleryAlbum;
}

interface FailedUpload {
  key: string;
  name: string;
  reason: string;
}

const EMPTY_FORM: UploadForm = { items: [], album: DEFAULT_ALBUM };

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
  const [bulkCaption, setBulkCaption] = useState('');
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

  const totalBytes = form.items.reduce((sum, item) => sum + item.file.size, 0);

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setBulkCaption('');
    setFailures([]);
  }

  function pickFiles(fileList: FileList | null) {
    const items = Array.from(fileList ?? []).map(file => ({
      key: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      caption: '',
    }));
    setForm({ ...form, items });
    setFailures([]);
  }

  function setCaption(key: string, caption: string) {
    setForm({
      ...form,
      items: form.items.map(item => (item.key === key ? { ...item, caption } : item)),
    });
  }

  function applyCaptionToAll() {
    if (!bulkCaption.trim()) return;
    setForm({ ...form, items: form.items.map(item => ({ ...item, caption: bulkCaption })) });
  }

  // Uploaded one at a time: each file is compressed in the browser first, and a
  // single bad photo in a 40-photo batch should not sink the rest, so failures
  // are collected and reported at the end rather than aborting the run.
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (form.items.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }

    setUploading(true);
    setFailures([]);
    const failed: FailedUpload[] = [];
    let uploaded = 0;

    for (const [index, item] of form.items.entries()) {
      setProgress({ done: index, total: form.items.length });
      try {
        await postImageForm('/admin/gallery', item.file, {
          caption: item.caption,
          album: form.album,
        });
        uploaded += 1;
      } catch (err) {
        failed.push({ key: item.key, name: item.file.name, reason: uploadErrorMessage(err) });
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

    // Keep only the failures selected (with their captions) so a retry does not
    // re-upload the ones that already went through.
    toast.error(`${failed.length} photo${failed.length === 1 ? '' : 's'} could not be uploaded`);
    setForm({
      ...form,
      items: form.items.filter(item => failed.some(failure => failure.key === item.key)),
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

  async function handleSetCover(image: GalleryImage) {
    try {
      await api.patch(`/admin/gallery/${image.id}/cover`);
      toast.success(`Now representing ${albumOf(image)} on the website`);
      load();
    } catch {
      toast.error('Could not set the cover photo');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-600 mt-1">
            Photos are grouped by album. The photo marked with a star represents its album on the website.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-sm shrink-0"
        >
          <Plus className="w-5 h-5" />
          Upload Photos
        </button>
      </div>

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
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
              {/* Album — chosen first, because it decides where the photos land */}
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
                <p className="text-xs text-gray-500 mt-1">
                  Every photo in this batch goes to this album.
                </p>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-700">
                    {form.items.length > 0
                      ? `${form.items.length} photo${form.items.length === 1 ? '' : 's'} selected · ${formatBytes(totalBytes)}`
                      : 'Click to select images'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    JPG, PNG, WebP, GIF — pick as many as you like, large photos are shrunk automatically
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => pickFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Per-photo story lines */}
              {form.items.length > 0 && (
                <div>
                  <div className="flex items-end gap-2 mb-2">
                    <div className="flex-1">
                      <label htmlFor="bulk-caption" className="block text-sm font-medium text-gray-700 mb-1">
                        Story line
                      </label>
                      <input
                        id="bulk-caption"
                        type="text"
                        placeholder="e.g., Membership class graduation, September 2026"
                        value={bulkCaption}
                        onChange={e => setBulkCaption(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        maxLength={200}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCaptionToAll}
                      disabled={!bulkCaption.trim()}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Apply to all
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Shown under the photo on the website. Edit any line below to give a photo its own story.
                  </p>

                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {form.items.map(item => (
                      <li key={item.key} className="flex items-center gap-2">
                        <span className="w-28 shrink-0 truncate text-xs text-gray-500" title={item.file.name}>
                          {item.file.name}
                        </span>
                        <input
                          type="text"
                          aria-label={`Story line for ${item.file.name}`}
                          placeholder="Story line (optional)"
                          value={item.caption}
                          onChange={e => setCaption(item.key, e.target.value)}
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          maxLength={200}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                      <li key={failure.key}>
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
              <div className="flex gap-3 pt-2">
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
                  disabled={form.items.length === 0 || uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {uploading ? 'Uploading…' : `Upload${form.items.length > 0 ? ` ${form.items.length}` : ''}`}
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

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium">
                    {albumOf(image)}
                  </span>

                  {image.is_cover === 1 && (
                    <span
                      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold"
                      title="Represents this album on the website"
                    >
                      <Star className="w-3 h-3 fill-current" />
                      Cover
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-200 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {image.is_cover !== 1 && (
                      <button
                        onClick={() => handleSetCover(image)}
                        className="flex items-center gap-2 px-3 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium"
                      >
                        <Star className="w-4 h-4" />
                        Use on website
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pointer-events-none">
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
