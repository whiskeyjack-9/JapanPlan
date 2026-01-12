// ========================================
// JAPAN 2026 TRIP PLANNER - Configuration
// ========================================

// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://qamzcfhtibvylshhvmoh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXpjZmh0aWJ2eWxzaGh2bW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTI5NzksImV4cCI6MjA4MzcyODk3OX0.7SPBewRL1AvVuh4ANo7dzTpp7iMMYaSOpj1-BVyHXgs';

// Trip Configuration
const TRIP_CONFIG = {
    // Date range for the trip planning
    minDate: '2026-07-01',
    maxDate: '2026-08-31',
    
    // Default trip length in days
    defaultTripLength: 14,
    minTripLength: 7,
    maxTripLength: 21,
    
    // Team members
    // Add avatar_url with path to profile pictures (e.g., 'images/avatars/julian.jpg')
    teamMembers: [
        { name: 'Julian', initials: 'J', color: '#ff5c8d', avatar_url: null },
        { name: 'Dave', initials: 'D', color: '#5ce1e6', avatar_url: null },
        { name: 'Jason', initials: 'Js', color: '#b06cff', avatar_url: null },
        { name: 'Frank', initials: 'F', color: '#ff9a5c', avatar_url: null },
        { name: 'Cathy', initials: 'C', color: '#ffd93d', avatar_url: null },
        { name: 'Matylda', initials: 'M', color: '#4ade80', avatar_url: null },
        { name: 'Patryk', initials: 'P', color: '#ff8fab', avatar_url: null }
    ]
};

// City image URLs (using Unsplash for beautiful free images)
const CITY_IMAGES = {
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80',
    'Hiroshima': 'https://images.unsplash.com/photo-1576675784201-0e142b423952?w=800&q=80',
    'Nara': 'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?w=800&q=80',
    'Hakone': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=800&q=80',
    'Nikko': 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800&q=80',
    'Kanazawa': 'https://images.unsplash.com/photo-1617454316842-035d98f2a0d5?w=800&q=80',
    'Fukuoka': 'https://images.unsplash.com/photo-1577702312793-8a5c3d7f5a0c?w=800&q=80',
    'Okinawa': 'https://images.unsplash.com/photo-1583359752538-8d17e3d26e8d?w=800&q=80'
};

// Attraction image URLs
const ATTRACTION_IMAGES = {
    'Shibuya Crossing': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
    'Senso-ji Temple': 'https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=800&q=80',
    'teamLab Borderless': 'https://images.unsplash.com/photo-1549277513-f1b32fe1f8f5?w=800&q=80',
    'Meiji Shrine': 'https://images.unsplash.com/photo-1583416770572-6c6ec71c7799?w=800&q=80',
    'Akihabara': 'https://images.unsplash.com/photo-1580050558209-8f1576a0e1a8?w=800&q=80',
    'Tokyo Skytree': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80',
    'Tsukiji Outer Market': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80',
    'Fushimi Inari Shrine': 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80',
    'Kinkaku-ji': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80',
    'Arashiyama Bamboo Grove': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    'Gion District': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    'Kiyomizu-dera Temple': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    'Osaka Castle': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80',
    'Dotonbori': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
    'Universal Studios Japan': 'https://images.unsplash.com/photo-1581351123004-757df051db8e?w=800&q=80',
    'Hiroshima Peace Memorial': 'https://images.unsplash.com/photo-1576675784201-0e142b423952?w=800&q=80',
    'Itsukushima Shrine': 'https://images.unsplash.com/photo-1505069190533-da1c9af13f7c?w=800&q=80',
    'Nara Deer Park': 'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?w=800&q=80',
    'Todai-ji Temple': 'https://images.unsplash.com/photo-1610375228550-d5cabc1d4090?w=800&q=80',
    'Mount Fuji': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80',
    'Hakone Ropeway': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=800&q=80',
    'Japanese Onsen Experience': 'https://images.unsplash.com/photo-1553653924-39b70295f8da?w=800&q=80',
    'Robot Restaurant': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    'Ghibli Museum': 'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800&q=80',
    'Shinjuku Golden Gai': 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&q=80'
};

// Japanese names for cities
const CITY_JAPANESE = {
    'Tokyo': '東京',
    'Kyoto': '京都',
    'Osaka': '大阪',
    'Hiroshima': '広島',
    'Nara': '奈良',
    'Hakone': '箱根',
    'Nikko': '日光',
    'Kanazawa': '金沢',
    'Fukuoka': '福岡',
    'Okinawa': '沖縄'
};
