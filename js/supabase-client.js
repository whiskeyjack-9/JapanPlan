// ========================================
// JAPAN 2026 - Supabase Client & Database Operations
// ========================================

let supabaseClient = null;

// Initialize Supabase client
function initSupabase() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ Supabase not configured. Running in demo mode with local storage.');
        return false;
    }
    
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// ========================================
// USER OPERATIONS
// ========================================

async function getUsers() {
    // Helper function to return demo users from config
    function getDemoUsers() {
        return TRIP_CONFIG.teamMembers.map((member, index) => ({
            id: `demo-${index}`,
            name: member.name,
            avatar_url: member.avatar_url || null,
            avatar_options: member.avatar_options || [],
            initials: member.initials,
            color: member.color
        }));
    }
    
    if (!supabaseClient) {
        // Demo mode - return from config
        return getDemoUsers();
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('name');
        
        if (error) {
            console.error('Error fetching users from Supabase:', error);
            console.log('Falling back to demo mode...');
            return getDemoUsers();
        }
        
        if (!data || data.length === 0) {
            console.warn('No users found in Supabase, using demo users...');
            return getDemoUsers();
        }
        
        return data;
    } catch (err) {
        console.error('Failed to connect to Supabase:', err);
        console.log('Falling back to demo mode...');
        return getDemoUsers();
    }
}

async function getUserById(userId) {
    if (!supabaseClient) {
        const users = await getUsers();
        return users.find(u => u.id === userId) || null;
    }
    
    const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    
    return data;
}

// ========================================
// AVAILABILITY OPERATIONS
// ========================================

async function getAvailability() {
    if (!supabaseClient) {
        // Demo mode - get from localStorage
        const stored = localStorage.getItem('japan2026_availability');
        return stored ? JSON.parse(stored) : [];
    }
    
    const { data, error } = await supabaseClient
        .from('availability')
        .select(`
            *,
            users (id, name, avatar_url)
        `);
    
    if (error) {
        console.error('Error fetching availability:', error);
        return [];
    }
    
    return data;
}

async function getUserAvailability(userId) {
    if (!supabaseClient) {
        const all = await getAvailability();
        return all.find(a => a.user_id === userId) || null;
    }
    
    const { data, error } = await supabaseClient
        .from('availability')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user availability:', error);
        return null;
    }
    
    return data;
}

async function saveAvailability(userId, availabilityData) {
    if (!supabaseClient) {
        // Demo mode - save to localStorage
        const all = await getAvailability();
        const existing = all.findIndex(a => a.user_id === userId);
        
        const newEntry = {
            id: `demo-avail-${userId}`,
            user_id: userId,
            ...availabilityData,
            updated_at: new Date().toISOString()
        };
        
        if (existing >= 0) {
            all[existing] = newEntry;
        } else {
            all.push(newEntry);
        }
        
        localStorage.setItem('japan2026_availability', JSON.stringify(all));
        return newEntry;
    }
    
    // Check if user already has availability
    const existing = await getUserAvailability(userId);
    
    if (existing) {
        // Update
        const { data, error } = await supabaseClient
            .from('availability')
            .update({
                ...availabilityData,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating availability:', error);
            return null;
        }
        
        return data;
    } else {
        // Insert
        const { data, error } = await supabaseClient
            .from('availability')
            .insert({
                user_id: userId,
                ...availabilityData
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error inserting availability:', error);
            return null;
        }
        
        return data;
    }
}

// ========================================
// CITIES OPERATIONS
// ========================================

async function getCities() {
    if (!supabaseClient) {
        // Demo mode - get from localStorage or use seed data
        const stored = localStorage.getItem('japan2026_cities');
        if (stored) {
            return JSON.parse(stored);
        }
        // Return seed data (will be initialized on first load)
        return [];
    }
    
    const { data, error } = await supabaseClient
        .from('cities')
        .select('*')
        .order('name');
    
    if (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
    
    return data;
}

async function addCity(cityData) {
    if (!supabaseClient) {
        const cities = await getCities();
        const newCity = {
            id: `demo-city-${Date.now()}`,
            ...cityData,
            created_at: new Date().toISOString()
        };
        cities.push(newCity);
        localStorage.setItem('japan2026_cities', JSON.stringify(cities));
        return newCity;
    }
    
    const { data, error } = await supabaseClient
        .from('cities')
        .insert(cityData)
        .select()
        .single();
    
    if (error) {
        console.error('Error adding city:', error);
        return null;
    }
    
    return data;
}

// ========================================
// USER CITY DAYS OPERATIONS
// ========================================

async function getUserCityDays(userId) {
    if (!supabaseClient) {
        const stored = localStorage.getItem('japan2026_user_city_days');
        const all = stored ? JSON.parse(stored) : [];
        return all.filter(d => d.user_id === userId);
    }
    
    const { data, error } = await supabaseClient
        .from('user_city_days')
        .select(`
            *,
            cities (id, name)
        `)
        .eq('user_id', userId);
    
    if (error) {
        console.error('Error fetching user city days:', error);
        return [];
    }
    
    return data;
}

async function getAllUserCityDays() {
    if (!supabaseClient) {
        const stored = localStorage.getItem('japan2026_user_city_days');
        return stored ? JSON.parse(stored) : [];
    }
    
    const { data, error } = await supabaseClient
        .from('user_city_days')
        .select(`
            *,
            users (id, name),
            cities (id, name)
        `);
    
    if (error) {
        console.error('Error fetching all user city days:', error);
        return [];
    }
    
    return data;
}

async function saveUserCityDays(userId, cityId, days) {
    if (!supabaseClient) {
        const stored = localStorage.getItem('japan2026_user_city_days');
        let all = stored ? JSON.parse(stored) : [];
        
        const existingIndex = all.findIndex(d => d.user_id === userId && d.city_id === cityId);
        
        if (days === 0) {
            // Remove if days is 0
            if (existingIndex >= 0) {
                all.splice(existingIndex, 1);
            }
        } else if (existingIndex >= 0) {
            all[existingIndex].days = days;
        } else {
            all.push({
                id: `demo-ucd-${Date.now()}`,
                user_id: userId,
                city_id: cityId,
                days: days
            });
        }
        
        localStorage.setItem('japan2026_user_city_days', JSON.stringify(all));
        return { success: true };
    }
    
    if (days === 0) {
        // Delete the record
        const { error } = await supabaseClient
            .from('user_city_days')
            .delete()
            .eq('user_id', userId)
            .eq('city_id', cityId);
        
        if (error) {
            console.error('Error deleting user city days:', error);
            return null;
        }
        
        return { success: true };
    }
    
    // Upsert
    const { data, error } = await supabaseClient
        .from('user_city_days')
        .upsert({
            user_id: userId,
            city_id: cityId,
            days: days
        }, {
            onConflict: 'user_id,city_id'
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error saving user city days:', error);
        return null;
    }
    
    return data;
}

// ========================================
// ATTRACTIONS OPERATIONS
// ========================================

async function getAttractions() {
    if (!supabaseClient) {
        const stored = localStorage.getItem('japan2026_attractions');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    }
    
    const { data, error } = await supabaseClient
        .from('attractions')
        .select(`
            *,
            cities (id, name)
        `)
        .order('name');
    
    if (error) {
        console.error('Error fetching attractions:', error);
        return [];
    }
    
    return data;
}

async function addAttraction(attractionData) {
    if (!supabaseClient) {
        const attractions = await getAttractions();
        const newAttraction = {
            id: `demo-attr-${Date.now()}`,
            ...attractionData,
            created_at: new Date().toISOString()
        };
        attractions.push(newAttraction);
        localStorage.setItem('japan2026_attractions', JSON.stringify(attractions));
        return newAttraction;
    }
    
    const { data, error } = await supabaseClient
        .from('attractions')
        .insert(attractionData)
        .select()
        .single();
    
    if (error) {
        console.error('Error adding attraction:', error);
        return null;
    }
    
    return data;
}

// ========================================
// VOTES OPERATIONS
// ========================================

async function getVotes() {
    if (!supabaseClient) {
        const stored = localStorage.getItem('japan2026_votes');
        return stored ? JSON.parse(stored) : [];
    }
    
    const { data, error } = await supabaseClient
        .from('attraction_votes')
        .select(`
            *,
            users (id, name, avatar_url)
        `);
    
    if (error) {
        console.error('Error fetching votes:', error);
        return [];
    }
    
    return data;
}

async function getVotesForAttraction(attractionId) {
    if (!supabaseClient) {
        const all = await getVotes();
        return all.filter(v => v.attraction_id === attractionId);
    }
    
    const { data, error } = await supabaseClient
        .from('attraction_votes')
        .select(`
            *,
            users (id, name, avatar_url)
        `)
        .eq('attraction_id', attractionId);
    
    if (error) {
        console.error('Error fetching attraction votes:', error);
        return [];
    }
    
    return data;
}

async function vote(userId, attractionId, voteValue) {
    // voteValue: 1 for upvote, -1 for downvote, 0 to remove vote
    
    if (!supabaseClient) {
        const stored = localStorage.getItem('japan2026_votes');
        let all = stored ? JSON.parse(stored) : [];
        
        const existingIndex = all.findIndex(v => v.user_id === userId && v.attraction_id === attractionId);
        
        if (voteValue === 0) {
            // Remove vote
            if (existingIndex >= 0) {
                all.splice(existingIndex, 1);
            }
        } else if (existingIndex >= 0) {
            all[existingIndex].vote = voteValue;
        } else {
            all.push({
                id: `demo-vote-${Date.now()}`,
                user_id: userId,
                attraction_id: attractionId,
                vote: voteValue
            });
        }
        
        localStorage.setItem('japan2026_votes', JSON.stringify(all));
        return { success: true };
    }
    
    if (voteValue === 0) {
        // Delete vote
        const { error } = await supabaseClient
            .from('attraction_votes')
            .delete()
            .eq('user_id', userId)
            .eq('attraction_id', attractionId);
        
        if (error) {
            console.error('Error deleting vote:', error);
            return null;
        }
        
        return { success: true };
    }
    
    // Upsert vote
    const { data, error } = await supabaseClient
        .from('attraction_votes')
        .upsert({
            user_id: userId,
            attraction_id: attractionId,
            vote: voteValue
        }, {
            onConflict: 'user_id,attraction_id'
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error saving vote:', error);
        return null;
    }
    
    return data;
}

// ========================================
// REAL-TIME SUBSCRIPTIONS
// ========================================

function subscribeToChanges(table, callback) {
    if (!supabaseClient) {
        console.log('Demo mode: Real-time subscriptions not available');
        return null;
    }
    
    const subscription = supabaseClient
        .channel(`${table}_changes`)
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: table },
            (payload) => {
                console.log(`Change received on ${table}:`, payload);
                callback(payload);
            }
        )
        .subscribe();
    
    return subscription;
}

function unsubscribe(subscription) {
    if (subscription && supabaseClient) {
        supabaseClient.removeChannel(subscription);
    }
}

// ========================================
// BUDGET PREFERENCES
// ========================================

async function getUserBudget(userId) {
    if (!supabaseClient) {
        // Demo mode - get from localStorage
        const budgets = JSON.parse(localStorage.getItem('japan2026_budgets') || '[]');
        return budgets.find(b => b.user_id === userId) || null;
    }
    
    const { data, error } = await supabaseClient
        .from('user_budgets')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user budget:', error);
    }
    return data;
}

async function getAllUserBudgets() {
    if (!supabaseClient) {
        // Demo mode - get from localStorage
        return JSON.parse(localStorage.getItem('japan2026_budgets') || '[]');
    }
    
    const { data, error } = await supabaseClient
        .from('user_budgets')
        .select('*');
    
    if (error) {
        console.error('Error fetching all user budgets:', error);
        return [];
    }
    return data || [];
}

async function saveUserBudget(userId, category, tier) {
    if (!supabaseClient) {
        // Demo mode - save to localStorage
        let budgets = JSON.parse(localStorage.getItem('japan2026_budgets') || '[]');
        let userBudget = budgets.find(b => b.user_id === userId);
        
        if (!userBudget) {
            userBudget = { 
                id: `demo-budget-${userId}`,
                user_id: userId,
                flight_tier: 'economy',
                hotels_tier: 'budget',
                food_tier: 'budget',
                activities_tier: 'basic',
                shopping_tier: 'minimal',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            budgets.push(userBudget);
        }
        
        userBudget[`${category}_tier`] = tier;
        userBudget.updated_at = new Date().toISOString();
        
        localStorage.setItem('japan2026_budgets', JSON.stringify(budgets));
        return userBudget;
    }
    
    // Check if record exists
    const existing = await getUserBudget(userId);
    
    const budgetData = {
        user_id: userId,
        [`${category}_tier`]: tier,
        updated_at: new Date().toISOString()
    };
    
    if (existing) {
        // Update
        const { data, error } = await supabaseClient
            .from('user_budgets')
            .update(budgetData)
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating user budget:', error);
            return null;
        }
        return data;
    } else {
        // Insert with defaults
        const newBudget = {
            ...budgetData,
            flight_tier: category === 'flight' ? tier : 'economy',
            hotels_tier: category === 'hotels' ? tier : 'budget',
            food_tier: category === 'food' ? tier : 'budget',
            activities_tier: category === 'activities' ? tier : 'basic',
            shopping_tier: category === 'shopping' ? tier : 'minimal'
        };
        
        const { data, error } = await supabaseClient
            .from('user_budgets')
            .insert([newBudget])
            .select()
            .single();
        
        if (error) {
            console.error('Error inserting user budget:', error);
            return null;
        }
        return data;
    }
}

async function saveAllBudgetTiers(userId, budgetData) {
    console.log('saveAllBudgetTiers called with userId:', userId, 'data:', budgetData);
    
    if (!supabaseClient) {
        // Demo mode - save to localStorage
        let budgets = JSON.parse(localStorage.getItem('japan2026_budgets') || '[]');
        console.log('Current budgets in localStorage:', budgets);
        
        let userBudgetIndex = budgets.findIndex(b => b.user_id === userId);
        let userBudget;
        
        if (userBudgetIndex === -1) {
            // Create new budget
            userBudget = { 
                id: `demo-budget-${userId}`,
                user_id: userId,
                flight_tier: budgetData.flight_tier,
                hotels_tier: budgetData.hotels_tier,
                food_tier: budgetData.food_tier,
                activities_tier: budgetData.activities_tier,
                shopping_tier: budgetData.shopping_tier,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            budgets.push(userBudget);
        } else {
            // Update existing budget
            userBudget = budgets[userBudgetIndex];
            userBudget.flight_tier = budgetData.flight_tier;
            userBudget.hotels_tier = budgetData.hotels_tier;
            userBudget.food_tier = budgetData.food_tier;
            userBudget.activities_tier = budgetData.activities_tier;
            userBudget.shopping_tier = budgetData.shopping_tier;
            userBudget.updated_at = new Date().toISOString();
            budgets[userBudgetIndex] = userBudget;
        }
        
        localStorage.setItem('japan2026_budgets', JSON.stringify(budgets));
        console.log('Budget saved to localStorage:', userBudget);
        console.log('All budgets after save:', budgets);
        return userBudget;
    }
    
    // Check if record exists
    const existing = await getUserBudget(userId);
    
    const fullBudgetData = {
        user_id: userId,
        flight_tier: budgetData.flight_tier,
        hotels_tier: budgetData.hotels_tier,
        food_tier: budgetData.food_tier,
        activities_tier: budgetData.activities_tier,
        shopping_tier: budgetData.shopping_tier,
        updated_at: new Date().toISOString()
    };
    
    if (existing) {
        // Update
        const { data, error } = await supabaseClient
            .from('user_budgets')
            .update(fullBudgetData)
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating user budget:', error);
            return null;
        }
        return data;
    } else {
        // Insert
        const { data, error } = await supabaseClient
            .from('user_budgets')
            .insert([fullBudgetData])
            .select()
            .single();
        
        if (error) {
            console.error('Error inserting user budget:', error);
            return null;
        }
        return data;
    }
}

// ========================================
// SEED DATA INITIALIZATION
// ========================================

async function initializeSeedData() {
    // Check if cities exist
    let cities = await getCities();
    
    if (cities.length === 0) {
        console.log('Initializing seed data...');
        
        // Seed cities - based on Japan 40 Activities
        const seedCities = [
            {
                name: 'Tokyo',
                japanese_name: '東京',
                description: 'Japan\'s electric capital—world-class neighborhoods for food, fashion, nightlife, pop culture, and modern design.',
                image_url: CITY_IMAGES['Tokyo'],
                highlights: ['Shibuya', 'Senso-ji', 'Akihabara', 'Shinjuku', 'teamLab']
            },
            {
                name: 'Kyoto',
                japanese_name: '京都',
                description: 'Japan\'s cultural heart—temples, shrines, gardens, and traditional neighborhoods with timeless atmosphere.',
                image_url: CITY_IMAGES['Kyoto'],
                highlights: ['Fushimi Inari', 'Golden Pavilion', 'Arashiyama', 'Gion', 'Tea Ceremony']
            },
            {
                name: 'Osaka',
                japanese_name: '大阪',
                description: 'Japan\'s fun-loving food city—street eats, neon nights, and big-theme-park energy.',
                image_url: CITY_IMAGES['Osaka'],
                highlights: ['Dotonbori', 'Kuromon Market', 'Universal Studios', 'Osaka Castle']
            },
            {
                name: 'Nara',
                japanese_name: '奈良',
                description: 'A compact, walkable temple city—famous for deer, grand religious sites, and relaxed green spaces.',
                image_url: CITY_IMAGES['Nara'],
                highlights: ['Deer Park', 'Todaiji Buddha', 'Kasuga Shrine']
            },
            {
                name: 'Miyajima',
                japanese_name: '宮島',
                description: 'A sacred island escape—shrine scenery, forested hikes, and postcard views across the bay.',
                image_url: CITY_IMAGES['Miyajima'] || 'https://images.unsplash.com/photo-1505069190533-da1c9af13f7c?w=800&q=80',
                highlights: ['Itsukushima Shrine', 'Mount Misen', 'Floating Torii']
            },
            {
                name: 'Hakone',
                japanese_name: '箱根',
                description: 'Japan\'s most iconic landscape zone—Fuji views, volcanic terrain, lake cruises, and onsen relaxation.',
                image_url: CITY_IMAGES['Hakone'],
                highlights: ['Mt. Fuji Views', 'Onsen Ryokan', 'Open-Air Museum', 'Scenic Loop']
            },
            {
                name: 'Kanazawa',
                japanese_name: '金沢',
                description: 'A refined "little Kyoto" vibe—gardens, preserved districts, and top-tier craft traditions.',
                image_url: CITY_IMAGES['Kanazawa'],
                highlights: ['Kenrokuen Garden', 'Historic Districts', 'Crafts']
            },
            {
                name: 'Shirakawa-go',
                japanese_name: '白川郷',
                description: 'A UNESCO farmhouse village in the Japanese Alps—storybook roofs and rural scenery.',
                image_url: CITY_IMAGES['Shirakawa-go'] || 'https://images.unsplash.com/photo-1522623349500-de37a56ea2a5?w=800&q=80',
                highlights: ['Gassho-zukuri Houses', 'Mountain Views', 'Traditional Village']
            },
            {
                name: 'Nikko',
                japanese_name: '日光',
                description: 'A shrine-and-nature destination north of Tokyo—ornate architecture set in forested mountains.',
                image_url: CITY_IMAGES['Nikko'],
                highlights: ['Toshogu Shrines', 'Cedar Paths', 'Waterfalls']
            },
            {
                name: 'Koyasan',
                japanese_name: '高野山',
                description: 'A spiritual mountain town—temples, quiet forests, and one of Japan\'s most memorable cemeteries.',
                image_url: CITY_IMAGES['Koyasan'] || 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80',
                highlights: ['Temple Stay', 'Okunoin Cemetery', 'Shojin Ryori']
            },
            {
                name: 'Naoshima',
                japanese_name: '直島',
                description: 'An art island in the Seto Inland Sea—architectural museums, outdoor sculptures, and coastal cycling.',
                image_url: CITY_IMAGES['Naoshima'] || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
                highlights: ['Art Museums', 'Yayoi Kusama Pumpkin', 'Island Cycling']
            },
            {
                name: 'Okinawa',
                japanese_name: '沖縄',
                description: 'Japan\'s subtropical islands—beaches, coral reefs, relaxed pace, and a distinct local culture.',
                image_url: CITY_IMAGES['Okinawa'] || 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&q=80',
                highlights: ['Snorkeling', 'Beaches', 'Ryukyu Culture']
            }
        ];
        
        if (!supabaseClient) {
            // Demo mode - save to localStorage
            const citiesWithIds = seedCities.map((city, index) => ({
                id: `demo-city-${index}`,
                ...city,
                created_at: new Date().toISOString()
            }));
            localStorage.setItem('japan2026_cities', JSON.stringify(citiesWithIds));
            cities = citiesWithIds;
        } else {
            // Insert into Supabase
            for (const city of seedCities) {
                await addCity(city);
            }
            cities = await getCities();
        }
        
        console.log('Cities seeded:', cities.length);
    }
    
    // Check if attractions exist
    let attractions = await getAttractions();
    
    if (attractions.length === 0) {
        // Seed attractions - based on Japan 40 Activities
        const seedAttractions = [
            // Tokyo (8 activities)
            { name: 'Tokyo Shopping Districts', city_name: 'Tokyo', description: 'From Ginza luxury flagships to Shibuya streetwear and Harajuku–Omotesando style—Tokyo\'s retail zones feel like different worlds.', time_estimate: '3–8 hrs', image_url: ATTRACTION_IMAGES['Tokyo Shopping'] || 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80' },
            { name: 'Shibuya Scramble Crossing', city_name: 'Tokyo', description: 'Iconic crossing energy, Hachikō, towering screens, and endlessly browseable side streets.', time_estimate: '2–4 hrs', image_url: ATTRACTION_IMAGES['Shibuya Crossing'] },
            { name: 'Senso-ji and Nakamise Street', city_name: 'Tokyo', description: 'Old-Tokyo charm—lantern-lit temple gates and a classic snack-and-souvenir street approach.', time_estimate: '2–4 hrs', image_url: ATTRACTION_IMAGES['Senso-ji Temple'] },
            { name: 'Meiji Shrine and Yoyogi Park', city_name: 'Tokyo', description: 'A peaceful forested shrine precinct that feels miles away from the city—perfect reset between busy days.', time_estimate: '1.5–3 hrs', image_url: ATTRACTION_IMAGES['Meiji Shrine'] },
            { name: 'Tsukiji Outer Market Crawl', city_name: 'Tokyo', description: 'A lively food market for sushi, grilled seafood, knives, and matcha treats—arrive hungry.', time_estimate: '1.5–3 hrs', image_url: ATTRACTION_IMAGES['Tsukiji Market'] || 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80' },
            { name: 'Shinjuku Night Alleys', city_name: 'Tokyo', description: 'Skyline views followed by lantern alleys and tiny bars—Tokyo nightlife in high definition.', time_estimate: '3–5 hrs', image_url: ATTRACTION_IMAGES['Shinjuku Golden Gai'] },
            { name: 'teamLab Digital Art', city_name: 'Tokyo', description: 'Walk-through light and sound installations that feel like stepping inside an interactive dream.', time_estimate: '2–3 hrs', image_url: ATTRACTION_IMAGES['teamLab Borderless'] },
            { name: 'Akihabara Pop Culture', city_name: 'Tokyo', description: 'The epicenter of anime and electronics—gadgets, collectibles, themed cafés, and multi-floor arcades.', time_estimate: '2–4 hrs', image_url: ATTRACTION_IMAGES['Akihabara'] },
            
            // Kyoto (7 activities)
            { name: 'Fushimi Inari Torii Walk', city_name: 'Kyoto', description: 'Thousands of vermillion torii gates winding up a wooded mountain—iconic, cinematic, unforgettable.', time_estimate: '2–4 hrs', image_url: ATTRACTION_IMAGES['Fushimi Inari Shrine'] },
            { name: 'Kiyomizu-dera and Higashiyama', city_name: 'Kyoto', description: 'A classic temple veranda view, then historic lanes filled with crafts, sweets, and photogenic corners.', time_estimate: '3–5 hrs', image_url: ATTRACTION_IMAGES['Kiyomizu-dera Temple'] },
            { name: 'Arashiyama Bamboo and River', city_name: 'Kyoto', description: 'Bamboo, river scenery, and serene temples—Kyoto\'s most "storybook" day out.', time_estimate: '4–6 hrs', image_url: ATTRACTION_IMAGES['Arashiyama Bamboo Grove'] },
            { name: 'Gion Evening Stroll', city_name: 'Kyoto', description: 'Lantern-lit streets and wooden machiya facades—Kyoto at its most atmospheric after dark.', time_estimate: '1.5–3 hrs', image_url: ATTRACTION_IMAGES['Gion District'] },
            { name: 'Nishiki Market Tasting', city_name: 'Kyoto', description: '"Kyoto\'s kitchen"—pick-and-try local bites, pickles, sweets, and seasonal specialties.', time_estimate: '1.5–3 hrs', image_url: ATTRACTION_IMAGES['Nishiki Market'] || 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80' },
            { name: 'Golden Pavilion Visit', city_name: 'Kyoto', description: 'A gold-leaf pavilion mirrored in a pond—short visit, huge visual payoff.', time_estimate: '1–2 hrs', image_url: ATTRACTION_IMAGES['Kinkaku-ji'] },
            { name: 'Kyoto Tea Ceremony', city_name: 'Kyoto', description: 'A calm, guided introduction to Japanese aesthetics and ritual—memorable and grounding.', time_estimate: '1–2 hrs', image_url: ATTRACTION_IMAGES['Tea Ceremony'] || 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80' },
            
            // Osaka (5 activities)
            { name: 'Dotonbori Neon Night', city_name: 'Osaka', description: 'A neon canal of takoyaki, okonomiyaki, and people-watching—pure Osaka.', time_estimate: '2–4 hrs', image_url: ATTRACTION_IMAGES['Dotonbori'] },
            { name: 'Kuromon Market Bites', city_name: 'Osaka', description: 'Fresh seafood, fruit, skewers, and quick bites—ideal lunch stop for grazers.', time_estimate: '1.5–3 hrs', image_url: ATTRACTION_IMAGES['Kuromon Market'] || 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80' },
            { name: 'Universal Studios Japan', city_name: 'Osaka', description: 'High-production rides and immersive themed areas—plan early, stay late.', time_estimate: '8–12 hrs', image_url: ATTRACTION_IMAGES['Universal Studios Japan'] },
            { name: 'Osaka Castle Grounds', city_name: 'Osaka', description: 'A historic landmark framed by moats and gardens—great for a scenic stroll.', time_estimate: '2–3.5 hrs', image_url: ATTRACTION_IMAGES['Osaka Castle'] },
            { name: 'Umeda Skyline Views', city_name: 'Osaka', description: 'Big-city panoramas and sleek shopping and food complexes—especially good at sunset.', time_estimate: '1.5–2.5 hrs', image_url: ATTRACTION_IMAGES['Umeda'] || 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80' },
            
            // Nara (2 activities)
            { name: 'Nara Park and Deer', city_name: 'Nara', description: 'Friendly deer roaming open lawns—equal parts cute and chaotic.', time_estimate: '2–4 hrs', image_url: ATTRACTION_IMAGES['Nara Deer Park'] },
            { name: 'Todaiji Great Buddha', city_name: 'Nara', description: 'A monumental wooden hall housing an enormous Buddha—jaw-dropping scale.', time_estimate: '1–2 hrs', image_url: ATTRACTION_IMAGES['Todai-ji Temple'] },
            
            // Miyajima (2 activities)
            { name: 'Itsukushima Shrine Views', city_name: 'Miyajima', description: 'One of Japan\'s most famous waterfront shrines—especially magical near high tide.', time_estimate: '1.5–3 hrs', image_url: ATTRACTION_IMAGES['Itsukushima Shrine'] },
            { name: 'Mount Misen Hike', city_name: 'Miyajima', description: 'Panoramic viewpoints above the Seto Inland Sea—worth the climb for the vistas.', time_estimate: '3–5 hrs', image_url: ATTRACTION_IMAGES['Mount Misen'] || 'https://images.unsplash.com/photo-1505069190533-da1c9af13f7c?w=800&q=80' },
            
            // Hakone (5 activities)
            { name: 'Climb Mount Fuji', city_name: 'Hakone', description: 'A bucket-list sunrise climb above the clouds—physically demanding but deeply rewarding.', time_estimate: '12–18 hrs', image_url: ATTRACTION_IMAGES['Mount Fuji'] },
            { name: 'Fuji Five Lakes Day Trip', city_name: 'Hakone', description: 'Classic Fuji photo angles, lakeside cafés, and easy scenic walks—best with clear skies.', time_estimate: '6–10 hrs', image_url: ATTRACTION_IMAGES['Fuji Lakes'] || 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80' },
            { name: 'Hakone Onsen Ryokan Stay', city_name: 'Hakone', description: 'The quintessential onsen experience—hot springs, quiet views, and an unhurried kaiseki meal.', time_estimate: 'Overnight', image_url: ATTRACTION_IMAGES['Japanese Onsen Experience'] },
            { name: 'Hakone Open-Air Museum', city_name: 'Hakone', description: 'Sculptures in a mountain garden setting—art and nature in perfect balance.', time_estimate: '2–3.5 hrs', image_url: ATTRACTION_IMAGES['Hakone Open-Air Museum'] || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80' },
            { name: 'Hakone Scenic Loop', city_name: 'Hakone', description: 'A greatest-hits circuit of ropeways, volcanic scenery, and lake cruising—varied and fun.', time_estimate: '6–8 hrs', image_url: ATTRACTION_IMAGES['Hakone Ropeway'] },
            
            // Kanazawa (2 activities)
            { name: 'Kenrokuen Garden Walk', city_name: 'Kanazawa', description: 'One of Japan\'s most celebrated landscape gardens—best enjoyed slowly.', time_estimate: '1.5–3 hrs', image_url: ATTRACTION_IMAGES['Kenrokuen'] || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80' },
            { name: 'Kanazawa Historic Districts', city_name: 'Kanazawa', description: 'Teahouse streets and old residences—excellent for photos, crafts, and matcha breaks.', time_estimate: '3–5 hrs', image_url: ATTRACTION_IMAGES['Kanazawa'] || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
            
            // Shirakawa-go (1 activity)
            { name: 'Shirakawa-go Farmhouses', city_name: 'Shirakawa-go', description: 'Thatched gassho-zukuri homes in a valley setting—feels like stepping into a folktale.', time_estimate: '3–5 hrs', image_url: ATTRACTION_IMAGES['Shirakawa-go'] || 'https://images.unsplash.com/photo-1522623349500-de37a56ea2a5?w=800&q=80' },
            
            // Nikko (1 activity)
            { name: 'Nikko Toshogu Shrines', city_name: 'Nikko', description: 'Highly detailed, colorful shrine complexes and cedar-lined paths—history meets nature.', time_estimate: '4–7 hrs', image_url: ATTRACTION_IMAGES['Nikko Toshogu'] || 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800&q=80' },
            
            // Koyasan (1 activity)
            { name: 'Koyasan Temple Stay', city_name: 'Koyasan', description: 'Sleep at a temple, eat shojin ryori, and walk Okunoin—peaceful and profound.', time_estimate: 'Overnight', image_url: ATTRACTION_IMAGES['Koyasan'] || 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80' },
            
            // Naoshima (1 activity)
            { name: 'Naoshima Art Island Day', city_name: 'Naoshima', description: 'World-class contemporary art in bold architecture—best enjoyed at an unhurried pace.', time_estimate: '6–10 hrs', image_url: ATTRACTION_IMAGES['Naoshima'] || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80' },
            
            // Okinawa (1 activity)
            { name: 'Okinawa Snorkeling and Beaches', city_name: 'Okinawa', description: 'Clear water and reef life—choose a guided snorkel or dive for the best spots and safety.', time_estimate: '3–6 hrs', image_url: ATTRACTION_IMAGES['Okinawa'] || 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&q=80' }
        ];
        
        // Match attractions to city IDs
        const citiesMap = {};
        cities.forEach(city => {
            citiesMap[city.name] = city.id;
        });
        
        if (!supabaseClient) {
            // Demo mode
            const attractionsWithIds = seedAttractions.map((attr, index) => ({
                id: `demo-attr-${index}`,
                name: attr.name,
                city_id: citiesMap[attr.city_name] || null,
                description: attr.description,
                time_estimate: attr.time_estimate,
                image_url: attr.image_url,
                created_at: new Date().toISOString()
            }));
            localStorage.setItem('japan2026_attractions', JSON.stringify(attractionsWithIds));
            attractions = attractionsWithIds;
        } else {
            // Insert into Supabase
            for (const attr of seedAttractions) {
                await addAttraction({
                    name: attr.name,
                    city_id: citiesMap[attr.city_name] || null,
                    description: attr.description,
                    time_estimate: attr.time_estimate,
                    image_url: attr.image_url
                });
            }
            attractions = await getAttractions();
        }
        
        console.log('Attractions seeded:', attractions.length);
    }
    
    return { cities, attractions };
}
