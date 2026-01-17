-- ========================================
-- JAPAN 2026 - BACKUP CURRENT DATA
-- Run this FIRST before running the seed script
-- ========================================

-- First, let's see what data exists:
SELECT 'CITIES IN DATABASE:' as info;
SELECT id, name, japanese_name FROM cities ORDER BY name;

SELECT 'ATTRACTIONS IN DATABASE:' as info;
SELECT a.id, a.name, c.name as city 
FROM attractions a 
LEFT JOIN cities c ON a.city_id = c.id 
ORDER BY c.name, a.name;

SELECT 'VOTES IN DATABASE:' as info;
SELECT COUNT(*) as vote_count FROM attraction_votes;

SELECT 'USER CITY DAYS IN DATABASE:' as info;
SELECT COUNT(*) as allocation_count FROM user_city_days;
