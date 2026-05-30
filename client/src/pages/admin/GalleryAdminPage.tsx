import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Upload } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  album: string;
  created_at: string;
}

export default function GalleryAdminPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ file: null as File | null, caption: '', album: '' });

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

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!form.file) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', form.file);
      formData.append('caption', form.caption);
      formData.append('album', form.album);

      await api.post('/admin/gallery', formData);
      toast.success('Image uploaded');
      setShowForm(false);
      setForm({ file: null, caption: '', album: '' });
      load();
    } catch (err) {
      const error = err as any;
      toast.error(error.response?.data?.error ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
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
          Upload Photo
        </button>
      </div>

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Upload Photo</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-700">
                    {form.file ? form.file.name : 'Click to select image'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF up to 8MB</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setForm({ ...form, file: e.target.files?.[0] ?? null })}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sunday Service 2026"
                  value={form.caption}
                  onChange={e => setForm({ ...form, caption: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={200}
                />
              </div>

              {/* Album */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Album (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Thanksgiving Service"
                  value={form.album}
                  onChange={e => setForm({ ...form, album: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={100}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.file || uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
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
              Upload First Photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(image => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={image.url}
                  alt={image.caption || 'Gallery image'}
                  className="w-full h-40 object-cover"
                />
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
        )}
      </div>
    </div>
  );
}
