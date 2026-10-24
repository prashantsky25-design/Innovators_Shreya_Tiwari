import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { EventItem, DomainItem } from '../../types/index.js';
import { EventMap } from '../../components/EventMap.js';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Grid,
  List,
  Map as MapIcon,
  Navigation,
  Compass,
} from 'lucide-react';

export const ExploreEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [priceType, setPriceType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  // Geolocation States
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [isLocating, setIsLocating] = useState(false);

  const fetchDomains = async () => {
    try {
      const res = await api.getDomains();
      if (res.success) {
        setDomains(res.domains);
      }
    } catch (e) {}
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {
        domain: selectedDomain,
        search,
        priceType,
        dateFilter,
      };

      if (userLocation) {
        params.lat = userLocation[0];
        params.lng = userLocation[1];
        params.radiusKm = radiusKm;
      }

      const res = await api.getEvents(params);
      if (res.success) {
        setEvents(res.events);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedDomain, dateFilter, priceType, userLocation, radiusKm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      (err) => {
        alert('Could not access GPS location. You can still explore all events on the map.');
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore Hyperlocal Events
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Find workshops, conferences, and meetups in your neighborhood.
          </p>
        </div>

        {/* Search input with submit button */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search events by title, keyword, venue, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Chips & View Mode Controls */}
      <div className="space-y-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Domain Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedDomain('All')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedDomain === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Domains
          </button>
          {domains.map((dom) => (
            <button
              key={dom._id}
              onClick={() => setSelectedDomain(dom.name)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedDomain === dom.name
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dom.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Date & Price Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setDateFilter('upcoming')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  dateFilter === 'upcoming' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  dateFilter === 'today' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('this_week')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  dateFilter === 'this_week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  dateFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setPriceType('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  priceType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Prices
              </button>
              <button
                onClick={() => setPriceType('free')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  priceType === 'free' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setPriceType('paid')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  priceType === 'paid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Location Radius & View Mode Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={requestUserLocation}
              disabled={isLocating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                userLocation
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isLocating ? 'Locating...' : userLocation ? `Nearby (${radiusKm} km)` : 'Near Me'}</span>
            </button>

            {userLocation && (
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
                title={`Radius: ${radiusKm}km`}
                className="w-20 accent-indigo-600"
              />
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'}`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results View */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Showing {events.length} event locations on OpenStreetMap</span>
          </div>
          <EventMap events={events} userLocation={userLocation} radiusKm={radiusKm} height="600px" />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Compass className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No events found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, expanding the radius, or clearing domain filters.
          </p>
          <button
            onClick={() => {
              setSelectedDomain('All');
              setSearch('');
              setDateFilter('all');
              setPriceType('all');
              setUserLocation(null);
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={ev.coverImage}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold">
                  {ev.domain}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold">
                  {ev.price === 0 ? 'FREE' : `₹${ev.price}`}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span className="truncate">{ev.venueName}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className={ev.remainingSeats <= 5 ? 'text-red-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                      {ev.remainingSeats} seats
                    </span>{' '}
                    remaining
                  </div>

                  <Link
                    to={`/events/${ev.slug}`}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white text-xs font-bold transition-all"
                  >
                    Details & Register
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-all shadow-sm"
            >
              <img
                src={ev.coverImage}
                alt={ev.title}
                className="w-full sm:w-48 h-32 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 space-y-2 text-left w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {ev.domain}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-500">{new Date(ev.startDate).toDateString()}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{ev.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">📍 {ev.venueName} — {ev.address}</p>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {ev.remainingSeats} of {ev.capacity} spots remaining
                </div>
              </div>
              <div className="shrink-0 w-full sm:w-auto text-right">
                <Link
                  to={`/events/${ev.slug}`}
                  className="w-full sm:w-auto inline-block text-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  View Event
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
