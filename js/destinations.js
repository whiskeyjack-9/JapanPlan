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
    destinationsGrid.innerHTML = citiesData.map(city => {
        const userDays = userCityDaysData.find(d => d.city_id === city.id);
        const days = userDays ? userDays.days : 0;
        
        // Calculate popularity
        const cityUsers = allCityDays.filter(d => d.city_id === city.id);
        const totalDays = cityUsers.reduce((sum, d) => sum + d.days, 0);
        const popularity = (cityUsers.length / users.length) * 100;
        
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
                    
                    ${cityUsers.length > 0 ? `
                        <div class="destination-popularity">
                            <div class="popularity-bar">
                                <div class="popularity-fill" style="width: ${popularity}%"></div>
                            </div>
                            <p class="popularity-text">
                                <span>${cityUsers.length}</span> of ${users.length} travelers want to visit 
                                (${totalDays} total days)
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
