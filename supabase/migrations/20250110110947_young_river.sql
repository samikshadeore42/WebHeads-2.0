/*
  # Fix Policies and User Handling

  1. Changes
    - Simplify itineraries policies to prevent recursion
    - Add insert policy for profiles
    - Fix user creation trigger
    - Add missing policies for activities and expenses
*/

-- Drop existing policies to recreate them
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own itineraries" ON itineraries;
  DROP POLICY IF EXISTS "Users can create itineraries" ON itineraries;
  DROP POLICY IF EXISTS "Users can update own itineraries" ON itineraries;
  DROP POLICY IF EXISTS "Users can delete own itineraries" ON itineraries;
  DROP POLICY IF EXISTS "Users can view activities of accessible itineraries" ON activities;
  DROP POLICY IF EXISTS "Users can create activities in accessible itineraries" ON activities;
  DROP POLICY IF EXISTS "Users can view expenses of accessible itineraries" ON expenses;
END $$;

-- Add insert policy for profiles
DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
END $$;

-- Simplified itineraries policies
DO $$ BEGIN
  -- View policy
  CREATE POLICY "Users can view own itineraries"
    ON itineraries FOR SELECT
    USING (user_id = auth.uid());

  -- Create policy
  CREATE POLICY "Users can create itineraries"
    ON itineraries FOR INSERT
    WITH CHECK (user_id = auth.uid());

  -- Update policy
  CREATE POLICY "Users can update own itineraries"
    ON itineraries FOR UPDATE
    USING (user_id = auth.uid());

  -- Delete policy
  CREATE POLICY "Users can delete own itineraries"
    ON itineraries FOR DELETE
    USING (user_id = auth.uid());
END $$;

-- Simplified activities policies
DO $$ BEGIN
  CREATE POLICY "Users can view activities"
    ON activities FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM itineraries
        WHERE id = activities.itinerary_id
        AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create activities"
    ON activities FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM itineraries
        WHERE id = itinerary_id
        AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update activities"
    ON activities FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM itineraries
        WHERE id = activities.itinerary_id
        AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete activities"
    ON activities FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM itineraries
        WHERE id = activities.itinerary_id
        AND user_id = auth.uid()
      )
    );
END $$;

-- Simplified expenses policies
DO $$ BEGIN
  CREATE POLICY "Users can view expenses"
    ON expenses FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM itineraries
        WHERE id = expenses.itinerary_id
        AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create expenses"
    ON expenses FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM itineraries
        WHERE id = itinerary_id
        AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update expenses"
    ON expenses FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM itineraries
        WHERE id = expenses.itinerary_id
        AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete expenses"
    ON expenses FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM itineraries
        WHERE id = expenses.itinerary_id
        AND user_id = auth.uid()
      )
    );
END $$;

-- Drop and recreate the user handling function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;