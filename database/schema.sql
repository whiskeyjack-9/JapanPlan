-- ========================================
-- JAPAN 2026 TRIP PLANNER - Supabase Schema
-- ========================================
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    initials TEXT,
    color TEXT DEFAULT '#ff5c8d',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the team members
INSERT INTO users (name, initials, color) VALUES
    ('Julian', 'J', '#ff5c8d'),
    ('Dave', 'D', '#5ce1e6'),
    ('Jason', 'Js', '#b06cff'),
    ('Frank', 'F', '#ff9a5c'),
    ('Cathy', 'C', '#ffd93d'),
    ('Matylda', 'M', '#4ade80'),
    ('Patryk', 'P', '#ff8fab')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- AVAILABILITY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    available_start DATE,
    available_end DATE,
    preferred_length_days INTEGER DEFAULT 14,
    preferred_start DATE,
    preferred_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ========================================
-- CITIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    japanese_name TEXT,
    description TEXT,
    image_url TEXT,
    highlights TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert seed cities
INSERT INTO cities (name, japanese_name, description, image_url, highlights) VALUES
    ('Tokyo', '東京', 'Japan''s bustling capital, mixing ultramodern and traditional. From neon-lit Shibuya to historic temples, Tokyo offers endless discovery.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', ARRAY['Shibuya Crossing', 'Senso-ji Temple', 'Akihabara', 'Shinjuku']),
    ('Kyoto', '京都', 'The cultural heart of Japan with over 2,000 temples and shrines. Experience geishas, zen gardens, and timeless traditions.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', ARRAY['Fushimi Inari', 'Golden Pavilion', 'Bamboo Grove', 'Gion']),
    ('Osaka', '大阪', 'Japan''s kitchen and comedy capital. Known for street food, vibrant nightlife, and the friendly local culture.', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80', ARRAY['Dotonbori', 'Osaka Castle', 'Universal Studios', 'Street Food']),
    ('Hiroshima', '広島', 'A city of peace and resilience. Visit the moving Peace Memorial and take a day trip to beautiful Miyajima Island.', 'https://images.unsplash.com/photo-1576675784201-0e142b423952?w=800&q=80', ARRAY['Peace Memorial', 'Miyajima Island', 'Itsukushima Shrine']),
    ('Nara', '奈良', 'Ancient capital where friendly deer roam free. Home to some of Japan''s oldest and most impressive temples.', 'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?w=800&q=80', ARRAY['Deer Park', 'Todai-ji Temple', 'Kasuga Shrine']),
    ('Hakone', '箱根', 'Mountain resort town famous for hot springs, outdoor museums, and stunning views of Mount Fuji.', 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=800&q=80', ARRAY['Mt. Fuji Views', 'Onsen', 'Open-Air Museum', 'Lake Ashi']),
    ('Nikko', '日光', 'UNESCO World Heritage site with ornate shrines set in beautiful forests and mountains.', 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800&q=80', ARRAY['Toshogu Shrine', 'Kegon Falls', 'Nature Trails']),
    ('Kanazawa', '金沢', 'Preserved Edo-era districts, beautiful gardens, and excellent seafood. Japan''s best-kept secret.', 'https://images.unsplash.com/photo-1617454316842-035d98f2a0d5?w=800&q=80', ARRAY['Kenroku-en Garden', 'Samurai District', 'Geisha Districts'])
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- USER CITY DAYS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_city_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city_id)
);

-- ========================================
-- ATTRACTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS attractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    description TEXT,
    image_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert seed attractions
INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Shibuya Crossing',
    (SELECT id FROM cities WHERE name = 'Tokyo'),
    'The world''s busiest pedestrian crossing. Experience the organized chaos of thousands crossing at once.',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Shibuya Crossing');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Senso-ji Temple',
    (SELECT id FROM cities WHERE name = 'Tokyo'),
    'Tokyo''s oldest temple in Asakusa. Walk through the iconic Thunder Gate and Nakamise shopping street.',
    'https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Senso-ji Temple');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'teamLab Borderless',
    (SELECT id FROM cities WHERE name = 'Tokyo'),
    'Immersive digital art museum where you become part of the artwork. A must-see modern experience.',
    'https://images.unsplash.com/photo-1549277513-f1b32fe1f8f5?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'teamLab Borderless');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Akihabara',
    (SELECT id FROM cities WHERE name = 'Tokyo'),
    'Electronics and anime paradise. Multi-story arcades, maid cafes, and endless otaku culture.',
    'https://images.unsplash.com/photo-1580050558209-8f1576a0e1a8?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Akihabara');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Ghibli Museum',
    (SELECT id FROM cities WHERE name = 'Tokyo'),
    'Whimsical museum dedicated to Studio Ghibli. Tickets sell out fast - book months in advance!',
    'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Ghibli Museum');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Fushimi Inari Shrine',
    (SELECT id FROM cities WHERE name = 'Kyoto'),
    'Thousands of vermillion torii gates winding up a mountain. Iconic and unforgettable.',
    'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Fushimi Inari Shrine');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Kinkaku-ji (Golden Pavilion)',
    (SELECT id FROM cities WHERE name = 'Kyoto'),
    'Stunning Zen temple covered in gold leaf, reflected perfectly in its surrounding pond.',
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Kinkaku-ji (Golden Pavilion)');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Arashiyama Bamboo Grove',
    (SELECT id FROM cities WHERE name = 'Kyoto'),
    'Walk through towering bamboo stalks in this ethereal forest. Best visited early morning.',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Arashiyama Bamboo Grove');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Dotonbori',
    (SELECT id FROM cities WHERE name = 'Osaka'),
    'Neon-lit entertainment district famous for the Glico Man sign. Street food heaven!',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Dotonbori');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Osaka Castle',
    (SELECT id FROM cities WHERE name = 'Osaka'),
    'Iconic castle with museum inside. Beautiful grounds especially during cherry blossom season.',
    'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Osaka Castle');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Universal Studios Japan',
    (SELECT id FROM cities WHERE name = 'Osaka'),
    'Theme park with unique attractions including the Wizarding World of Harry Potter and Super Nintendo World.',
    'https://images.unsplash.com/photo-1581351123004-757df051db8e?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Universal Studios Japan');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Hiroshima Peace Memorial',
    (SELECT id FROM cities WHERE name = 'Hiroshima'),
    'Moving museum and memorial dedicated to atomic bomb victims. A profound, must-visit site.',
    'https://images.unsplash.com/photo-1576675784201-0e142b423952?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Hiroshima Peace Memorial');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Itsukushima Shrine',
    (SELECT id FROM cities WHERE name = 'Hiroshima'),
    'Famous floating torii gate on Miyajima Island. One of Japan''s most photographed sights.',
    'https://images.unsplash.com/photo-1505069190533-da1c9af13f7c?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Itsukushima Shrine');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Nara Deer Park',
    (SELECT id FROM cities WHERE name = 'Nara'),
    'Over 1,000 friendly deer roam freely. Buy shika senbei crackers to feed them!',
    'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Nara Deer Park');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Mount Fuji Viewing',
    (SELECT id FROM cities WHERE name = 'Hakone'),
    'Spectacular views of Japan''s iconic mountain from various vantage points around Hakone.',
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Mount Fuji Viewing');

INSERT INTO attractions (name, city_id, description, image_url) 
SELECT 
    'Traditional Onsen Experience',
    (SELECT id FROM cities WHERE name = 'Hakone'),
    'Soak in natural hot springs with mountain views. Many ryokans offer private onsen.',
    'https://images.unsplash.com/photo-1553653924-39b70295f8da?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Traditional Onsen Experience');

-- ========================================
-- ATTRACTION VOTES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS attraction_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, attraction_id)
);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_city_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attraction_votes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since this is a trusted group app)
-- For users table
CREATE POLICY "Allow all access to users" ON users FOR ALL USING (true) WITH CHECK (true);

-- For availability table
CREATE POLICY "Allow all access to availability" ON availability FOR ALL USING (true) WITH CHECK (true);

-- For cities table
CREATE POLICY "Allow all access to cities" ON cities FOR ALL USING (true) WITH CHECK (true);

-- For user_city_days table
CREATE POLICY "Allow all access to user_city_days" ON user_city_days FOR ALL USING (true) WITH CHECK (true);

-- For attractions table
CREATE POLICY "Allow all access to attractions" ON attractions FOR ALL USING (true) WITH CHECK (true);

-- For attraction_votes table
CREATE POLICY "Allow all access to attraction_votes" ON attraction_votes FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- ENABLE REALTIME
-- ========================================
-- Run these in Supabase Dashboard > Database > Replication
-- Or use the following:
ALTER PUBLICATION supabase_realtime ADD TABLE availability;
ALTER PUBLICATION supabase_realtime ADD TABLE user_city_days;
ALTER PUBLICATION supabase_realtime ADD TABLE attraction_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE attractions;
ALTER PUBLICATION supabase_realtime ADD TABLE cities;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_availability_user_id ON availability(user_id);
CREATE INDEX IF NOT EXISTS idx_user_city_days_user_id ON user_city_days(user_id);
CREATE INDEX IF NOT EXISTS idx_user_city_days_city_id ON user_city_days(city_id);
CREATE INDEX IF NOT EXISTS idx_attractions_city_id ON attractions(city_id);
CREATE INDEX IF NOT EXISTS idx_attraction_votes_attraction_id ON attraction_votes(attraction_id);
CREATE INDEX IF NOT EXISTS idx_attraction_votes_user_id ON attraction_votes(user_id);
