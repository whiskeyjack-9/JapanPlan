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
// SEED DATA INITIALIZATION
// ========================================

async function initializeSeedData() {
    // Check if cities exist
    let cities = await getCities();
    
    if (cities.length === 0) {
        console.log('Initializing seed data...');
        
        // Seed cities
        const seedCities = [
            {
                name: 'Tokyo',
                japanese_name: '東京',
                description: 'Japan\'s bustling capital, mixing ultramodern and traditional. From neon-lit Shibuya to historic temples, Tokyo offers endless discovery.',
                image_url: CITY_IMAGES['Tokyo'],
                highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Akihabara', 'Shinjuku']
            },
            {
                name: 'Kyoto',
                japanese_name: '京都',
                description: 'The cultural heart of Japan with over 2,000 temples and shrines. Experience geishas, zen gardens, and timeless traditions.',
                image_url: CITY_IMAGES['Kyoto'],
                highlights: ['Fushimi Inari', 'Golden Pavilion', 'Bamboo Grove', 'Gion']
            },
            {
                name: 'Osaka',
                japanese_name: '大阪',
                description: 'Japan\'s kitchen and comedy capital. Known for street food, vibrant nightlife, and the friendly local culture.',
                image_url: CITY_IMAGES['Osaka'],
                highlights: ['Dotonbori', 'Osaka Castle', 'Universal Studios', 'Street Food']
            },
            {
                name: 'Hiroshima',
                japanese_name: '広島',
                description: 'A city of peace and resilience. Visit the moving Peace Memorial and take a day trip to beautiful Miyajima Island.',
                image_url: CITY_IMAGES['Hiroshima'],
                highlights: ['Peace Memorial', 'Miyajima Island', 'Itsukushima Shrine']
            },
            {
                name: 'Nara',
                japanese_name: '奈良',
                description: 'Ancient capital where friendly deer roam free. Home to some of Japan\'s oldest and most impressive temples.',
                image_url: CITY_IMAGES['Nara'],
                highlights: ['Deer Park', 'Todai-ji Temple', 'Kasuga Shrine']
            },
            {
                name: 'Hakone',
                japanese_name: '箱根',
                description: 'Mountain resort town famous for hot springs, outdoor museums, and stunning views of Mount Fuji.',
                image_url: CITY_IMAGES['Hakone'],
                highlights: ['Mt. Fuji Views', 'Onsen', 'Open-Air Museum', 'Lake Ashi']
            },
            {
                name: 'Nikko',
                japanese_name: '日光',
                description: 'UNESCO World Heritage site with ornate shrines set in beautiful forests and mountains.',
                image_url: CITY_IMAGES['Nikko'],
                highlights: ['Toshogu Shrine', 'Kegon Falls', 'Nature Trails']
            },
            {
                name: 'Kanazawa',
                japanese_name: '金沢',
                description: 'Preserved Edo-era districts, beautiful gardens, and excellent seafood. Japan\'s best-kept secret.',
                image_url: CITY_IMAGES['Kanazawa'],
                highlights: ['Kenroku-en Garden', 'Samurai District', 'Geisha Districts']
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
        const seedAttractions = [
            // Tokyo
            { name: 'Shibuya Crossing', city_name: 'Tokyo', description: 'The world\'s busiest pedestrian crossing. Experience the organized chaos of thousands crossing at once.', image_url: ATTRACTION_IMAGES['Shibuya Crossing'] },
            { name: 'Senso-ji Temple', city_name: 'Tokyo', description: 'Tokyo\'s oldest temple in Asakusa. Walk through the iconic Thunder Gate and Nakamise shopping street.', image_url: ATTRACTION_IMAGES['Senso-ji Temple'] },
            { name: 'teamLab Borderless', city_name: 'Tokyo', description: 'Immersive digital art museum where you become part of the artwork. A must-see modern experience.', image_url: ATTRACTION_IMAGES['teamLab Borderless'] },
            { name: 'Meiji Shrine', city_name: 'Tokyo', description: 'Serene Shinto shrine dedicated to Emperor Meiji, surrounded by a beautiful forest in the heart of the city.', image_url: ATTRACTION_IMAGES['Meiji Shrine'] },
            { name: 'Akihabara', city_name: 'Tokyo', description: 'Electronics and anime paradise. Multi-story arcades, maid cafes, and endless otaku culture.', image_url: ATTRACTION_IMAGES['Akihabara'] },
            { name: 'Shinjuku Golden Gai', city_name: 'Tokyo', description: 'Maze of tiny bars in narrow alleys. Unique nightlife experience with character-filled establishments.', image_url: ATTRACTION_IMAGES['Shinjuku Golden Gai'] },
            { name: 'Ghibli Museum', city_name: 'Tokyo', description: 'Whimsical museum dedicated to Studio Ghibli. Tickets sell out fast - book months in advance!', image_url: ATTRACTION_IMAGES['Ghibli Museum'] },
            
            // Kyoto
            { name: 'Fushimi Inari Shrine', city_name: 'Kyoto', description: 'Thousands of vermillion torii gates winding up a mountain. Iconic and unforgettable.', image_url: ATTRACTION_IMAGES['Fushimi Inari Shrine'] },
            { name: 'Kinkaku-ji (Golden Pavilion)', city_name: 'Kyoto', description: 'Stunning Zen temple covered in gold leaf, reflected perfectly in its surrounding pond.', image_url: ATTRACTION_IMAGES['Kinkaku-ji'] },
            { name: 'Arashiyama Bamboo Grove', city_name: 'Kyoto', description: 'Walk through towering bamboo stalks in this ethereal forest. Best visited early morning.', image_url: ATTRACTION_IMAGES['Arashiyama Bamboo Grove'] },
            { name: 'Gion District', city_name: 'Kyoto', description: 'Traditional geisha district with preserved wooden machiya houses. Spot geiko and maiko at dusk.', image_url: ATTRACTION_IMAGES['Gion District'] },
            { name: 'Kiyomizu-dera Temple', city_name: 'Kyoto', description: 'Historic temple with a large wooden stage offering panoramic views of Kyoto.', image_url: ATTRACTION_IMAGES['Kiyomizu-dera Temple'] },
            
            // Osaka
            { name: 'Osaka Castle', city_name: 'Osaka', description: 'Iconic castle with museum inside. Beautiful grounds especially during cherry blossom season.', image_url: ATTRACTION_IMAGES['Osaka Castle'] },
            { name: 'Dotonbori', city_name: 'Osaka', description: 'Neon-lit entertainment district famous for the Glico Man sign. Street food heaven!', image_url: ATTRACTION_IMAGES['Dotonbori'] },
            { name: 'Universal Studios Japan', city_name: 'Osaka', description: 'Theme park with unique attractions including the Wizarding World of Harry Potter and Super Nintendo World.', image_url: ATTRACTION_IMAGES['Universal Studios Japan'] },
            
            // Hiroshima
            { name: 'Hiroshima Peace Memorial', city_name: 'Hiroshima', description: 'Moving museum and memorial dedicated to atomic bomb victims. A profound, must-visit site.', image_url: ATTRACTION_IMAGES['Hiroshima Peace Memorial'] },
            { name: 'Itsukushima Shrine', city_name: 'Hiroshima', description: 'Famous floating torii gate on Miyajima Island. One of Japan\'s most photographed sights.', image_url: ATTRACTION_IMAGES['Itsukushima Shrine'] },
            
            // Nara
            { name: 'Nara Deer Park', city_name: 'Nara', description: 'Over 1,000 friendly deer roam freely. Buy shika senbei crackers to feed them!', image_url: ATTRACTION_IMAGES['Nara Deer Park'] },
            { name: 'Todai-ji Temple', city_name: 'Nara', description: 'Houses the world\'s largest bronze Buddha in one of the world\'s largest wooden buildings.', image_url: ATTRACTION_IMAGES['Todai-ji Temple'] },
            
            // Hakone
            { name: 'Mount Fuji Viewing', city_name: 'Hakone', description: 'Spectacular views of Japan\'s iconic mountain from various vantage points around Hakone.', image_url: ATTRACTION_IMAGES['Mount Fuji'] },
            { name: 'Traditional Onsen Experience', city_name: 'Hakone', description: 'Soak in natural hot springs with mountain views. Many ryokans offer private onsen.', image_url: ATTRACTION_IMAGES['Japanese Onsen Experience'] },
            { name: 'Hakone Ropeway', city_name: 'Hakone', description: 'Scenic cable car over volcanic valley with sulfur vents. Views of Lake Ashi and Mt. Fuji.', image_url: ATTRACTION_IMAGES['Hakone Ropeway'] }
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
                    image_url: attr.image_url
                });
            }
            attractions = await getAttractions();
        }
        
        console.log('Attractions seeded:', attractions.length);
    }
    
    return { cities, attractions };
}
