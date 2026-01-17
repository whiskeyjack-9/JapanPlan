// ========================================
// JAPAN 2026 - Attractions Module
// ========================================

// DOM Elements
const attractionsGrid = document.getElementById('attractionsGrid');
const addAttractionBtn = document.getElementById('addAttractionBtn');
const filterTabs = document.querySelector('.filter-tabs');

// Local state
let attractionsData = [];
let votesData = [];
let citiesForFilter = [];
let currentFilter = 'all';

// ========================================
// INITIALIZATION
// ========================================

function initAttractions() {
    addAttractionBtn.addEventListener('click', showAddAttractionModal);
    
    // Filter tabs
    filterTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tab')) {
            currentFilter = e.target.dataset.filter;
            filterTabs.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.filter === currentFilter);
            });
            renderAttractions();
        }
    });
    
    refreshAttractions();
}

async function refreshAttractions() {
    if (!currentUser) return;
    
    // Load data
    attractionsData = await getAttractions();
    votesData = await getVotes();
    citiesForFilter = await getCities();
    
    // Update filter tabs
    updateFilterTabs();
    
    // Render
    renderAttractions();
}

function updateFilterTabs() {
    // Keep existing tabs and add city filters
    const existingTabs = filterTabs.querySelectorAll('.filter-tab[data-filter="all"], .filter-tab[data-filter="most-voted"]');
    
    // Get unique cities from attractions
    const citiesInAttractions = [...new Set(attractionsData.map(a => {
        const city = citiesForFilter.find(c => c.id === a.city_id);
        return city ? city.name : null;
    }).filter(Boolean))];
    
    // Remove old city filters
    filterTabs.querySelectorAll('.filter-tab:not([data-filter="all"]):not([data-filter="most-voted"])').forEach(tab => tab.remove());
    
    // Add city filter tabs
    citiesInAttractions.forEach(cityName => {
        const tab = document.createElement('button');
        tab.className = 'filter-tab';
        tab.dataset.filter = `city-${cityName}`;
        tab.textContent = cityName;
        filterTabs.appendChild(tab);
    });
}

// ========================================
// RENDER ATTRACTIONS
// ========================================

function renderAttractions() {
    // Apply filters
    let filteredAttractions = [...attractionsData];
    
    // Filter by city if applicable
    if (currentFilter.startsWith('city-')) {
        const cityName = currentFilter.replace('city-', '');
        const city = citiesForFilter.find(c => c.name === cityName);
        if (city) {
            filteredAttractions = filteredAttractions.filter(a => a.city_id === city.id);
        }
    }
    
    // Calculate vote score for each attraction and sort by score (primary), then alphabetically (secondary)
    filteredAttractions = filteredAttractions.map(attr => {
        const attrVotes = votesData.filter(v => v.attraction_id === attr.id);
        const score = attrVotes.reduce((sum, v) => sum + v.vote, 0);
        return { ...attr, sortScore: score };
    }).sort((a, b) => {
        if (b.sortScore !== a.sortScore) return b.sortScore - a.sortScore;
        return a.name.localeCompare(b.name);
    });
    
    if (filteredAttractions.length === 0) {
        attractionsGrid.innerHTML = `
            <div class="text-center text-muted" style="grid-column: 1 / -1; padding: 3rem;">
                <p>No activities found.</p>
                <p>Click the + button to add one!</p>
            </div>
        `;
        return;
    }
    
    attractionsGrid.innerHTML = filteredAttractions.map(attr => {
        // Get votes for this attraction
        const attrVotes = votesData.filter(v => v.attraction_id === attr.id);
        const upvotes = attrVotes.filter(v => v.vote > 0);
        const downvotes = attrVotes.filter(v => v.vote < 0);
        const score = upvotes.length - downvotes.length;
        
        // Current user's vote
        const userVote = attrVotes.find(v => v.user_id === currentUser.id);
        const userVoteValue = userVote ? userVote.vote : 0;
        
        // Get city name
        const city = citiesForFilter.find(c => c.id === attr.city_id);
        const cityName = city ? city.name : 'General';
        
        return `
            <div class="attraction-card" data-attraction-id="${attr.id}">
                <img class="attraction-image" src="${attr.image_url}" alt="${attr.name}"
                     onerror="this.src='https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80'">
                <div class="attraction-content">
                    <div class="attraction-header">
                        <h3 class="attraction-name">${attr.name}</h3>
                        <span class="attraction-city">${cityName}</span>
                    </div>
                    <p class="attraction-description">${attr.description}</p>
                    
                    ${attr.time_estimate ? `
                    <div class="attraction-time">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>${attr.time_estimate}</span>
                    </div>
                    ` : ''}
                    
                    <div class="attraction-voting">
                        <div class="vote-buttons">
                            <button class="vote-btn upvote ${userVoteValue > 0 ? 'active' : ''}" 
                                    data-attraction-id="${attr.id}" data-vote="1">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                </svg>
                                ${upvotes.length}
                            </button>
                            <button class="vote-btn downvote ${userVoteValue < 0 ? 'active' : ''}"
                                    data-attraction-id="${attr.id}" data-vote="-1">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                                </svg>
                                ${downvotes.length}
                            </button>
                        </div>
                        <div class="vote-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}">
                            ${score > 0 ? '+' : ''}${score}
                        </div>
                    </div>
                    
                    ${attrVotes.length > 0 ? `
                        <div class="voters-list">
                            <div class="voters-label">Votes:</div>
                            <div class="voters-avatars">
                                ${upvotes.map(v => {
                                    const voter = getUserFromId(v.user_id);
                                    if (!voter) return '';
                                    const hasAvatar = voter.avatar_url && voter.avatar_url.length > 0;
                                    const avatarStyle = hasAvatar 
                                        ? 'background: transparent;' 
                                        : `background: ${voter.color || '#4ade80'};`;
                                    const avatarContent = hasAvatar 
                                        ? `<img src="${voter.avatar_url}" alt="${voter.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                                        : (voter.initials || voter.name.charAt(0));
                                    return `
                                        <div class="voter-chip upvoter">
                                            <div class="voter-avatar" style="${avatarStyle}">${avatarContent}</div>
                                            <span>👍</span>
                                        </div>
                                    `;
                                }).join('')}
                                ${downvotes.map(v => {
                                    const voter = getUserFromId(v.user_id);
                                    if (!voter) return '';
                                    const hasAvatar = voter.avatar_url && voter.avatar_url.length > 0;
                                    const avatarStyle = hasAvatar 
                                        ? 'background: transparent;' 
                                        : `background: ${voter.color || '#f87171'};`;
                                    const avatarContent = hasAvatar 
                                        ? `<img src="${voter.avatar_url}" alt="${voter.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                                        : (voter.initials || voter.name.charAt(0));
                                    return `
                                        <div class="voter-chip downvoter">
                                            <div class="voter-avatar" style="${avatarStyle}">${avatarContent}</div>
                                            <span>👎</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Add vote button handlers
    attractionsGrid.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', handleVote);
    });
}

// ========================================
// VOTING
// ========================================

async function handleVote(e) {
    const btn = e.currentTarget;
    const attractionId = btn.dataset.attractionId;
    const voteValue = parseInt(btn.dataset.vote);
    
    // Check if user already voted with this value (toggle off)
    const existingVote = votesData.find(v => v.user_id === currentUser.id && v.attraction_id === attractionId);
    
    let newVoteValue = voteValue;
    if (existingVote && existingVote.vote === voteValue) {
        // Remove vote
        newVoteValue = 0;
    }
    
    // Save vote
    await vote(currentUser.id, attractionId, newVoteValue);
    
    // Update local state
    if (newVoteValue === 0) {
        votesData = votesData.filter(v => !(v.user_id === currentUser.id && v.attraction_id === attractionId));
    } else if (existingVote) {
        existingVote.vote = newVoteValue;
    } else {
        votesData.push({
            user_id: currentUser.id,
            attraction_id: attractionId,
            vote: newVoteValue
        });
    }
    
    // Re-render
    renderAttractions();
    
    showToast(newVoteValue === 0 ? 'Vote removed' : (newVoteValue > 0 ? 'Upvoted!' : 'Downvoted'), 'success');
}

// ========================================
// ADD ATTRACTION MODAL
// ========================================

function showAddAttractionModal() {
    const cityOptions = citiesForFilter.map(c => 
        `<option value="${c.id}">${c.name}</option>`
    ).join('');
    
    const modalHTML = `
        <h2>Add New Activity</h2>
        <form class="modal-form" id="addAttractionForm">
            <div class="form-group">
                <label for="newAttractionName">Name *</label>
                <input type="text" id="newAttractionName" required placeholder="e.g., Tokyo Tower">
            </div>
            
            <div class="form-group">
                <label for="newAttractionCity">City</label>
                <select id="newAttractionCity">
                    <option value="">General / Multiple Cities</option>
                    ${cityOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label for="newAttractionDescription">Description *</label>
                <textarea id="newAttractionDescription" rows="3" required placeholder="What makes this activity special?"></textarea>
            </div>
            
            <div class="form-group">
                <label for="newAttractionImage">Image URL</label>
                <input type="text" id="newAttractionImage" placeholder="https://...">
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Add Activity</button>
            </div>
        </form>
    `;
    
    showModal(modalHTML);
    
    // Add form handler
    document.getElementById('addAttractionForm').addEventListener('submit', handleAddAttraction);
}

async function handleAddAttraction(e) {
    e.preventDefault();
    
    const name = document.getElementById('newAttractionName').value.trim();
    const cityId = document.getElementById('newAttractionCity').value || null;
    const description = document.getElementById('newAttractionDescription').value.trim();
    const imageUrl = document.getElementById('newAttractionImage').value.trim();
    
    const attractionData = {
        name,
        city_id: cityId,
        description,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
        created_by: currentUser.id
    };
    
    const result = await addAttraction(attractionData);
    
    if (result) {
        hideModal();
        showToast(`${name} added successfully!`, 'success');
        refreshAttractions();
    } else {
        showToast('Failed to add activity', 'error');
    }
}
