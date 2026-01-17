-- ========================================
-- Clear User Dates and Budgets
-- Run this in Supabase SQL Editor
-- ========================================

-- Clear all availability (saved dates)
DELETE FROM availability;

-- Clear all budget selections
DELETE FROM user_budgets;

-- Optional: Also clear destination day selections
-- Uncomment the line below if you want to reset those too
-- DELETE FROM user_city_days;

-- Verify the data was cleared
SELECT 'Availability records:' as table_name, COUNT(*) as count FROM availability
UNION ALL
SELECT 'Budget records:', COUNT(*) FROM user_budgets
UNION ALL
SELECT 'City day records:', COUNT(*) FROM user_city_days;
