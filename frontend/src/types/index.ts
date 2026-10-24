export interface User {
  id: string;
  name: string;
  email: string;
  role: 'participant' | 'organizer' | 'admin';
  avatarUrl?: string;
  organization?: string;
  interests?: string[];
  eventCoinsBalance: number;
  totalCoinsEarned: number;
  eventsAttendedCount: number;
  badges: string[];
  isLeaderboardOptedIn?: boolean;
}

export interface EventItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  organizerId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    organization?: string;
  };
  domain: string;
  tags: string[];
  coverImage: string;
  eligibility: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  timezone: string;
  venueName: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  capacity: number;
  registeredCount: number;
  verifiedAttendanceCount: number;
  remainingSeats: number;
  isSoldOut: boolean;
  isPastDeadline: boolean;
  price: number;
  instructions?: string;
  isExternal?: boolean;
  externalSourceUrl?: string;
  certificateEnabled: boolean;
  galleryEnabled: boolean;
  customFields?: Array<{
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
    required?: boolean;
    options?: string[];
  }>;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  isFeatured?: boolean;
}

export interface TicketItem {
  _id: string;
  ticketCode: string;
  ticketToken: string;
  eventId: EventItem | string;
  userId: string;
  registrationId: string;
  status: 'active' | 'checked_in' | 'cancelled';
  qrDataUrl: string;
  checkedInAt?: string;
}

export interface AttendanceRecord {
  _id: string;
  eventId: EventItem;
  userId: string;
  ticketId: string;
  verifiedAt: string;
  checkInMethod: string;
  certificate?: CertificateItem;
  coinsEarned: number;
}

export interface CertificateItem {
  _id: string;
  certificateId: string;
  eventId: EventItem;
  userId: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  pdfPath: string;
  verificationUrl: string;
  status: string;
  issuedAt: string;
}

export interface PhotoItem {
  _id?: string;
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface PhotoAlbumItem {
  _id: string;
  eventId: string | EventItem;
  title: string;
  description: string;
  photos: PhotoItem[];
  isPublished: boolean;
  publishedAt?: string;
}

export interface CoinTransactionItem {
  _id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  reason: string;
  timestamp: string;
  eventId?: {
    _id: string;
    title: string;
    slug: string;
  };
}

export interface AchievementItem {
  _id: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  threshold: number;
  bonusCoins: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isUnlocked?: boolean;
  currentMetric?: number;
  progressPercent?: number;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DomainItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}
