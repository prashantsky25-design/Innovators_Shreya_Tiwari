import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { MapPinPicker } from '../../components/MapPinPicker.js';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  Award,
  Image as ImageIcon,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  'AI/ML',
  'Web Development',
  'Software Development',
  'Data Science',
  'Cybersecurity',
  'Blockchain',
  'Hackathons',
  'Startups & Pitch',
  'Workshops & Bootcamps',
  'Seminars',
  'Sports',
  'Cultural & Arts',
  'Community Meetups',
];

export const CreateEditEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('AI/ML');
  const [tags, setTags] = useState('Tech, Innovation');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  );
  const [eligibility, setEligibility] = useState('Open to All');

  // Step 2
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Step 3 (Venue & Map)
  const [venueName, setVenueName] = useState('Innovators Hub');
  const [address, setAddress] = useState('Sector 62, Noida, NCR, India');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6280,
    lng: 77.3621,
  });

  // Step 4 (Capacity & Pricing)
  const [capacity, setCapacity] = useState('100');
  const [price, setPrice] = useState('0');
  const [instructions, setInstructions] = useState('Bring your student/gov ID and laptop.');

  // Step 5 (Settings)
  const [certificateEnabled, setCertificateEnabled] = useState(true);
  const [galleryEnabled, setGalleryEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.createEvent({
        title,
        description,
        domain,
        tags: tags.split(',').map((t) => t.trim()),
        coverImage,
        eligibility,
        startDate,
        endDate,
        registrationDeadline: registrationDeadline || startDate,
        timezone,
        venueName,
        address,
        latitude: coords.lat,
        longitude: coords.lng,
        capacity: parseInt(capacity, 10),
        price: parseFloat(price) || 0,
        instructions,
        certificateEnabled,
        galleryEnabled,
        status: 'published',
      });

      if (res.success) {
        navigate('/organizer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create New Hyperlocal Event
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Publish your event with map markers, automated QR tickets, and verified certificates
        </p>
      </div>

      {/* Multi-step Progress Bar */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
        <div
          className={`p-3 rounded-xl border transition-all ${
            currentStep >= 1
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'
          }`}
        >
          1. Basic Info
        </div>
        <div
          className={`p-3 rounded-xl border transition-all ${
            currentStep >= 2
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'
          }`}
        >
          2. Dates & Deadlines
        </div>
        <div
          className={`p-3 rounded-xl border transition-all ${
            currentStep >= 3
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'
          }`}
        >
          3. Venue & Leaflet Pin
        </div>
        <div
          className={`p-3 rounded-xl border transition-all ${
            currentStep >= 4
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'
          }`}
        >
          4. Capacity & Launch
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Step Form Container */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Event Details & Domain</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hyperlocal AI Hackathon 2026"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category Domain *</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Eligibility</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. Open to All Developers"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive summary of the event agenda, topics, speakers, and schedule..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cover Image URL</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Date, Time & Timezone</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Registration Deadline</label>
                <input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Asia/Kolkata"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Venue & OpenStreetMap Coordinates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Auditorium Alpha, Connaught Place"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Sector, City, State"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
            </div>

            {/* Interactive Leaflet Pin Picker */}
            <MapPinPicker
              lat={coords.lat}
              lng={coords.lng}
              onChange={(c) => setCoords(c)}
              height="280px"
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Capacity, Fees & Features</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Attendee Capacity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ticket Price (₹ 0 = Free)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Special Instructions</label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="What to bring, dress code, parking details"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>

            {/* Feature Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Automated PDF Certificates
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Auto-generate verified certificate for attendees upon on-site check-in
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={certificateEnabled}
                  onChange={(e) => setCertificateEnabled(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Website Photo Gallery
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Enable high-resolution event photo album on the website for attendees
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={galleryEnabled}
                  onChange={(e) => setGalleryEnabled(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && (!title || !description)) {
                  setError('Please fill in the title and description.');
                  return;
                }
                if (currentStep === 2 && (!startDate || !endDate)) {
                  setError('Please select start and end dates.');
                  return;
                }
                setError('');
                setCurrentStep((prev) => prev + 1);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Publishing Event...' : 'Publish Event Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
