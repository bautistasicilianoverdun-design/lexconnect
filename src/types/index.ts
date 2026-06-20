// ============================================================
// LexConnect AR — TypeScript Types
// ============================================================

export type UserRole = 'client' | 'lawyer' | 'firm_admin' | 'admin'
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended'
export type PlanType = 'free' | 'professional' | 'premium' | 'firm'
export type CaseStatus = 'open' | 'in_progress' | 'closed' | 'archived'
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent'
export type CaseVisibility = 'public' | 'private'
export type MessageType = 'text' | 'file' | 'system'

// ============================================================
// CATEGORÍAS Y PROVINCIAS
// ============================================================

export interface LegalCategory {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
}

export interface Province {
  id: number
  name: string
  slug: string
}

// ============================================================
// PERFILES
// ============================================================

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  phone: string | null
  bio: string | null
  province_id: number | null
  city: string | null
  website: string | null
  linkedin_url: string | null
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
  // Joined
  province?: Province
}

// ============================================================
// ABOGADOS
// ============================================================

export interface LawyerProfile {
  id: string
  user_id: string
  license_number: string
  license_province_id: number | null
  university: string | null
  graduation_year: number | null
  verification_status: VerificationStatus
  verified_at: string | null
  plan: PlanType
  plan_expires_at: string | null
  is_featured: boolean
  profile_completeness: number
  slug: string | null
  rating_avg: number
  rating_count: number
  response_time_hours: number | null
  cases_handled: number
  consultations_answered: number
  accepts_new_clients: boolean
  availability_note: string | null
  created_at: string
  updated_at: string
  // Joined
  profile?: Profile
  specialties?: LawyerSpecialty[]
  experience?: LawyerExperience[]
  education?: LawyerEducation[]
  languages?: LawyerLanguage[]
  reviews?: Review[]
  license_province?: Province
}

export interface LawyerSpecialty {
  lawyer_id: string
  category_id: string
  years_experience: number | null
  is_primary: boolean
  category?: LegalCategory
}

export interface LawyerExperience {
  id: string
  lawyer_id: string
  position: string
  organization: string
  start_year: number | null
  end_year: number | null
  is_current: boolean
  description: string | null
  sort_order: number
}

export interface LawyerEducation {
  id: string
  lawyer_id: string
  degree: string
  institution: string
  year: number | null
  sort_order: number
}

export interface LawyerLanguage {
  lawyer_id: string
  language: string
  level: 'basic' | 'intermediate' | 'advanced' | 'native'
}

export interface LawyerPublication {
  id: string
  lawyer_id: string
  title: string
  publication: string | null
  url: string | null
  published_at: string | null
}

// ============================================================
// ESTUDIOS JURÍDICOS
// ============================================================

export interface LawFirm {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  province_id: number | null
  city: string | null
  verification_status: VerificationStatus
  plan: PlanType
  rating_avg: number
  rating_count: number
  lawyer_count: number
  created_at: string
  // Joined
  province?: Province
  members?: FirmMember[]
  specialties?: LegalCategory[]
}

export interface FirmMember {
  firm_id: string
  lawyer_id: string
  role: 'owner' | 'partner' | 'associate' | 'staff'
  joined_at: string
  lawyer?: LawyerProfile
}

// ============================================================
// CASOS LEGALES
// ============================================================

export interface LegalCase {
  id: string
  client_id: string
  title: string
  description: string
  category_id: string | null
  province_id: number | null
  urgency: UrgencyLevel
  visibility: CaseVisibility
  status: CaseStatus
  ai_category_id: string | null
  ai_urgency: UrgencyLevel | null
  ai_summary: string | null
  is_moderated: boolean
  has_sensitive_data: boolean
  budget_min: number | null
  budget_max: number | null
  views_count: number
  proposals_count: number
  expires_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
  // Joined
  client?: Profile
  category?: LegalCategory
  province?: Province
  documents?: CaseDocument[]
  proposals?: CaseProposal[]
}

export interface CaseDocument {
  id: string
  case_id: string
  uploaded_by: string
  file_name: string
  file_url: string
  file_size: number | null
  file_type: string | null
  is_sensitive: boolean
  created_at: string
}

export interface CaseProposal {
  id: string
  case_id: string
  lawyer_id: string
  message: string
  proposed_fee: number | null
  fee_type: 'fixed' | 'hourly' | 'contingency' | 'to_discuss' | null
  estimated_duration: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  // Joined
  lawyer?: LawyerProfile
}

// ============================================================
// MENSAJERÍA
// ============================================================

export interface Conversation {
  id: string
  case_id: string | null
  client_id: string
  lawyer_id: string
  last_message_at: string | null
  client_unread: number
  lawyer_unread: number
  is_archived: boolean
  created_at: string
  // Joined
  client?: Profile
  lawyer?: Profile
  case?: LegalCase
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  type: MessageType
  file_url: string | null
  file_name: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  // Joined
  sender?: Profile
}

// ============================================================
// VALORACIONES
// ============================================================

export interface Review {
  id: string
  reviewer_id: string
  lawyer_id: string | null
  firm_id: string | null
  case_id: string | null
  rating: number
  title: string | null
  comment: string | null
  rating_communication: number | null
  rating_expertise: number | null
  rating_value: number | null
  rating_responsiveness: number | null
  is_verified: boolean
  is_visible: boolean
  created_at: string
  // Joined
  reviewer?: Profile
  reply?: ReviewReply
}

export interface ReviewReply {
  id: string
  review_id: string
  author_id: string
  content: string
  created_at: string
}

// ============================================================
// NOTIFICACIONES
// ============================================================

export interface Notification {
  id: string
  user_id: string
  type: 'message' | 'proposal' | 'case_update' | 'review' | 'system'
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

// ============================================================
// FORMULARIOS
// ============================================================

export interface PostCaseForm {
  title: string
  description: string
  category_id: string
  province_id: number
  urgency: UrgencyLevel
  visibility: CaseVisibility
  budget_min?: number
  budget_max?: number
  documents?: File[]
}

export interface LawyerSearchFilters {
  query?: string
  category_id?: string
  province_id?: number
  min_rating?: number
  plan?: PlanType[]
  verification_status?: VerificationStatus
  accepts_new_clients?: boolean
  page?: number
  per_page?: number
  sort?: 'rating' | 'experience' | 'response_time' | 'relevance'
}

export interface SearchResults<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}
