import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Share2,
  Check,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const GalleryManagerPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [photos, setPhotos] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const fetchAlbum = async () => {
    if (!eventId) return;
    try {
      const res = await api.getGallery(eventId);
      if (res.success && res.album) {
        setPhotos(res.album.photos || []);
        setIsPublished(res.album.isPublished || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [eventId]);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !eventId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('url', photoUrl);
      formData.append('caption', caption);

      const res = await api.uploadGalleryPhoto(eventId, formData);
      if (res.success && res.album) {
        setPhotos(res.album.photos || []);
        setPhotoUrl('');
        setCaption('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!eventId) return;
    setPublishing(true);
    setPublishSuccess(false);

    try {
      const res = await api.publishAlbum(eventId);
      if (res.success) {
        setIsPublished(true);
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish album');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/organizer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            Website Photo Gallery Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manage Event Photographs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload official high-resolution photographs. Attendees access photos directly on the website.
          </p>
        </div>

        <button
          onClick={handlePublish}
          disabled={publishing || photos.length === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
            isPublished
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {publishing ? 'Publishing...' : isPublished ? 'Re-Publish & Notify Attendees' : 'Publish Gallery to Attendees'}
        </button>
      </div>

      {publishSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Photo gallery published! In-app notifications and email links sent to all verified attendees.</span>
        </div>
      )}

      {/* Upload New Photo Card */}
      <form
        onSubmit={handleAddPhoto}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
      >
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-500" />
          Add Photograph to Event Album
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Photo Image URL *</label>
            <input
              type="url"
              required
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Photo Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Keynote speech on deep learning architectures"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !photoUrl}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50 transition-all shadow-sm"
        >
          {uploading ? 'Adding...' : 'Add to Album'}
        </button>
      </form>

      {/* Photos Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{photos.length} Photographs in Album</span>
          <span>Status: {isPublished ? 'Published on Website' : 'Draft (Unpublished)'}</span>
        </div>

        {photos.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No photos uploaded to this event album yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((p, idx) => (
              <div
                key={p._id || idx}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <img src={p.url} alt={p.caption || 'Photo'} className="w-full h-full object-cover" />
                {p.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-white p-2 text-[10px] truncate">
                    {p.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
