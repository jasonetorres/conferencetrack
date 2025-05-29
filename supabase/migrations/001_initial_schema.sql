-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  profile_picture TEXT,
  socials JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create contacts table
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  met_at TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  socials JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qr_settings table
CREATE TABLE qr_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bg_color TEXT DEFAULT '#FFFFFF',
  fg_color TEXT DEFAULT '#000000',
  page_background_color TEXT DEFAULT '#FFFFFF',
  card_background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#000000',
  show_name BOOLEAN DEFAULT true,
  show_title BOOLEAN DEFAULT true,
  show_company BOOLEAN DEFAULT true,
  show_contact BOOLEAN DEFAULT true,
  show_socials BOOLEAN DEFAULT true,
  show_profile_picture BOOLEAN DEFAULT true,
  layout_style TEXT DEFAULT 'card',
  qr_size INTEGER DEFAULT 220,
  border_radius INTEGER DEFAULT 12,
  card_padding INTEGER DEFAULT 24,
  font_family TEXT DEFAULT 'Inter',
  font_size INTEGER DEFAULT 14,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for contacts
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for qr_settings
CREATE POLICY "Users can view own qr_settings" ON qr_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own qr_settings" ON qr_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own qr_settings" ON qr_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_qr_settings_user_id ON qr_settings(user_id);
