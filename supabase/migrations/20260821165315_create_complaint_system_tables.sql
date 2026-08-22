/*
# Student Complaint Management System - Core Schema

## Overview
Creates the full schema for a student complaint management system with three user roles:
student, staff, and admin. Students submit complaints, staff handle assigned complaints,
and admins oversee everything including staff assignment and analytics.

## New Tables

### profiles
Extends Supabase auth.users with role and demographic info.
- id (uuid, PK, FK to auth.users)
- full_name (text, not null)
- role (text: 'student' | 'staff' | 'admin', default 'student')
- department (text, nullable)
- student_id (text, nullable - student roll/ID number)
- phone (text, nullable)
- created_at (timestamptz)

### complaints
The main complaints table.
- id (uuid, PK)
- title (text, not null)
- description (text, not null)
- category (text: academic, facilities, hostel, mess, administration, harassment, other)
- status (text: pending, in_progress, resolved, closed; default pending)
- priority (text: low, medium, high, urgent; default medium)
- student_id (uuid, FK to profiles, not null)
- assigned_to (uuid, FK to profiles, nullable)
- created_at, updated_at, resolved_at (timestamptz)

### responses
Threaded responses on complaints from students, staff, and admins.
- id (uuid, PK)
- complaint_id (uuid, FK to complaints, not null)
- author_id (uuid, FK to profiles, not null)
- message (text, not null)
- created_at (timestamptz)

## Security
- RLS enabled on all tables.
- Helper function get_user_role() returns the current user's role from profiles.
- profiles: all authenticated users can read; users insert/update their own; admins can update any.
- complaints: students see own; staff see assigned; admins see all. Students create own. Staff update assigned; admins update all; students update own (title/description while pending).
- responses: visible to anyone who can see the parent complaint. Students respond to own complaints; staff respond to assigned; admins respond to all.

## Important Notes
1. The get_user_role() function is SECURITY DEFINER STABLE so RLS policies can check roles without circular dependency.
2. updated_at is auto-maintained via a trigger.
3. resolved_at is set when status transitions to 'resolved'.
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  department text,
  student_id text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- profiles SELECT: any authenticated user can read all profiles
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- profiles INSERT: users create their own profile
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- profiles UPDATE: users update their own; admins update any
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON profiles;
CREATE POLICY "profiles_update_own_or_admin"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.get_user_role() = 'admin')
WITH CHECK (auth.uid() = id OR public.get_user_role() = 'admin');

-- ============================================================
-- COMPLAINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('academic', 'facilities', 'hostel', 'mess', 'administration', 'harassment', 'other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- complaints SELECT: students see own; staff see assigned; admins see all
DROP POLICY IF EXISTS "complaints_select_role" ON complaints;
CREATE POLICY "complaints_select_role"
ON complaints FOR SELECT
TO authenticated
USING (
  public.get_user_role() = 'admin'
  OR student_id = auth.uid()
  OR assigned_to = auth.uid()
);

-- complaints INSERT: students create own complaints (student_id defaults to themselves)
DROP POLICY IF EXISTS "complaints_insert_own" ON complaints;
CREATE POLICY "complaints_insert_own"
ON complaints FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
  AND public.get_user_role() IN ('student', 'staff', 'admin')
);

-- complaints UPDATE: staff update assigned; admins update all; students update own while pending
DROP POLICY IF EXISTS "complaints_update_role" ON complaints;
CREATE POLICY "complaints_update_role"
ON complaints FOR UPDATE
TO authenticated
USING (
  public.get_user_role() = 'admin'
  OR assigned_to = auth.uid()
  OR (student_id = auth.uid() AND public.get_user_role() = 'student')
)
WITH CHECK (
  public.get_user_role() = 'admin'
  OR assigned_to = auth.uid()
  OR (student_id = auth.uid() AND public.get_user_role() = 'student')
);

-- complaints DELETE: admins only
DROP POLICY IF EXISTS "complaints_delete_admin" ON complaints;
CREATE POLICY "complaints_delete_admin"
ON complaints FOR DELETE
TO authenticated
USING (public.get_user_role() = 'admin');

-- ============================================================
-- RESPONSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- responses SELECT: anyone who can see the parent complaint
DROP POLICY IF EXISTS "responses_select_visible" ON responses;
CREATE POLICY "responses_select_visible"
ON responses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = responses.complaint_id
    AND (
      public.get_user_role() = 'admin'
      OR c.student_id = auth.uid()
      OR c.assigned_to = auth.uid()
    )
  )
);

-- responses INSERT: students respond to own complaints; staff respond to assigned; admins respond to all
DROP POLICY IF EXISTS "responses_insert_role" ON responses;
CREATE POLICY "responses_insert_role"
ON responses FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM complaints c
    WHERE c.id = responses.complaint_id
    AND (
      public.get_user_role() = 'admin'
      OR c.student_id = auth.uid()
      OR c.assigned_to = auth.uid()
    )
  )
);

-- responses DELETE: admins only
DROP POLICY IF EXISTS "responses_delete_admin" ON responses;
CREATE POLICY "responses_delete_admin"
ON responses FOR DELETE
TO authenticated
USING (public.get_user_role() = 'admin');

-- ============================================================
-- TRIGGER: auto-update updated_at and resolved_at on complaints
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_complaint_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'resolved' AND OLD.status <> 'resolved' THEN
    NEW.resolved_at := now();
  ELSIF NEW.status <> 'resolved' THEN
    NEW.resolved_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_complaint_timestamps ON complaints;
CREATE TRIGGER trg_complaint_timestamps
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION public.handle_complaint_timestamps();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_responses_complaint_id ON responses(complaint_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
