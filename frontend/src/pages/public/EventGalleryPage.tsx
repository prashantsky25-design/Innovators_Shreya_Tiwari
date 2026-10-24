import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { PhotoLightbox } from '../../components/PhotoLightbox.js';
import { Image as ImageIcon, Calendar, MapPin, ArrowLeft } from 'lucide-react';

export const EventGalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      if (!slug) return;
      try {
        const evRes = await api.getEvent(slug);
        if (evRes.success && evRes.event) {
          setEvent(evRes.event);
          const galRes = await api.getGallery(evRes.event._id);
          if (galRes.success && galRes.album) {
            setPhotos(galRes.album.photos || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 w-1/3 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to={event ? `/events/${event.slug}` : '/events'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event Details
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            Official Event Photo Gallery
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {event?.title || 'Event Gallery'}
          </h1>
          {event && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(event.startDate).toDateString()} • <MapPin className="w-3.5 h-3.5" /> {event.venueName}
            </p>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          {photos.length} Photographs Published
        </div>
      </div>

      {/* Responsive Lightbox Component */}
      <PhotoLightbox photos={photos} />
    </div>
  );
};
