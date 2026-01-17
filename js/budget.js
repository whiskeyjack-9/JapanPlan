// ========================================
// JAPAN 2026 - Budget Module
// ========================================

// Budget tier pricing (in USD)
const BUDGET_PRICING = {
    flight: {
        economy: 1100,      // Chūkansō - Economy class round trip
        business: 4500      // Fuyūsō - Business class round trip
    },
    hotels: {
        budget: 80,         // Ronin - per night (hostels, capsules)
        mid: 160,           // Daimyo - per night (nice hotels, ryokan)
        luxury: 400         // Shogun - per night (luxury, premium ryokan)
    },
    food: {
        budget: 40,         // Aikido - per day (konbini, ramen, cheap eats)
        mid: 80,            // Judo - per day (nice restaurants)
        premium: 120        // Sumo - per day (omakase, kaiseki)
    },
    activities: {
        basic: 20,          // Genin - per day (free temples, basic entry)
        moderate: 60,       // Chunin - per day (museums, tours)
        premium: 100        // Jonin - per day (private tours, special experiences)
    },
    shopping: {
        minimal: 100,       // Gachapon - total (souvenirs)
        moderate: 350,      // Shotengai - total (clothes, gifts)
        splurge: 1000       // Ginza - total (designer, electronics)
    }
};

// Tier display names with Japanese
const TIER_NAMES = {
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

// Local state
let userBudgetData = null;
let tripDays = 14;

// ========================================
// INITIALIZATION
// ========================================

function initBudget() {
    // Add event listeners to all tier options for live calculation
    document.querySelectorAll('.budget-category input[type="radio"]').forEach(input => {
        input.addEventListener('change', handleTierChange);
    });
    
    // Add save button listener
    const saveBtn = document.getElementById('saveBudgetBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveBudget);
    }
    
    refreshBudget();
}

async function refreshBudget() {
    if (!currentUser) return;
    
    // Get user's trip length from availability
    const userAvail = await getUserAvailability(currentUser.id);
    tripDays = userAvail?.preferred_length_days || TRIP_CONFIG.defaultTripLength;
    document.getElementById('budgetTripDays').textContent = tripDays;
    
    // Load user's budget preferences
    userBudgetData = await getUserBudget(currentUser.id);
    
    // Apply saved selections to UI
    if (userBudgetData) {
        applyBudgetSelections(userBudgetData);
    }
    
    // Calculate and display totals
    calculateBudget();
}

// ========================================
// TIER SELECTION
// ========================================

function applyBudgetSelections(budget) {
    if (budget.flight_tier) {
        const flightInput = document.querySelector(`input[name="flight"][value="${budget.flight_tier}"]`);
        if (flightInput) flightInput.checked = true;
    }
    if (budget.hotels_tier) {
        const hotelInput = document.querySelector(`input[name="hotels"][value="${budget.hotels_tier}"]`);
        if (hotelInput) hotelInput.checked = true;
    }
    if (budget.food_tier) {
        const foodInput = document.querySelector(`input[name="food"][value="${budget.food_tier}"]`);
        if (foodInput) foodInput.checked = true;
    }
    if (budget.activities_tier) {
        const activitiesInput = document.querySelector(`input[name="activities"][value="${budget.activities_tier}"]`);
        if (activitiesInput) activitiesInput.checked = true;
    }
    if (budget.shopping_tier) {
        const shoppingInput = document.querySelector(`input[name="shopping"][value="${budget.shopping_tier}"]`);
        if (shoppingInput) shoppingInput.checked = true;
    }
}

function handleTierChange(e) {
    // Just recalculate on change - don't save until user clicks save
    calculateBudget();
}

async function handleSaveBudget() {
    if (!currentUser) {
        console.error('No current user');
        showToast('Please select a user first', 'error');
        return;
    }
    
    const tiers = getSelectedTiers();
    console.log('Saving budget tiers:', tiers);
    
    // Save all tiers at once
    const budgetData = {
        flight_tier: tiers.flight,
        hotels_tier: tiers.hotels,
        food_tier: tiers.food,
        activities_tier: tiers.activities,
        shopping_tier: tiers.shopping
    };
    
    try {
        const result = await saveAllBudgetTiers(currentUser.id, budgetData);
        console.log('Save result:', result);
        
        if (result) {
            userBudgetData = result;
            showToast('Budget saved successfully!', 'success');
        } else {
            showToast('Failed to save budget', 'error');
        }
    } catch (error) {
        console.error('Error saving budget:', error);
        showToast('Failed to save budget: ' + error.message, 'error');
    }
}

// ========================================
// BUDGET CALCULATION
// ========================================

function getSelectedTiers() {
    return {
        flight: document.querySelector('input[name="flight"]:checked')?.value || 'economy',
        hotels: document.querySelector('input[name="hotels"]:checked')?.value || 'budget',
        food: document.querySelector('input[name="food"]:checked')?.value || 'budget',
        activities: document.querySelector('input[name="activities"]:checked')?.value || 'basic',
        shopping: document.querySelector('input[name="shopping"]:checked')?.value || 'minimal'
    };
}

function calculateBudgetForTiers(tiers, days) {
    const flightCost = BUDGET_PRICING.flight[tiers.flight] || 0;
    const hotelsCost = (BUDGET_PRICING.hotels[tiers.hotels] || 0) * (days - 1); // nights = days - 1
    const foodCost = (BUDGET_PRICING.food[tiers.food] || 0) * days;
    const activitiesCost = (BUDGET_PRICING.activities[tiers.activities] || 0) * days;
    const shoppingCost = BUDGET_PRICING.shopping[tiers.shopping] || 0;
    
    const total = flightCost + hotelsCost + foodCost + activitiesCost + shoppingCost;
    const dailyExcludingFlight = (hotelsCost + foodCost + activitiesCost + shoppingCost) / days;
    
    return {
        flight: flightCost,
        hotels: hotelsCost,
        food: foodCost,
        activities: activitiesCost,
        shopping: shoppingCost,
        total: total,
        perDay: dailyExcludingFlight
    };
}

function calculateBudget() {
    const tiers = getSelectedTiers();
    const costs = calculateBudgetForTiers(tiers, tripDays);
    
    // Update display
    document.getElementById('budgetTotalAmount').textContent = formatCurrency(costs.total);
    document.getElementById('budgetPerDay').textContent = formatCurrency(costs.perDay);
    
    // Update breakdown
    document.getElementById('breakdownFlight').textContent = '$' + formatCurrency(costs.flight);
    document.getElementById('breakdownHotels').textContent = '$' + formatCurrency(costs.hotels);
    document.getElementById('breakdownFood').textContent = '$' + formatCurrency(costs.food);
    document.getElementById('breakdownActivities').textContent = '$' + formatCurrency(costs.activities);
    document.getElementById('breakdownShopping').textContent = '$' + formatCurrency(costs.shopping);
    
    // Animate the total
    animateBudgetTotal(costs.total);
}

function formatCurrency(amount) {
    return Math.round(amount).toLocaleString();
}

function animateBudgetTotal(target) {
    const element = document.getElementById('budgetTotalAmount');
    const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const duration = 500;
    const steps = 30;
    const increment = (target - current) / steps;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        const value = current + (increment * step);
        element.textContent = formatCurrency(value);
        
        if (step >= steps) {
            element.textContent = formatCurrency(target);
            clearInterval(timer);
        }
    }, duration / steps);
}

