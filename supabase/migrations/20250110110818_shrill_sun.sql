/*
  # Initial Schema Setup for Travel Planner

  1. New Tables
    - profiles: User profile information
    - itineraries: Travel itinerary details
    - activities: Itinerary activities
    - collaborators: Itinerary sharing and permissions
    - expenses: Budget tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Set up user profile creation trigger
*/

-- Create tables first, then add policies
DO $$ BEGIN

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Create itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL,
  name text NOT NULL,
  date timestamptz,
  location text,
  cost decimal(10,2),
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
);

-- Create collaborators table
CREATE TABLE IF NOT EXISTS collaborators (
  itinerary_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  PRIMARY KEY (itinerary_id, user_id),
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT valid_role CHECK (role IN ('viewer', 'editor'))
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
);

END $$;

-- Enable RLS
DO $$ BEGIN
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
  ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
  ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
END $$;

-- Create policies
DO $$ BEGIN

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Itineraries policies
CREATE POLICY "Users can view own itineraries"
  ON itineraries FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE itinerary_id = itineraries.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create itineraries"
  ON itineraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries"
  ON itineraries FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE itinerary_id = itineraries.id 
      AND user_id = auth.uid()
      AND role = 'editor'
    )
  );

CREATE POLICY "Users can delete own itineraries"
  ON itineraries FOR DELETE
  USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view activities of accessible itineraries"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM itineraries i
      LEFT JOIN collaborators c ON c.itinerary_id = i.id
      WHERE i.id = activities.itinerary_id
      AND (i.user_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create activities in accessible itineraries"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM itineraries i
      LEFT JOIN collaborators c ON c.itinerary_id = i.id
      WHERE i.id = itinerary_id
      AND (i.user_id = auth.uid() OR (c.user_id = auth.uid() AND c.role = 'editor'))
    )
  );

-- Collaborators policies
CREATE POLICY "Users can view collaborators of accessible itineraries"
  ON collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM itineraries i
      WHERE i.id = itinerary_id
      AND (i.user_id = auth.uid() OR user_id = auth.uid())
    )
  );

-- Expenses policies
CREATE POLICY "Users can view expenses of accessible itineraries"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM itineraries i
      LEFT JOIN collaborators c ON c.itinerary_id = i.id
      WHERE i.id = expenses.itinerary_id
      AND (i.user_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

END $$;

-- Create function for handling new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();