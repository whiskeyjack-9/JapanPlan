// ========================================
// JAPAN 2026 - Availability Module
// ========================================

// DOM Elements
const availableStart = document.getElementById('availableStart');
const availableEnd = document.getElementById('availableEnd');
const tripLength = document.getElementById('tripLength');
const tripLengthValue = document.getElementById('tripLengthValue');
const preferredStart = document.getElementById('preferredStart');
const preferredEnd = document.getElementById('preferredEnd');
const saveAvailabilityBtn = document.getElementById('saveAvailability');
const calendarView = document.getElementById('calendarView');
const presetBtns = document.querySelectorAll('.preset-btn');

// ========================================
// INITIALIZATION
// ========================================

function initAvailability() {
    // Set default date constraints
    const inputs = [availableStart, availableEnd, preferredStart, preferredEnd];
    inputs.forEach(input => {
        input.min = TRIP_CONFIG.minDate;
        input.max = TRIP_CONFIG.maxDate;
    });
    
    // Trip length slider
    tripLength.min = TRIP_CONFIG.minTripLength;
    tripLength.max = TRIP_CONFIG.maxTripLength;
    tripLength.value = TRIP_CONFIG.defaultTripLength;
    
    tripLength.addEventListener('input', () => {
        tripLengthValue.textContent = tripLength.value;
        updatePresetButtons();
        updatePreferredEndFromLength();
    });
    
    // Preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const days = parseInt(btn.dataset.days);
            tripLength.value = days;
            tripLengthValue.textContent = days;
            updatePresetButtons();
            updatePreferredEndFromLength();
        });
    });
    
    // Auto-update preferred end when start changes
    preferredStart.addEventListener('change', updatePreferredEndFromLength);
    
    // Save button
    saveAvailabilityBtn.addEventListener('click', handleSaveAvailability);
    
    // Load existing data
    refreshAvailability();
}

function updatePresetButtons() {
    const currentValue = parseInt(tripLength.value);
    presetBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.days) === currentValue);
    });
}

function updatePreferredEndFromLength() {
    if (preferredStart.value) {
        const start = new Date(preferredStart.value);
        const days = parseInt(tripLength.value);
        const end = new Date(start);
        end.setDate(end.getDate() + days - 1);
        
        // Make sure it doesn't exceed max date
        const maxDate = new Date(TRIP_CONFIG.maxDate);
        if (end > maxDate) {
            preferredEnd.value = TRIP_CONFIG.maxDate;
        } else {
            preferredEnd.value = end.toISOString().split('T')[0];
        }
    }
}

async function refreshAvailability() {
    if (!currentUser) return;
    
    // Load user's availability
    const userAvail = await getUserAvailability(currentUser.id);
    
    if (userAvail) {
        availableStart.value = userAvail.available_start || '';
        availableEnd.value = userAvail.available_end || '';
        preferredStart.value = userAvail.preferred_start || '';
        preferredEnd.value = userAvail.preferred_end || '';
        
        if (userAvail.preferred_length_days) {
            tripLength.value = userAvail.preferred_length_days;
            tripLengthValue.textContent = userAvail.preferred_length_days;
            updatePresetButtons();
        }
    }
    
    // Update calendar view
    await updateCalendarView();
}

// ========================================
// SAVE AVAILABILITY
// ========================================

async function handleSaveAvailability() {
    if (!currentUser) return;
    
    const data = {
        available_start: availableStart.value || null,
        available_end: availableEnd.value || null,
        preferred_length_days: parseInt(tripLength.value),
        preferred_start: preferredStart.value || null,
        preferred_end: preferredEnd.value || null
    };
    
    // Validation
    if (data.available_start && data.available_end) {
        if (new Date(data.available_start) > new Date(data.available_end)) {
            showToast('Available start date must be before end date', 'error');
            return;
        }
    }
    
    if (data.preferred_start && data.preferred_end) {
        if (new Date(data.preferred_start) > new Date(data.preferred_end)) {
            showToast('Preferred start date must be before end date', 'error');
            return;
        }
        
        // Check if preferred dates are within available dates
        if (data.available_start && data.available_end) {
            if (new Date(data.preferred_start) < new Date(data.available_start) ||
                new Date(data.preferred_end) > new Date(data.available_end)) {
                showToast('Preferred dates must be within your available dates', 'error');
                return;
            }
        }
    }
    
    // Save
    const result = await saveAvailability(currentUser.id, data);
    
    if (result) {
        showToast('Dates saved successfully!', 'success');
        await updateCalendarView();
    } else {
        showToast('Failed to save dates', 'error');
    }
}

// ========================================
// CALENDAR VIEW
// ========================================

async function updateCalendarView() {
    const availability = await getAvailability();
    
    // Generate calendars for July and August
    const months = [
        { year: 2026, month: 6, name: 'July 2026' },
        { year: 2026, month: 7, name: 'August 2026' }
    ];
    
    calendarView.innerHTML = months.map(m => generateMonthCalendar(m, availability)).join('');
}

function generateMonthCalendar(monthData, availability) {
    const { year, month, name } = monthData;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = `
        <div class="calendar-month">
            <div class="calendar-month-header">${name}</div>
            <div class="calendar-weekdays">
                ${weekdays.map(d => `<div class="calendar-weekday">${d}</div>`).join('')}
            </div>
            <div class="calendar-days">
    `;
    
    // Empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const { className, users: dayUsers } = getDayInfo(dateStr, availability);
        
        html += `
            <div class="calendar-day ${className}" title="${dayUsers.join(', ')}">
                ${day}
                ${dayUsers.length > 0 ? `
                    <div class="user-dots">
                        ${dayUsers.slice(0, 4).map(() => '<div class="user-dot"></div>').join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function getDayInfo(dateStr, availability) {
    let availableUsers = [];
    let preferredUsers = [];
    
    availability.forEach(avail => {
        const user = getUserFromId(avail.user_id);
        const userName = user ? user.name : 'Unknown';
        
        if (avail.preferred_start && avail.preferred_end) {
            if (dateStr >= avail.preferred_start && dateStr <= avail.preferred_end) {
                preferredUsers.push(userName);
            }
        }
        
        if (avail.available_start && avail.available_end) {
            if (dateStr >= avail.available_start && dateStr <= avail.available_end) {
                availableUsers.push(userName);
            }
        }
    });
    
    // Determine class based on overlap
    let className = '';
    const totalUsers = users.length;
    
    if (preferredUsers.length >= Math.ceil(totalUsers / 2)) {
        className = 'overlap';
    } else if (preferredUsers.length > 0) {
        className = 'preferred';
    } else if (availableUsers.length > 0) {
        className = 'available';
    }
    
    return {
        className,
        users: preferredUsers.length > 0 ? preferredUsers : availableUsers
    };
}
