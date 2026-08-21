import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type UserRole = 'student' | 'staff' | 'admin';

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  student_id: string | null;
  phone: string | null;
  created_at: string;
};

export type ComplaintCategory =
  | 'academic'
  | 'facilities'
  | 'hostel'
  | 'mess'
  | 'administration'
  | 'harassment'
  | 'other';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Complaint = {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  student_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  // joined fields
  student?: Profile;
  assignee?: Profile | null;
};

export type Response = {
  id: string;
  complaint_id: string;
  author_id: string;
  message: string;
  created_at: string;
  author?: Profile;
};
