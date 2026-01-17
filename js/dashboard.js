// ========================================
// JAPAN 2026 - Dashboard Module
// ========================================

// Dashboard DOM elements
const statTravelers = document.getElementById('statTravelers');
const statDestinations = document.getElementById('statDestinations');
const statAttractions = document.getElementById('statAttractions');
const bestDates = document.getElementById('bestDates');
const timelineContainer = document.getElementById('timelineContainer');
const topDestinations = document.getElementById('topDestinations');
const topAttractions = document.getElementById('topAttractions');
const teamStatus = document.getElementById('teamStatus');

// ========================================
// INITIALIZATION
// ========================================

function initDashboard() {
    refreshDashboard();
    
    // Set up real-time subscriptions if Supabase is connected
    if (isSupabaseConnected) {
        subscribeToChanges('availability', refreshDashboard);
        subscribeToChanges('user_city_days', refreshDashboard);
        subscribeToChanges('attraction_votes', refreshDashboard);
    }
}

async function refreshDashboard() {
    await Promise.all([
        updateStats(),
        updateTimeline(),
        updateTopDestinations(),
        updateTopAttractions(),
        updateTeamStatus(),
        updateBudgetOverview()
    ]);
}

// ========================================
// STATS
// ========================================

async function updateStats() {
    const availability = await getAvailability();
    const cities = await getCities();
    const attractions = await getAttractions();
    
    // Count users with availability set
    const readyTravelers = availability.filter(a => a.preferred_start && a.preferred_end).length;
    
    statTravelers.textContent = readyTravelers;
    statDestinations.textContent = cities.length;
    statAttractions.textContent = attractions.length;
    
    // Calculate best overlap dates
    updateBestDates(availability);
}

function updateBestDates(availability) {
    const preferredDates = availability.filter(a => a.preferred_start && a.preferred_end);
    
    if (preferredDates.length < 2) {
        bestDates.innerHTML = `
            <p class="best-dates-label">Best Overlap Dates</p>
            <p class="best-dates-value">Need more travelers to set dates</p>
        `;
        return;
    }
    
    // Find overlapping preferred dates
    let overlapStart = null;
    let overlapEnd = null;
    
    preferredDates.forEach(avail => {
        const start = new Date(avail.preferred_start);
        const end = new Date(avail.preferred_end);
        
        if (!overlapStart || start > overlapStart) {
            overlapStart = start;
        }
        if (!overlapEnd || end < overlapEnd) {
            overlapEnd = end;
        }
    });
    
    if (overlapStart && overlapEnd && overlapStart <= overlapEnd) {
        const days = getDaysBetween(overlapStart, overlapEnd);
        bestDates.innerHTML = `
            <p class="best-dates-label">Best Overlap (${preferredDates.length} people)</p>
            <p class="best-dates-value">${formatDateRange(overlapStart, overlapEnd)} (${days} days)</p>
        `;
    } else {
        bestDates.innerHTML = `
            <p class="best-dates-label">Best Overlap Dates</p>
            <p class="best-dates-value">No overlapping dates found</p>
        `;
    }
}

// ========================================
// TIMELINE
// ========================================

async function updateTimeline() {
    const availability = await getAvailability();
    
    // Generate timeline for July and August 2026
    const startDate = new Date('2026-07-01');
    const endDate = new Date('2026-08-31');
    const days = [];
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Build timeline header
    let headerHTML = '<div class="timeline-header">';
    days.forEach((day, index) => {
        const isFirst = day.getDate() === 1;
        const label = isFirst ? day.toLocaleDateString('en-US', { month: 'short' }) : (index % 7 === 0 ? day.getDate() : '');
        headerHTML += `<div class="timeline-day">${label}</div>`;
    });
    headerHTML += '</div>';
    
    // Build rows for each user
    let rowsHTML = '';
    
    users.forEach(user => {
        const userAvail = availability.find(a => a.user_id === user.id);
        
        const hasAvatar = user.avatar_url && user.avatar_url.length > 0;
        const avatarStyle = hasAvatar 
            ? 'background: transparent;' 
            : `background: linear-gradient(135deg, ${user.color || '#ff5c8d'}, ${adjustColor(user.color || '#ff5c8d', -30)});`;
        const avatarContent = hasAvatar 
            ? `<img src="${user.avatar_url}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
            : (user.initials || user.name.charAt(0));
        
        rowsHTML += `
            <div class="timeline-row">
                <div class="timeline-user">
                    <div class="timeline-user-avatar" style="${avatarStyle}">${avatarContent}</div>
                    <span class="timeline-user-name">${user.name}</span>
                </div>
                <div class="timeline-bars">
        `;
        
        days.forEach(day => {
            let cellClass = 'timeline-cell';
            
            if (userAvail) {
                const dayStr = day.toISOString().split('T')[0];
                const availStart = userAvail.available_start;
                const availEnd = userAvail.available_end;
                const prefStart = userAvail.preferred_start;
                const prefEnd = userAvail.preferred_end;
                
                if (prefStart && prefEnd && dayStr >= prefStart && dayStr <= prefEnd) {
                    cellClass += ' preferred';
                } else if (availStart && availEnd && dayStr >= availStart && dayStr <= availEnd) {
                    cellClass += ' available';
                }
            }
            
            rowsHTML += `<div class="${cellClass}"></div>`;
        });
        
        rowsHTML += `
                </div>
            </div>
        `;
    });
    
    timelineContainer.innerHTML = headerHTML + rowsHTML;
}

// ========================================
// TOP DESTINATIONS
// ========================================

async function updateTopDestinations() {
    const cities = await getCities();
    const allCityDays = await getAllUserCityDays();
    
    // Aggregate days per city
    const cityStats = {};
    cities.forEach(city => {
        cityStats[city.id] = {
            ...city,
            totalDays: 0,
            userCount: 0
        };
    });
    
    allCityDays.forEach(ucd => {
        if (cityStats[ucd.city_id]) {
            cityStats[ucd.city_id].totalDays += ucd.days;
            cityStats[ucd.city_id].userCount++;
        }
    });
    
    // Sort by total days
    const sortedCities = Object.values(cityStats)
        .filter(c => c.totalDays > 0)
        .sort((a, b) => b.totalDays - a.totalDays)
        .slice(0, 5);
    
    if (sortedCities.length === 0) {
        topDestinations.innerHTML = `
            <p class="text-muted text-center">No destinations selected yet.<br>Go to Destinations to start planning!</p>
        `;
        return;
    }
    
    topDestinations.innerHTML = sortedCities.map((city, index) => {
        const avgDays = city.userCount > 0 ? (city.totalDays / city.userCount).toFixed(1) : 0;
        return `
            <div class="top-item">
                <div class="top-item-rank">${index + 1}</div>
                <img class="top-item-image" src="${city.image_url}" alt="${city.name}" onerror="this.style.display='none'">
                <div class="top-item-info">
                    <div class="top-item-name">${city.name}</div>
                    <div class="top-item-meta">${city.userCount} people interested</div>
                </div>
                <div class="top-item-votes">${avgDays} days</div>
            </div>
        `;
    }).join('');
}

// ========================================
// TOP ATTRACTIONS
// ========================================

async function updateTopAttractions() {
    const attractions = await getAttractions();
    const votes = await getVotes();
    
    // Aggregate votes per attraction
    const attractionStats = {};
    attractions.forEach(attr => {
        attractionStats[attr.id] = {
            ...attr,
            score: 0,
            upvotes: 0,
            downvotes: 0
        };
    });
    
    votes.forEach(vote => {
        if (attractionStats[vote.attraction_id]) {
            attractionStats[vote.attraction_id].score += vote.vote;
            if (vote.vote > 0) {
                attractionStats[vote.attraction_id].upvotes++;
            } else {
                attractionStats[vote.attraction_id].downvotes++;
            }
        }
    });
    
    // Sort by score
    const sortedAttractions = Object.values(attractionStats)
        .filter(a => a.score !== 0 || a.upvotes > 0 || a.downvotes > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    
    if (sortedAttractions.length === 0) {
        topAttractions.innerHTML = `
            <p class="text-muted text-center">No votes yet.<br>Go to Activities to vote!</p>
        `;
        return;
    }
    
    topAttractions.innerHTML = sortedAttractions.map((attr, index) => `
        <div class="top-item">
            <div class="top-item-rank">${index + 1}</div>
            <img class="top-item-image" src="${attr.image_url}" alt="${attr.name}" onerror="this.style.display='none'">
            <div class="top-item-info">
                <div class="top-item-name">${attr.name}</div>
                <div class="top-item-meta">${attr.upvotes + attr.downvotes} votes</div>
            </div>
            <div class="top-item-votes ${attr.score > 0 ? 'positive' : attr.score < 0 ? 'negative' : ''}">${attr.score > 0 ? '+' : ''}${attr.score}</div>
        </div>
    `).join('');
}

// ========================================
// TEAM STATUS
// ========================================

async function updateTeamStatus() {
    const availability = await getAvailability();
    const allCityDays = await getAllUserCityDays();
    const votes = await getVotes();
    
    teamStatus.innerHTML = users.map(user => {
        const userAvail = availability.find(a => a.user_id === user.id);
        const userCities = allCityDays.filter(d => d.user_id === user.id);
        const userVotes = votes.filter(v => v.user_id === user.id);
        
        let statusText = 'Not started';
        let statusClass = '';
        
        if (userAvail && userAvail.preferred_start) {
            if (userCities.length > 0 && userVotes.length > 0) {
                statusText = 'All set! ✓';
                statusClass = 'ready';
            } else if (userCities.length > 0) {
                statusText = 'Needs to vote';
                statusClass = '';
            } else {
                statusText = 'Needs destinations';
                statusClass = '';
            }
        } else if (userAvail) {
            statusText = 'Setting dates...';
            statusClass = '';
        }
        
        const hasAvatar = user.avatar_url && user.avatar_url.length > 0;
        const avatarStyle = hasAvatar 
            ? 'background: transparent;' 
            : `background: linear-gradient(135deg, ${user.color || '#ff5c8d'}, ${adjustColor(user.color || '#ff5c8d', -30)});`;
        const avatarContent = hasAvatar 
            ? `<img src="${user.avatar_url}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
            : (user.initials || user.name.charAt(0));
        
        return `
            <div class="team-member">
                <div class="team-member-avatar" style="${avatarStyle}">${avatarContent}</div>
                <div class="team-member-info">
                    <div class="team-member-name">${user.name}</div>
                    <div class="team-member-status ${statusClass}">${statusText}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// BUDGET OVERVIEW
// ========================================

async function updateBudgetOverview() {
    const budgetSummary = document.getElementById('budgetTiersSummary');
    if (!budgetSummary) return;
    
    // Get all user budgets
    const allBudgets = await getAllUserBudgets();
    const totalUsers = users.length;
    const usersWithBudget = allBudgets.length;
    
    // Tier names for display
    const tierLabels = {
        flight: {
            economy: { name: 'Chūkansō', japanese: '中間層' },
            business: { name: 'Fuyūsō', japanese: '富裕層' }
        },
        hotels: {
            budget: { name: 'Ronin', japanese: '浪人' },
            mid: { name: 'Daimyo', japanese: '大名' },
            luxury: { name: 'Shogun', japanese: '将軍' }
        },
        food: {
            budget: { name: 'Aikido', japanese: '合気道' },
            mid: { name: 'Judo', japanese: '柔道' },
            premium: { name: 'Sumo', japanese: '相撲' }
        },
        activities: {
            basic: { name: 'Genin', japanese: '下忍' },
            moderate: { name: 'Chunin', japanese: '中忍' },
            premium: { name: 'Jonin', japanese: '上忍' }
        },
        shopping: {
            minimal: { name: 'Gachapon', japanese: 'ガチャポン' },
            moderate: { name: 'Shotengai', japanese: '商店街' },
            splurge: { name: 'Ginza', japanese: '銀座' }
        }
    };
    
    // Count each tier selection
    const counts = {
        flight: {},
        hotels: {},
        food: {},
        activities: {},
        shopping: {}
    };
    
    // Initialize counts
    Object.keys(tierLabels).forEach(category => {
        Object.keys(tierLabels[category]).forEach(tier => {
            counts[category][tier] = 0;
        });
    });
    
    // Tally up selections
    allBudgets.forEach(budget => {
        if (budget.flight_tier && counts.flight[budget.flight_tier] !== undefined) {
            counts.flight[budget.flight_tier]++;
        }
        if (budget.hotels_tier && counts.hotels[budget.hotels_tier] !== undefined) {
            counts.hotels[budget.hotels_tier]++;
        }
        if (budget.food_tier && counts.food[budget.food_tier] !== undefined) {
            counts.food[budget.food_tier]++;
        }
        if (budget.activities_tier && counts.activities[budget.activities_tier] !== undefined) {
            counts.activities[budget.activities_tier]++;
        }
        if (budget.shopping_tier && counts.shopping[budget.shopping_tier] !== undefined) {
            counts.shopping[budget.shopping_tier]++;
        }
    });
    
    if (usersWithBudget === 0) {
        budgetSummary.innerHTML = `
            <p class="text-muted text-center">No one has set their budget yet.<br>Be the first!</p>
        `;
        return;
    }
    
    // Build the summary HTML
    const categories = [
        { key: 'flight', icon: '✈️', label: 'Flight' },
        { key: 'hotels', icon: '🏨', label: 'Hotels' },
        { key: 'food', icon: '🍜', label: 'Food' },
        { key: 'activities', icon: '🎌', label: 'Activities' },
        { key: 'shopping', icon: '🛍️', label: 'Shopping' }
    ];
    
    budgetSummary.innerHTML = `
        <div class="budget-responders">${usersWithBudget} of ${totalUsers} have set budgets</div>
        ${categories.map(cat => {
            const tierCounts = counts[cat.key];
            const tiers = Object.keys(tierLabels[cat.key]);
            
            return `
                <div class="budget-category-row">
                    <div class="budget-category-label">
                        <span class="budget-cat-icon">${cat.icon}</span>
                        <span>${cat.label}</span>
                    </div>
                    <div class="budget-tier-counts">
                        ${tiers.map(tier => {
                            const count = tierCounts[tier];
                            const label = tierLabels[cat.key][tier];
                            return `
                                <div class="tier-count-item ${count > 0 ? 'has-votes' : ''}">
                                    <span class="tier-count-japanese">${label.japanese}</span>
                                    <span class="tier-count-num">${count}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('')}
    `;
}
