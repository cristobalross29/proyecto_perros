-- Create dogs table
CREATE TABLE dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create feedings table
CREATE TABLE feedings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS on both tables
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dogs table
CREATE POLICY "Users can view their own dogs" ON dogs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dogs" ON dogs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dogs" ON dogs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dogs" ON dogs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for feedings table
CREATE POLICY "Users can view their own feedings" ON feedings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedings" ON feedings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedings" ON feedings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedings" ON feedings
  FOR DELETE USING (auth.uid() = user_id);
