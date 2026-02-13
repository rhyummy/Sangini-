-- ============================================================
-- LINK users.id TO auth.users
-- ============================================================

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_id_fkey;

ALTER TABLE users
ADD CONSTRAINT users_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- ============================================================
-- USERS POLICIES
-- ============================================================

DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_select_admin ON users;
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;

CREATE POLICY users_select_own
ON users FOR SELECT
USING (id = auth.uid());

CREATE POLICY users_select_admin
ON users FOR SELECT
USING (get_my_role() = 'admin');

CREATE POLICY users_insert_own
ON users FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY users_update_own
ON users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================
-- ASSESSMENTS POLICIES
-- ============================================================

DROP POLICY IF EXISTS assessments_select_own ON assessments;
DROP POLICY IF EXISTS assessments_insert_own ON assessments;
DROP POLICY IF EXISTS assessments_select_doctor ON assessments;
DROP POLICY IF EXISTS assessments_select_admin ON assessments;

CREATE POLICY assessments_select_own
ON assessments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY assessments_insert_own
ON assessments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY assessments_select_doctor
ON assessments FOR SELECT
USING (
  get_my_role() = 'doctor'
  AND user_id IN (
    SELECT patient_id FROM appointments WHERE doctor_id = auth.uid()
  )
);

CREATE POLICY assessments_select_admin
ON assessments FOR SELECT
USING (get_my_role() = 'admin');

-- ============================================================
-- APPOINTMENTS POLICIES
-- ============================================================

DROP POLICY IF EXISTS appointments_select_patient ON appointments;
DROP POLICY IF EXISTS appointments_select_doctor ON appointments;
DROP POLICY IF EXISTS appointments_insert_patient ON appointments;
DROP POLICY IF EXISTS appointments_update_doctor ON appointments;
DROP POLICY IF EXISTS appointments_update_patient ON appointments;
DROP POLICY IF EXISTS appointments_select_admin ON appointments;

CREATE POLICY appointments_select_patient
ON appointments FOR SELECT
USING (patient_id = auth.uid());

CREATE POLICY appointments_select_doctor
ON appointments FOR SELECT
USING (doctor_id = auth.uid());

CREATE POLICY appointments_insert_patient
ON appointments FOR INSERT
WITH CHECK (patient_id = auth.uid());

CREATE POLICY appointments_update_doctor
ON appointments FOR UPDATE
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY appointments_update_patient
ON appointments FOR UPDATE
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY appointments_select_admin
ON appointments FOR SELECT
USING (get_my_role() = 'admin');

-- ============================================================
-- POSTS POLICIES
-- ============================================================

DROP POLICY IF EXISTS posts_select_authenticated ON posts;
DROP POLICY IF EXISTS posts_insert_authenticated ON posts;
DROP POLICY IF EXISTS posts_update_own ON posts;
DROP POLICY IF EXISTS posts_delete_own ON posts;
DROP POLICY IF EXISTS posts_delete_admin ON posts;

CREATE POLICY posts_select_authenticated
ON posts FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY posts_insert_authenticated
ON posts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY posts_update_own
ON posts FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY posts_delete_own
ON posts FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY posts_delete_admin
ON posts FOR DELETE
USING (get_my_role() = 'admin');
