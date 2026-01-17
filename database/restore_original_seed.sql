-- ========================================
-- JAPAN 2026 - RESTORE ORIGINAL SEED DATA
-- Run this to revert back to the original 8 cities and 16 attractions
-- ========================================

-- Clear everything first
DELETE FROM attraction_votes;
DELETE FROM user_city_days;
DELETE FROM attractions;
DELETE FROM cities;

-- ========================================
-- RESTORE ORIGINAL 8 CITIES
-- ========================================
INSERT INTO cities (name, japanese_name, description, image_url, highlights) VALUES
    ('Tokyo', '東京', 'Japan''s bustling capital, mixing ultramodern and traditional. From neon-lit Shibuya to historic temples, Tokyo offers endless discovery.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', ARRAY['Shibuya Crossing', 'Senso-ji Temple', 'Akihabara', 'Shinjuku']),
    ('Kyoto', '京都', 'The cultural heart of Japan with over 2,000 temples and shrines. Experience geishas, zen gardens, and timeless traditions.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', ARRAY['Fushimi Inari', 'Golden Pavilion', 'Bamboo Grove', 'Gion']),
    ('Osaka', '大阪', 'Japan''s kitchen and comedy capital. Known for street food, vibrant nightlife, and the friendly local culture.', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80', ARRAY['Dotonbori', 'Osaka Castle', 'Universal Studios', 'Street Food']),
    ('Hiroshima', '広島', 'A city of peace and resilience. Visit the moving Peace Memorial and take a day trip to beautiful Miyajima Island.', 'https://images.unsplash.com/photo-1576675784201-0e142b423952?w=800&q=80', ARRAY['Peace Memorial', 'Miyajima Island', 'Itsukushima Shrine']),
    ('Nara', '奈良', 'Ancient capital where friendly deer roam free. Home to some of Japan''s oldest and most impressive temples.', 'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?w=800&q=80', ARRAY['Deer Park', 'Todai-ji Temple', 'Kasuga Shrine']),
    ('Hakone', '箱根', 'Mountain resort town famous for hot springs, outdoor museums, and stunning views of Mount Fuji.', 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=800&q=80', ARRAY['Mt. Fuji Views', 'Onsen', 'Open-Air Museum', 'Lake Ashi']),
    ('Nikko', '日光', 'UNESCO World Heritage site with ornate shrines set in beautiful forests and mountains.', 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800&q=80', ARRAY['Toshogu Shrine', 'Kegon Falls', 'Nature Trails']),
    ('Kanazawa', '金沢', 'Preserved Edo-era districts, beautiful gardens, and excellent seafood. Japan''s best-kept secret.', 'https://images.unsplash.com/photo-1617454316842-035d98f2a0d5?w=800&q=80', ARRAY['Kenroku-en Garden', 'Samurai District', 'Geisha Districts']);

-- ========================================
-- RESTORE ORIGINAL 16 ATTRACTIONS
-- ========================================
INSERT INTO attractions (name, city_id, description, image_url) VALUES
    ('Shibuya Crossing', (SELECT id FROM cities WHERE name = 'Tokyo'), 'The world''s busiest pedestrian crossing. Experience the organized chaos of thousands crossing at once.', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80'),
    ('Senso-ji Temple', (SELECT id FROM cities WHERE name = 'Tokyo'), 'Tokyo''s oldest temple in Asakusa. Walk through the iconic Thunder Gate and Nakamise shopping street.', 'https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=800&q=80'),
    ('teamLab Borderless', (SELECT id FROM cities WHERE name = 'Tokyo'), 'Immersive digital art museum where you become part of the artwork. A must-see modern experience.', 'https://images.unsplash.com/photo-1549277513-f1b32fe1f8f5?w=800&q=80'),
    ('Akihabara', (SELECT id FROM cities WHERE name = 'Tokyo'), 'Electronics and anime paradise. Multi-story arcades, maid cafes, and endless otaku culture.', 'https://images.unsplash.com/photo-1580050558209-8f1576a0e1a8?w=800&q=80'),
    ('Ghibli Museum', (SELECT id FROM cities WHERE name = 'Tokyo'), 'Whimsical museum dedicated to Studio Ghibli. Tickets sell out fast - book months in advance!', 'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800&q=80'),
    ('Fushimi Inari Shrine', (SELECT id FROM cities WHERE name = 'Kyoto'), 'Thousands of vermillion torii gates winding up a mountain. Iconic and unforgettable.', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80'),
    ('Kinkaku-ji (Golden Pavilion)', (SELECT id FROM cities WHERE name = 'Kyoto'), 'Stunning Zen temple covered in gold leaf, reflected perfectly in its surrounding pond.', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80'),
    ('Arashiyama Bamboo Grove', (SELECT id FROM cities WHERE name = 'Kyoto'), 'Walk through towering bamboo stalks in this ethereal forest. Best visited early morning.', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80'),
    ('Dotonbori', (SELECT id FROM cities WHERE name = 'Osaka'), 'Neon-lit entertainment district famous for the Glico Man sign. Street food heaven!', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80'),
    ('Osaka Castle', (SELECT id FROM cities WHERE name = 'Osaka'), 'Iconic castle with museum inside. Beautiful grounds especially during cherry blossom season.', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80'),
    ('Universal Studios Japan', (SELECT id FROM cities WHERE name = 'Osaka'), 'Theme park with unique attractions including the Wizarding World of Harry Potter and Super Nintendo World.', 'https://images.unsplash.com/photo-1581351123004-757df051db8e?w=800&q=80'),
    ('Hiroshima Peace Memorial', (SELECT id FROM cities WHERE name = 'Hiroshima'), 'Moving museum and memorial dedicated to atomic bomb victims. A profound, must-visit site.', 'https://images.unsplash.com/photo-1576675784201-0e142b423952?w=800&q=80'),
    ('Itsukushima Shrine', (SELECT id FROM cities WHERE name = 'Hiroshima'), 'Famous floating torii gate on Miyajima Island. One of Japan''s most photographed sights.', 'https://images.unsplash.com/photo-1505069190533-da1c9af13f7c?w=800&q=80'),
    ('Nara Deer Park', (SELECT id FROM cities WHERE name = 'Nara'), 'Over 1,000 friendly deer roam freely. Buy shika senbei crackers to feed them!', 'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?w=800&q=80'),
    ('Mount Fuji Viewing', (SELECT id FROM cities WHERE name = 'Hakone'), 'Spectacular views of Japan''s iconic mountain from various vantage points around Hakone.', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80'),
    ('Traditional Onsen Experience', (SELECT id FROM cities WHERE name = 'Hakone'), 'Soak in natural hot springs with mountain views. Many ryokans offer private onsen.', 'https://images.unsplash.com/photo-1553653924-39b70295f8da?w=800&q=80');

-- Verify
SELECT 'Restored:' as status, 
       (SELECT COUNT(*) FROM cities) as cities, 
       (SELECT COUNT(*) FROM attractions) as attractions;
