// ========================================
// JAPAN 2026 - Destinations Module
// ========================================

// DOM Elements
const destinationsGrid = document.getElementById('destinationsGrid');
const addDestinationBtn = document.getElementById('addDestinationBtn');
const daysAllocated = document.getElementById('daysAllocated');
const daysTotal = document.getElementById('daysTotal');

// Local state
let citiesData = [];
let userCityDaysData = [];

// ========================================
// INITIALIZATION
// ========================================

function initDestinations() {
    addDestinationBtn.addEventListener('click', showAddDestinationModal);
    refreshDestinations();
}

async function refreshDestinations() {
    if (!currentUser) return;
    
    // Load cities
    citiesData = await getCities();
    
    // Load user's city days
    userCityDaysData = await getUserCityDays(currentUser.id);
    
    // Load all user city days for popularity
    const allCityDays = await getAllUserCityDays();
    
    // Get user's trip length
    const userAvail = await getUserAvailability(currentUser.id);
    const tripLengthDays = userAvail?.preferred_length_days || TRIP_CONFIG.defaultTripLength;
    daysTotal.textContent = tripLengthDays;
    
    // Update allocated days
    updateDaysAllocated();
    
    // Render destinations
    renderDestinations(allCityDays);
}

function updateDaysAllocated() {
    const total = userCityDaysData.reduce((sum, ucd) => sum + ucd.days, 0);
    daysAllocated.textContent = total;
    
    const max = parseInt(daysTotal.textContent);
    if (total > max) {
        daysAllocated.style.color = 'var(--error)';
    } else if (total === max) {
        daysAllocated.style.color = 'var(--success)';
    } else {
        daysAllocated.style.color = 'var(--sakura-medium)';
    }
}

// ========================================
// RENDER DESTINATIONS
// ========================================

function renderDestinations(allCityDays) {
    // Calculate stats for each city and sort
    const citiesWithStats = citiesData.map(city => {
        const cityUsers = allCityDays.filter(d => d.city_id === city.id);
        const totalDays = cityUsers.reduce((sum, d) => sum + d.days, 0);
        const avgDays = cityUsers.length > 0 ? totalDays / cityUsers.length : 0;
        return { ...city, cityUsers, totalDays, avgDays };
    });
    
    // Sort by average days (descending), then alphabetically
    citiesWithStats.sort((a, b) => {
        if (b.avgDays !== a.avgDays) return b.avgDays - a.avgDays;
        return a.name.localeCompare(b.name);
    });
    
    destinationsGrid.innerHTML = citiesWithStats.map(city => {
        const userDays = userCityDaysData.find(d => d.city_id === city.id);
        const days = userDays ? userDays.days : 0;
        
        // Calculate popularity
        const popularity = (city.cityUsers.length / users.length) * 100;
        
        const highlights = city.highlights || [];
        
        return `
            <div class="destination-card ${days > 0 ? 'selected' : ''}" data-city-id="${city.id}">
                <div class="destination-image-wrapper">
                    <img class="destination-image" src="${city.image_url}" alt="${city.name}" 
                         onerror="this.src='https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80'">
                    <div class="destination-image-overlay">
                        <h3 class="destination-name">${city.name}</h3>
                        <span class="destination-japanese">${city.japanese_name || CITY_JAPANESE[city.name] || ''}</span>
                    </div>
                </div>
                <div class="destination-content">
                    <p class="destination-description">${city.description}</p>
                    
                    ${highlights.length > 0 ? `
                        <div class="destination-highlights">
                            ${highlights.slice(0, 4).map(h => `<span class="highlight-tag">${h}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="destination-days">
                        <span class="days-label">Days to spend:</span>
                        <div class="days-control">
                            <button class="days-btn" data-action="decrease" data-city-id="${city.id}" ${days === 0 ? 'disabled' : ''}>−</button>
                            <span class="days-value">${days}</span>
                            <button class="days-btn" data-action="increase" data-city-id="${city.id}">+</button>
                        </div>
                    </div>
                    
                    ${city.cityUsers.length > 0 ? `
                        <div class="destination-popularity">
                            <div class="popularity-bar">
                                <div class="popularity-fill" style="width: ${popularity}%"></div>
                            </div>
                            <p class="popularity-text">
                                <span>${city.cityUsers.length}</span> of ${users.length} travelers want to visit 
                                (${city.avgDays.toFixed(1)} days avg)
                            </p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for day buttons
    destinationsGrid.querySelectorAll('.days-btn').forEach(btn => {
        btn.addEventListener('click', handleDaysChange);
    });
    
    // Add click listeners for expanding cards
    destinationsGrid.querySelectorAll('.destination-card').forEach(card => {
        card.addEventListener('click', handleDestinationClick);
    });
}

// ========================================
// EXPANDED DESTINATION VIEW
// ========================================

async function handleDestinationClick(e) {
    // Don't expand if clicking on days control buttons
    if (e.target.closest('.days-btn') || e.target.closest('.days-control')) {
        return;
    }
    
    const card = e.currentTarget;
    const cityId = card.dataset.cityId;
    const city = citiesData.find(c => c.id === cityId);
    
    if (!city) return;
    
    // Get attractions for this city
    const allAttractions = await getAttractions();
    const cityAttractions = allAttractions.filter(a => a.city_id === cityId);
    
    // Get votes for attractions
    const allVotes = await getVotes();
    
    showExpandedDestination(city, cityAttractions, allVotes, card);
}

function showExpandedDestination(city, attractions, votes, originalCard) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'destination-overlay';
    overlay.innerHTML = `
        <div class="destination-expanded" data-city-id="${city.id}">
            <button class="expanded-close-btn" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <div class="expanded-header">
                <div class="expanded-image-wrapper">
                    <img class="expanded-image" src="${city.image_url}" alt="${city.name}"
                         onerror="this.src='https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80'">
                    <div class="expanded-image-overlay">
                        <h2 class="expanded-name">${city.name}</h2>
                        <span class="expanded-japanese">${city.japanese_name || CITY_JAPANESE[city.name] || ''}</span>
                    </div>
                </div>
            </div>
            
            <div class="expanded-content">
                <p class="expanded-description">${city.description}</p>
                
                ${city.highlights && city.highlights.length > 0 ? `
                    <div class="expanded-highlights">
                        ${city.highlights.map(h => `<span class="highlight-tag">${h}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="expanded-attractions-section">
                    <h3 class="expanded-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Activities in ${city.name}
                        <span class="attractions-count">${attractions.length}</span>
                    </h3>
                    
                    ${attractions.length > 0 ? `
                        <div class="expanded-attractions-grid">
                            ${attractions.map(attr => {
                                const attrVotes = votes.filter(v => v.attraction_id === attr.id);
                                const upvotes = attrVotes.filter(v => v.vote > 0).length;
                                const downvotes = attrVotes.filter(v => v.vote < 0).length;
                                const score = upvotes - downvotes;
                                
                                return `
                                    <div class="expanded-attraction-card">
                                        <img class="expanded-attraction-image" src="${attr.image_url}" alt="${attr.name}"
                                             onerror="this.src='https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80'">
                                        <div class="expanded-attraction-content">
                                            <h4 class="expanded-attraction-name">${attr.name}</h4>
                                            <p class="expanded-attraction-description">${attr.description}</p>
                                            ${attr.time_estimate ? `
                                                <div class="expanded-attraction-time">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <polyline points="12 6 12 12 16 14"/>
                                                    </svg>
                                                    <span>${attr.time_estimate}</span>
                                                </div>
                                            ` : ''}
                                            <div class="expanded-attraction-votes">
                                                <span class="vote-indicator ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}">
                                                    ${score > 0 ? '👍' : score < 0 ? '👎' : '○'} ${score > 0 ? '+' : ''}${score}
                                                </span>
                                                <span class="vote-count">${upvotes} up / ${downvotes} down</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <div class="no-attractions">
                            <p>No attractions added for ${city.name} yet.</p>
                            <p class="text-muted">Visit the Activities page to add some!</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
    
    // Close handlers
    const closeBtn = overlay.querySelector('.expanded-close-btn');
    closeBtn.addEventListener('click', () => closeExpandedDestination(overlay));
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeExpandedDestination(overlay);
        }
    });
    
    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeExpandedDestination(overlay);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeExpandedDestination(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        overlay.remove();
    }, 300);
}

// ========================================
// DAYS CONTROL
// ========================================

async function handleDaysChange(e) {
    const btn = e.currentTarget;
    const cityId = btn.dataset.cityId;
    const action = btn.dataset.action;
    
    const userDays = userCityDaysData.find(d => d.city_id === cityId);
    let currentDays = userDays ? userDays.days : 0;
    
    if (action === 'increase') {
        currentDays++;
    } else if (action === 'decrease' && currentDays > 0) {
        currentDays--;
    }
    
    // Save to database
    await saveUserCityDays(currentUser.id, cityId, currentDays);
    
    // Update local state
    if (currentDays === 0) {
        userCityDaysData = userCityDaysData.filter(d => d.city_id !== cityId);
    } else if (userDays) {
        userDays.days = currentDays;
    } else {
        userCityDaysData.push({ city_id: cityId, days: currentDays });
    }
    
    // Update UI
    const card = destinationsGrid.querySelector(`[data-city-id="${cityId}"]`);
    if (card) {
        const daysValue = card.querySelector('.days-value');
        const decreaseBtn = card.querySelector('[data-action="decrease"]');
        
        daysValue.textContent = currentDays;
        decreaseBtn.disabled = currentDays === 0;
        card.classList.toggle('selected', currentDays > 0);
    }
    
    updateDaysAllocated();
}

// ========================================
// ADD DESTINATION MODAL
// ========================================

function showAddDestinationModal() {
    const modalHTML = `
        <h2>Add New Destination</h2>
        <form class="modal-form" id="addDestinationForm">
            <div class="form-group">
                <label for="newCityName">City Name *</label>
                <input type="text" id="newCityName" required placeholder="e.g., Sapporo">
            </div>
            
            <div class="form-group">
                <label for="newCityJapanese">Japanese Name</label>
                <input type="text" id="newCityJapanese" placeholder="e.g., 札幌">
            </div>
            
            <div class="form-group">
                <label for="newCityDescription">Description *</label>
                <textarea id="newCityDescription" rows="3" required placeholder="What makes this city special?"></textarea>
            </div>
            
            <div class="form-group">
                <label for="newCityImage">Image URL</label>
                <input type="text" id="newCityImage" placeholder="https://...">
            </div>
            
            <div class="form-group">
                <label for="newCityHighlights">Highlights (comma separated)</label>
                <input type="text" id="newCityHighlights" placeholder="e.g., Snow Festival, Ramen, Beer">
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Add Destination</button>
            </div>
        </form>
    `;
    
    showModal(modalHTML);
    
    // Add form handler
    document.getElementById('addDestinationForm').addEventListener('submit', handleAddDestination);
}

async function handleAddDestination(e) {
    e.preventDefault();
    
    const name = document.getElementById('newCityName').value.trim();
    const japaneseName = document.getElementById('newCityJapanese').value.trim();
    const description = document.getElementById('newCityDescription').value.trim();
    const imageUrl = document.getElementById('newCityImage').value.trim();
    const highlightsStr = document.getElementById('newCityHighlights').value.trim();
    
    const highlights = highlightsStr ? highlightsStr.split(',').map(h => h.trim()).filter(h => h) : [];
    
    const cityData = {
        name,
        japanese_name: japaneseName || null,
        description,
        image_url: imageUrl || `https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80`,
        highlights
    };
    
    const result = await addCity(cityData);
    
    if (result) {
        hideModal();
        showToast(`${name} added successfully!`, 'success');
        refreshDestinations();
    } else {
        showToast('Failed to add destination', 'error');
    }
}
