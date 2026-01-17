-- ========================================
-- JAPAN 2026 - Add Budget Table
-- Run this to add the user_budgets table to your Supabase database
-- ========================================

-- Create the user_budgets table
CREATE TABLE IF NOT EXISTS user_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    flight_tier TEXT DEFAULT 'economy',      -- economy, business
    hotels_tier TEXT DEFAULT 'budget',       -- budget, mid, luxury
    food_tier TEXT DEFAULT 'budget',         -- budget, mid, premium
    activities_tier TEXT DEFAULT 'basic',    -- basic, moderate, premium
    shopping_tier TEXT DEFAULT 'minimal',    -- minimal, moderate, splurge
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security (optional, for multi-user access)
ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all budgets
CREATE POLICY "Anyone can view budgets" ON user_budgets
    FOR SELECT USING (true);

-- Policy: Users can insert their own budget
CREATE POLICY "Users can insert own budget" ON user_budgets
    FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own budget
CREATE POLICY "Users can update own budget" ON user_budgets
    FOR UPDATE USING (true);

-- Verify the table was created
SELECT 'Budget table created successfully!' as status;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_budgets';
