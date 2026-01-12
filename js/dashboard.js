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
        updateTeamStatus()
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
    
    topDestinations.innerHTML = sortedCities.map((city, index) => `
        <div class="top-item">
            <div class="top-item-rank">${index + 1}</div>
            <img class="top-item-image" src="${city.image_url}" alt="${city.name}" onerror="this.style.display='none'">
            <div class="top-item-info">
                <div class="top-item-name">${city.name}</div>
                <div class="top-item-meta">${city.userCount} people interested</div>
            </div>
            <div class="top-item-votes">${city.totalDays} days</div>
        </div>
    `).join('');
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
            <p class="text-muted text-center">No votes yet.<br>Go to Attractions to vote!</p>
        `;
        return;
    }
    
    topAttractions.innerHTML = sortedAttractions.map((attr, index) => `
        <div class="top-item">
            <div class="top-item-rank">${index + 1}</div>
            <img class="top-item-image" src="${attr.image_url}" alt="${attr.name}" onerror="this.style.display='none'">
            <div class="top-item-info">
                <div class="top-item-name">${attr.name}</div>
                <div class="top-item-meta">👍 ${attr.upvotes} · 👎 ${attr.downvotes}</div>
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
