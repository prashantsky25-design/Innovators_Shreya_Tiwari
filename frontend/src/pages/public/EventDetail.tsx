import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { EventItem } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { EventMap } from '../../components/EventMap.js';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Share2,
  QrCode,
  ArrowLeft,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EventDetail: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [registeredTicket, setRegisteredTicket] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchEvent = async () => {
    if (!identifier) return;
    try {
      const res = await api.getEvent(identifier);
      if (res.success) {
        setEvent(res.event);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Event not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [identifier]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!event) return;

    setRegistering(true);
    setErrorMessage('');
    try {
      const res = await api.registerForEvent({
        eventId: event._id,
        customAnswers,
      });

      if (res.success) {
        setRegisteredTicket(res.ticket);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        // Refresh event to get accurate remaining seats count
        fetchEvent();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 w-2/3 rounded-lg" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-sm text-slate-500">The requested event does not exist or has been removed.</p>
        <Link to="/events" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
          Back to Events
        </Link>
      </div>
    );
  }

  const capacityPct = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explore
      </Link>

      {/* Hero Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] bg-slate-900 shadow-lg">
        <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide shadow-md">
            {event.domain}
          </span>
          {event.isFeatured && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wide shadow-md">
              Featured
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: event.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Event link copied to clipboard!');
              }
            }}
            className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
            title="Share Event"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {new Date(event.startDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-400" />
              {event.venueName}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Registration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details, Venue, Photo Gallery Link */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Event */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">About this Event</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
              {event.description}
            </p>

            {event.instructions && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Attendee Instructions
                </div>
                <p>{event.instructions}</p>
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {event.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Venue Map */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Venue Location</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {event.venueName} — {event.address}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venueName} ${event.address}`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Directions <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <EventMap events={[event]} height="320px" />
          </div>

          {/* Organizer Bio & Links */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {event.organizerId?.avatarUrl ? (
                <img
                  src={event.organizerId.avatarUrl}
                  alt={event.organizerId.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                  {event.organizerId?.name?.charAt(0) || 'O'}
                </div>
              )}
              <div>
                <div className="text-xs text-slate-400 font-medium">Hosted by</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {event.organizerId?.name}
                </div>
                {event.organizerId?.organization && (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    {event.organizerId.organization}
                  </div>
                )}
              </div>
            </div>

            {event.galleryEnabled && (
              <Link
                to={`/events/${event.slug}/gallery`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-indigo-500"
              >
                <ImageIcon className="w-4 h-4 text-sky-500" />
                View Gallery
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Price</div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {event.price === 0 ? 'Free Entry' : `₹${event.price}`}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  event.isSoldOut
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {event.isSoldOut ? 'Sold Out' : `${event.remainingSeats} Seats Left`}
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Registration Status</span>
                <span>
                  {event.registeredCount} / {event.capacity} Filled ({capacityPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </div>

            {/* Perks Included */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-medium">
                <QrCode className="w-4 h-4 text-emerald-500" />
                Digital QR Ticket with Instant Verification
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Award className="w-4 h-4 text-purple-500" />
                Verified Certificate of Attendance
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                +10 EventCoins Credited on Check-in
              </div>
            </div>

            {/* Register CTA Button */}
            {event.isSoldOut ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-sm cursor-not-allowed"
              >
                Event Capacity Reached
              </button>
            ) : event.isPastDeadline ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-sm cursor-not-allowed"
              >
                Registration Window Closed
              </button>
            ) : (
              <button
                onClick={() => setShowRegModal(true)}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
              >
                {user ? 'Register for Event' : 'Sign In to Register'}
              </button>
            )}

            <div className="text-[11px] text-center text-slate-500 dark:text-slate-400">
              Registration deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Registration & QR Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {registeredTicket ? 'Registration Confirmed!' : 'Event Registration'}
              </h3>
              <button
                onClick={() => {
                  setShowRegModal(false);
                  setRegisteredTicket(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {registeredTicket ? (
                /* Ticket Pass Success Card */
                <div className="space-y-4 text-center">
                  <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">You’re All Set!</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your ticket and QR code have been saved to your account and emailed.
                    </p>
                  </div>

                  {/* QR Code Pass Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 space-y-3">
                    <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Ticket Pass ID
                    </div>
                    <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                      {registeredTicket.ticketCode}
                    </div>
                    <img
                      src={registeredTicket.qrDataUrl}
                      alt="Ticket QR Code"
                      className="w-44 h-44 mx-auto rounded-xl bg-white p-2 border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Show this QR code at the entrance for verified check-in.
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link
                      to="/participant/tickets"
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 text-center shadow-md"
                    >
                      View in My Tickets
                    </Link>
                    <button
                      onClick={() => setShowRegModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Participant Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.name || ''}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500"
                    />
                    <p className="text-[10px] text-slate-400">Ticket pass and notifications will be sent to this email.</p>
                  </div>

                  {/* Dynamic Custom Registration Fields if event has any */}
                  {event.customFields &&
                    event.customFields.map((field: any) => (
                      <div key={field.fieldName} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {field.fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.fieldType === 'select' && field.options ? (
                          <select
                            required={field.required}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.fieldName]: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          >
                            <option value="">Select option</option>
                            {field.options.map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.fieldType}
                            required={field.required}
                            onChange={(e) =>
                              setCustomAnswers({ ...customAnswers, [field.fieldName]: e.target.value })
                            }
                            placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          />
                        )}
                      </div>
                    ))}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={registering}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
                    >
                      {registering ? 'Confirming Ticket...' : 'Confirm Registration & Generate QR'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
