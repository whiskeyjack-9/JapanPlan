-- ========================================
-- JAPAN 2026 - Seed 40 Activities Data
-- ⚠️  WARNING: This script DELETES existing attractions and cities!
-- ========================================

-- ========================================
-- STEP 1: ADD TIME_ESTIMATE COLUMN (if not exists)
-- ========================================
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS time_estimate TEXT;

-- ========================================
-- STEP 2: DELETE EXISTING DATA
-- ========================================
DELETE FROM attraction_votes;
DELETE FROM user_city_days;
DELETE FROM attractions;
DELETE FROM cities;

-- ========================================
-- STEP 3: INSERT NEW CITIES/DESTINATIONS
-- ========================================
INSERT INTO cities (name, japanese_name, description, image_url, highlights) VALUES
    ('Tokyo', '東京', 'Japan''s electric capital—world-class neighborhoods for food, fashion, nightlife, pop culture, and modern design.', 'https://img.static-kl.com/transform/216337e7-bfe5-4aa6-9c9e-180c3e5ac6a2/', ARRAY['Shibuya', 'Senso-ji', 'Akihabara', 'Shinjuku', 'teamLab']),
    ('Kyoto', '京都', 'Japan''s cultural heart—temples, shrines, gardens, and traditional neighborhoods with timeless atmosphere.', 'https://www.mensjournal.com/.image/w_3840,q_auto:good,c_fill,ar_16:9/MTk2MTM2NjY0Mzg4MzQ3MDI1/kyoto.jpg', ARRAY['Fushimi Inari', 'Golden Pavilion', 'Arashiyama', 'Gion', 'Tea Ceremony']),
    ('Osaka', '大阪', 'Japan''s fun-loving food city—street eats, neon nights, and big-theme-park energy.', 'https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/bltaf46149264e88b48/6781593f1cd05fd46a4b089c/BCC-2024-EXPLORER-OSAKA-FUN-THINGS-TO-DO-IN-OSAKA-HEADER_MOBILE.jpg?fit=crop&disable=upscale&auto=webp&quality=60&crop=smart', ARRAY['Dotonbori', 'Kuromon Market', 'Universal Studios', 'Osaka Castle']),
    ('Nara', '奈良', 'A compact, walkable temple city—famous for deer, grand religious sites, and relaxed green spaces.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/35/6d/56/photo0jpg.jpg?w=900&h=500&s=1', ARRAY['Deer Park', 'Todaiji Buddha', 'Kasuga Shrine']),
    ('Miyajima', '宮島', 'A sacred island escape—shrine scenery, forested hikes, and postcard views across the bay.', 'https://www.onthegotours.com/repository/Miyajima-Highlight--Web-Ready-310971470221913.jpg', ARRAY['Itsukushima Shrine', 'Mount Misen', 'Floating Torii']),
    ('Hakone', '箱根', 'Japan''s most iconic landscape zone—Fuji views, volcanic terrain, lake cruises, and onsen relaxation.', 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=800&q=80', ARRAY['Mt. Fuji Views', 'Onsen Ryokan', 'Open-Air Museum', 'Scenic Loop']),
    ('Kanazawa', '金沢', 'A refined "little Kyoto" vibe—gardens, preserved districts, and top-tier craft traditions.', 'https://japanculturalexpo.bunka.go.jp/en/article/route/202312/assets/img/main.jpg', ARRAY['Kenrokuen Garden', 'Historic Districts', 'Crafts']),
    ('Shirakawa-go', '白川郷', 'A UNESCO farmhouse village in the Japanese Alps—storybook roofs and rural scenery.', 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ogi_Shirakawa-g%C5%8D%2C_Gifu%2C_Japan.jpg', ARRAY['Gassho-zukuri Houses', 'Mountain Views', 'Traditional Village']),
    ('Nikko', '日光', 'A shrine-and-nature destination north of Tokyo—ornate architecture set in forested mountains.', 'https://ik.imgkit.net/3vlqs5axxjf/TW/ik-seo/uploadedImages/All_TW_Art/2019/0121/T0121KEGONFALLS_HR/Escape-into-nature-and-culture-in-Nikko-Japan.jpg?width=1540&height=866&mode=crop&Anchor=MiddleCenter&tr=w-780%2Ch-440%2Cfo-auto', ARRAY['Toshogu Shrines', 'Cedar Paths', 'Waterfalls']),
    ('Koyasan', '高野山', 'A spiritual mountain town—temples, quiet forests, and one of Japan''s most memorable cemeteries.', 'https://visitwakayama.jp/lsc/upfile/courseDetail/0000/0061/61_1_l.jpg', ARRAY['Temple Stay', 'Okunoin Cemetery', 'Shojin Ryori']),
    ('Naoshima', '直島', 'An art island in the Seto Inland Sea—architectural museums, outdoor sculptures, and coastal cycling.', 'https://media.cntraveler.com/photos/62c64b9bdfd97d8fbbe8a0e8/16:9/w_2560%2Cc_limit/Hiroshi%2520Sugimoto%25E2%2580%2599s%2520Glass%2520Tea%2520House%2520Mondrian_%25C2%25A9%2520Sugimoto%2520Studio_Glass%2520tea%2520house%2520at%2520Noshima023.jpg', ARRAY['Art Museums', 'Yayoi Kusama Pumpkin', 'Island Cycling']),
    ('Okinawa', '沖縄', 'Japan''s subtropical islands—beaches, coral reefs, relaxed pace, and a distinct local culture.', 'https://www.smartluxury.com/_next/image?url=https%3A%2F%2Fstweb-cdn.shermanstravel.com%2F2025-okinawa%2Fokinawa-aerial.jpg&w=1440&q=75', ARRAY['Snorkeling', 'Beaches', 'Ryukyu Culture']);

-- ========================================
-- STEP 4: INSERT 40 ATTRACTIONS WITH TIME ESTIMATES
-- ========================================

-- TOKYO (8 activities)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Tokyo Shopping Districts', (SELECT id FROM cities WHERE name = 'Tokyo'), 'From Ginza luxury flagships to Shibuya streetwear and Harajuku–Omotesando style—Tokyo''s retail zones feel like different worlds.', '3–8 hrs', 'https://i0.wp.com/www.touristjapan.com/wp-content/uploads/2018/08/Tokyos-Best-Shopping-Districts3.jpg?resize=800%2C450&ssl=1'),
    ('Shibuya Scramble Crossing', (SELECT id FROM cities WHERE name = 'Tokyo'), 'Iconic crossing energy, Hachikō, towering screens, and endlessly browseable side streets.', '2–4 hrs', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80'),
    ('Senso-ji and Nakamise Street', (SELECT id FROM cities WHERE name = 'Tokyo'), 'Old-Tokyo charm—lantern-lit temple gates and a classic snack-and-souvenir street approach.', '2–4 hrs', 'https://nightscape.tokyo/en/wp-content/uploads/2023/01/asakusa-sakura-01.jpg'),
    ('Meiji Shrine and Yoyogi Park', (SELECT id FROM cities WHERE name = 'Tokyo'), 'A peaceful forested shrine precinct that feels miles away from the city—perfect reset between busy days.', '1.5–3 hrs', 'https://www.exploreshaw.com/wp-content/uploads/2016/05/IMG_9024.jpg'),
    ('Tsukiji Outer Market Crawl', (SELECT id FROM cities WHERE name = 'Tokyo'), 'A lively food market for sushi, grilled seafood, knives, and matcha treats—arrive hungry.', '1.5–3 hrs', 'https://www.ninjafoodtours.com/wp-content/uploads/2025/06/michael-demarco-QkM2yEQcuSA-unsplash-scaled-e1750488726893.jpg'),
    ('Shinjuku Night Alleys', (SELECT id FROM cities WHERE name = 'Tokyo'), 'Skyline views followed by lantern alleys and tiny bars—Tokyo nightlife in high definition.', '3–5 hrs', 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&q=80'),
    ('teamLab Digital Art', (SELECT id FROM cities WHERE name = 'Tokyo'), 'Walk-through light and sound installations that feel like stepping inside an interactive dream.', '2–3 hrs', 'https://artart-uploads.s3.amazonaws.com/2018/07/pasted-image-0-25-2.webp'),
    ('Akihabara Pop Culture', (SELECT id FROM cities WHERE name = 'Tokyo'), 'The epicenter of anime and electronics—gadgets, collectibles, themed cafés, and multi-floor arcades.', '2–4 hrs', 'https://animota.net/cdn/shop/articles/blog_akihabara.png?v=1757387608');

-- KYOTO (7 activities)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Fushimi Inari Torii Walk', (SELECT id FROM cities WHERE name = 'Kyoto'), 'Thousands of vermillion torii gates winding up a wooded mountain—iconic, cinematic, unforgettable.', '2–4 hrs', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoInagK8JybmfPlTMPAw2wX3YZhXQRh2UgBQ&s'),
    ('Kiyomizu-dera and Higashiyama', (SELECT id FROM cities WHERE name = 'Kyoto'), 'A classic temple veranda view, then historic lanes filled with crafts, sweets, and photogenic corners.', '3–5 hrs', 'https://www.toobusyto.org.uk/ctt/posts/2023/11/kyoto-kiyomizu-dera-temple-higashiyama-district/DSZ_2000%20RP.jpeg'),
    ('Arashiyama Bamboo and River', (SELECT id FROM cities WHERE name = 'Kyoto'), 'Bamboo, river scenery, and serene temples—Kyoto''s most "storybook" day out.', '4–6 hrs', 'https://japanspecialist.com/documents/d/japanspecialist/1-arashiyama-beyond-the-bamboo'),
    ('Gion Evening Stroll', (SELECT id FROM cities WHERE name = 'Kyoto'), 'Lantern-lit streets and wooden machiya facades—Kyoto at its most atmospheric after dark.', '1.5–3 hrs', 'https://www.chrisrowthorn.com/wp-content/uploads/2016/01/Gion-at-Night-Walk-4.jpg'),
    ('Nishiki Market Tasting', (SELECT id FROM cities WHERE name = 'Kyoto'), '"Kyoto''s kitchen"—pick-and-try local bites, pickles, sweets, and seasonal specialties.', '1.5–3 hrs', 'https://cdn-imgix.headout.com/media/images/c137d8b6f8bf01224170ed9686811528-21415-tokyo-kyoto-nishiki-market-food-tour-01.jpg?w=1041.6000000000001&h=651&crop=faces&auto=compress%2Cformat&fit=min'),
    ('Golden Pavilion Visit', (SELECT id FROM cities WHERE name = 'Kyoto'), 'A gold-leaf pavilion mirrored in a pond—short visit, huge visual payoff.', '1–2 hrs', 'https://res.klook.com/image/upload/q_85/c_fill,w_750/v1756171807/zdqjodrqc2h8vicnzzhr.jpg'),
    ('Kyoto Tea Ceremony', (SELECT id FROM cities WHERE name = 'Kyoto'), 'A calm, guided introduction to Japanese aesthetics and ritual—memorable and grounding.', '1–2 hrs', 'https://orizuruya.net/wp-content/themes/oriduruya/assets/img/top/fv.webp');

-- OSAKA (5 activities)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Dotonbori Neon Night', (SELECT id FROM cities WHERE name = 'Osaka'), 'A neon canal of takoyaki, okonomiyaki, and people-watching—pure Osaka.', '2–4 hrs', 'https://cdn.gaijinpot.com/app/uploads/sites/4/2014/04/dotonburi.jpg'),
    ('Kuromon Market Bites', (SELECT id FROM cities WHERE name = 'Osaka'), 'Fresh seafood, fruit, skewers, and quick bites—ideal lunch stop for grazers.', '1.5–3 hrs', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/e0/90/c2/kuromon-market.jpg?w=900&h=500&s=1'),
    ('Universal Studios Japan', (SELECT id FROM cities WHERE name = 'Osaka'), 'High-production rides and immersive themed areas—plan early, stay late.', '8–12 hrs', 'https://s-light.tiket.photos/t/01E25EBZS3W0FY9GTG6C42E1SE/rsfit19201280gsm/events/2025/08/27/9e1f179b-207a-47f8-bbf9-db283502e724-1756276085036-d99db84066364164c42e4897f3ae0d98.jpg'),
    ('Osaka Castle Grounds', (SELECT id FROM cities WHERE name = 'Osaka'), 'A historic landmark framed by moats and gardens—great for a scenic stroll.', '2–3.5 hrs', 'https://res.klook.com/image/upload/fl_lossy.progressive,q_60/v1755071491/destination/rln18ze4qicniwhvxwu5.jpg'),
    ('Umeda Skyline Views', (SELECT id FROM cities WHERE name = 'Osaka'), 'Big-city panoramas and sleek shopping and food complexes—especially good at sunset.', '1.5–2.5 hrs', 'https://cdn2.veltra.com/ptr/20250403073915_144831255_15793_0.jpg');

-- NARA (2 activities)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Nara Park and Deer', (SELECT id FROM cities WHERE name = 'Nara'), 'Friendly deer roaming open lawns—equal parts cute and chaotic.', '2–4 hrs', 'https://donnykimball.com/wp-content/uploads/2023/08/A-Deer-in-front-of-Todai-ji-in-Nara-Prefecture.webp'),
    ('Todaiji Great Buddha', (SELECT id FROM cities WHERE name = 'Nara'), 'A monumental wooden hall housing an enormous Buddha—jaw-dropping scale.', '1–2 hrs', 'https://www.nippon.com/en/ncommon/contents/guide-to-japan/2412601/2412601.jpg');

-- MIYAJIMA (2 activities)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Itsukushima Shrine Views', (SELECT id FROM cities WHERE name = 'Miyajima'), 'One of Japan''s most famous waterfront shrines—especially magical near high tide.', '1.5–3 hrs', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXrESijrHA9I7jzPIp3Y49nRRm1MejGjTLIA&s'),
    ('Mount Misen Hike', (SELECT id FROM cities WHERE name = 'Miyajima'), 'Panoramic viewpoints above the Seto Inland Sea—worth the climb for the vistas.', '3–5 hrs', 'https://images.ctfassets.net/cynoqtn1y5gl/12942_015/8497c4b941aa83fbc6d9fbd02aed5687/12942_015.jpg?fit=fill&w=918&fm=webp');

-- HAKONE (5 activities)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Climb Mount Fuji', (SELECT id FROM cities WHERE name = 'Hakone'), 'A bucket-list sunrise climb above the clouds—physically demanding but deeply rewarding.', '12–18 hrs', 'https://d36tnp772eyphs.cloudfront.net/blogs/1/2018/08/Mount-Fuji.jpg'),
    ('Fuji Five Lakes Day Trip', (SELECT id FROM cities WHERE name = 'Hakone'), 'Classic Fuji photo angles, lakeside cafés, and easy scenic walks—best with clear skies.', '6–10 hrs', 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/15/85/46/fd.jpg'),
    ('Hakone Onsen Ryokan Stay', (SELECT id FROM cities WHERE name = 'Hakone'), 'The quintessential onsen experience—hot springs, quiet views, and an unhurried kaiseki meal.', 'Overnight', 'https://www.travelandleisure.com/thmb/SXh3LhAfY9GlICz8nEiiQ-WGYVg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/TAL-header-takaragawa-onsen-osenkaku-hot-spring-HOTSPRINGHTL1222-b74c0500acc6463d9767c8249f6437e3.jpg'),
    ('Hakone Open-Air Museum', (SELECT id FROM cities WHERE name = 'Hakone'), 'Sculptures in a mountain garden setting—art and nature in perfect balance.', '2–3.5 hrs', 'https://upload.wikimedia.org/wikipedia/commons/9/91/Hakone5.jpg'),
    ('Hakone Scenic Loop', (SELECT id FROM cities WHERE name = 'Hakone'), 'A greatest-hits circuit of ropeways, volcanic scenery, and lake cruising—varied and fun.', '6–8 hrs', 'https://japanherewecome.com/wp-content/uploads/2023/11/Hakone-Jinja-Torii-Gate-Lake-Ashi-Japan.webp');

-- KANAZAWA (2 activities)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Kenrokuen Garden Walk', (SELECT id FROM cities WHERE name = 'Kanazawa'), 'One of Japan''s most celebrated landscape gardens—best enjoyed slowly.', '1.5–3 hrs', 'https://cdn.audleytravel.com/2758/1967/79/1314567-kenrokuen-garden-kanazawa.jpg'),
    ('Kanazawa Historic Districts', (SELECT id FROM cities WHERE name = 'Kanazawa'), 'Teahouse streets and old residences—excellent for photos, crafts, and matcha breaks.', '3–5 hrs', 'https://imgcp.aacdn.jp/img-a/1200/900/global-aaj-front/article/2017/02/58aa694811751_58aa68dc207ab_257986910.jpg');

-- SHIRAKAWA-GO (1 activity)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Shirakawa-go Farmhouses', (SELECT id FROM cities WHERE name = 'Shirakawa-go'), 'Thatched gassho-zukuri homes in a valley setting—feels like stepping into a folktale.', '3–5 hrs', 'https://farm8.staticflickr.com/7793/18300466355_d8782a1c4a_c.jpg');

-- NIKKO (1 activity)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Nikko Toshogu Shrines', (SELECT id FROM cities WHERE name = 'Nikko'), 'Highly detailed, colorful shrine complexes and cedar-lined paths—history meets nature.', '4–7 hrs', 'https://upload.wikimedia.org/wikipedia/commons/2/26/200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg');

-- KOYASAN (1 activity)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Koyasan Temple Stay', (SELECT id FROM cities WHERE name = 'Koyasan'), 'Sleep at a temple, eat shojin ryori, and walk Okunoin—peaceful and profound.', 'Overnight', 'https://i.natgeofe.com/n/c2dfff24-f3a7-4fd5-96e8-352a96efad5c/Japan2.jpg');

-- NAOSHIMA (1 activity)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Naoshima Art Island Day', (SELECT id FROM cities WHERE name = 'Naoshima'), 'World-class contemporary art in bold architecture—best enjoyed at an unhurried pace.', '6–10 hrs', 'https://www.neverendingvoyage.com/wp-content/uploads/2019/11/naoshima-island-5.jpg');

-- OKINAWA (1 activity)
INSERT INTO attractions (name, city_id, description, time_estimate, image_url) VALUES
    ('Okinawa Snorkeling and Beaches', (SELECT id FROM cities WHERE name = 'Okinawa'), 'Clear water and reef life—choose a guided snorkel or dive for the best spots and safety.', '3–6 hrs', 'https://img.activityjapan.com/wi/okinawa_bluegrotto_whereisgood_003.jpg');

-- ========================================
-- STEP 5: VERIFY THE DATA
-- ========================================
SELECT 'Cities count:' as info, COUNT(*) as count FROM cities
UNION ALL
SELECT 'Attractions count:', COUNT(*) FROM attractions;

-- Show cities with their attraction counts
SELECT c.name as city, COUNT(a.id) as attractions
FROM cities c
LEFT JOIN attractions a ON a.city_id = c.id
GROUP BY c.name
ORDER BY attractions DESC, c.name;
