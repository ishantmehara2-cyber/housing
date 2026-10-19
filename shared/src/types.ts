import {
  Role,
  UserStatus,
  ListingPurpose,
  PropertyCategory,
  AreaUnit,
  Furnishing,
  Facing,
  PropertyAge,
  PossessionStatus,
  VerificationState,
  ListingState,
  MediaType,
} from './enums';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  requestId?: string;
  timestamp?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  service: string;
  status: string;
  environment: string;
  version: string;
  timestamp: string;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export interface AuthResponseData {
  accessToken: string;
  user: UserSummary;
}

export interface StateSummary {
  id: string;
  name: string;
  code: string;
}

export interface CitySummary {
  id: string;
  name: string;
  slug: string;
  state: StateSummary;
  latitude: number;
  longitude: number;
  isPopular: boolean;
  isActive: boolean;
}

export interface LocalitySummary {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  pincode: string | null;
  latitude: number;
  longitude: number;
}

export interface SubLocalitySummary {
  id: string;
  name: string;
  slug: string;
  localityId: string;
  latitude: number;
  longitude: number;
}

export interface PropertyTypeSummary {
  id: string;
  name: string;
  slug: string;
  category: PropertyCategory;
  icon: string | null;
}

export interface AmenitySummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string | null;
}

export interface DeveloperOrganizationSummary {
  id: string;
  companyName: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  establishedYear: number | null;
  verificationStatus: VerificationState;
}

export interface ProjectMediaSummary {
  id: string;
  mediaType: MediaType;
  url: string;
  caption: string | null;
  displayOrder: number;
}

export interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  developerOrganization: DeveloperOrganizationSummary;
  city: CitySummary;
  locality: LocalitySummary;
  subLocality: SubLocalitySummary | null;
  address: string;
  latitude: number;
  longitude: number;
  minPrice: number;
  maxPrice: number;
  possessionDate: string | null;
  constructionStatus: PossessionStatus;
  reraId: string | null;
  brochureUrl: string | null;
  status: ListingState;
  amenities: AmenitySummary[];
  media: ProjectMediaSummary[];
  createdAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  reraId?: string | null;
}

export interface PropertyMediaSummary {
  id: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  displayOrder: number;
  fileSizeBytes: number | null;
  mimeType: string | null;
}

export interface PropertySearchSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  listingPurpose: ListingPurpose;
  propertyCategory: PropertyCategory;
  propertyType: PropertyTypeSummary;
  price: number | null;
  rent: number | null;
  securityDeposit: number | null;
  maintenanceFee: number | null;
  carpetArea: number;
  builtUpArea: number | null;
  plotArea: number | null;
  areaUnit: AreaUnit;
  bhk: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  furnishing: Furnishing;
  address: string;
  city: { id: string; name: string; slug: string };
  locality: { id: string; name: string; slug: string };
  subLocality: { id: string; name: string; slug: string } | null;
  project: ProjectSummary | null;
  developerOrganization: { id: string; companyName: string; slug: string } | null;
  primaryImage: PropertyMediaSummary | null;
  verificationState: VerificationState;
  listingState: ListingState;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: string;
  publishedAt: string | null;
}

export interface PropertyDetail extends Omit<PropertySearchSummary, 'city' | 'locality' | 'subLocality' | 'developerOrganization' | 'project'> {
  city: CitySummary;
  locality: LocalitySummary;
  subLocality: SubLocalitySummary | null;
  developerOrganization: DeveloperOrganizationSummary | null;
  project: ProjectDetail | null;
  owner: UserSummary;
  postedByUser: UserSummary;
  assignedAgent: UserSummary | null;
  balconies: number | null;
  floorNumber: number | null;
  totalFloors: number | null;
  parkingSpaces: number;
  facing: Facing | null;
  propertyAge: PropertyAge | null;
  possessionStatus: PossessionStatus | null;
  possessionDate: string | null;
  completedStep?: number;
  landmark: string | null;
  pincode: string | null;
  latitude: number;
  longitude: number;
  viewCount: number;
  enquiryCount: number;
  amenities: AmenitySummary[];
  media: PropertyMediaSummary[];
}

export interface SearchPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PropertySearchResponse {
  items: PropertySearchSummary[];
  pagination: SearchPaginationMetadata;
  appliedFilters: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  northEast: GeoCoordinates;
  southWest: GeoCoordinates;
}

export interface BrokerSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  agencyName: string | null;
  experienceYears: number;
  city: string | null;
  areasServed: string[];
  propertyTypesServed: string[];
  specialization: 'BUY' | 'RENT' | 'BOTH';
  verified: boolean;
  rating: number;
  reviewCount: number;
  activeListingCount: number;
  createdAt: string;
}

export interface BrokerDetail extends BrokerSummary {
  about: string | null;
  activeProperties: PropertySearchSummary[];
}

export interface BrokerListResponse {
  brokers: BrokerSummary[];
  pagination: SearchPaginationMetadata;
}
