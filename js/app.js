// ========================================
// JAPAN 2026 - Main Application
// ========================================

// Global state
let currentUser = null;
let users = [];
let isSupabaseConnected = false;
let currentTheme = 'sakura';

// DOM Elements (will be initialized after DOM loads)
let landingScreen, appContainer, userGrid, continueSection, selectedUserName;
let continueBtn, navUserAvatar, navUserName, switchUserBtn;
let modalOverlay, modalClose, modalContent, toastContainer;
let themeSelectLanding, themeSelectNav;

// Theme definitions
const THEMES = [
    { id: 'sakura', name: 'Sakura Nights' },
    { id: 'kanagawa', name: 'Kanagawa Wave' },
    { id: 'torii', name: 'Torii Vermillion' },
    { id: 'bamboo', name: 'Bamboo Zen' },
    { id: 'momiji', name: 'Momiji Autumn' },
    { id: 'kintsugi', name: 'Kintsugi Gold' },
];

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🗾 Japan 2026 Trip Planner initializing...');
    
    // Initialize DOM references
    landingScreen = document.getElementById('landingScreen');
    appContainer = document.getElementById('appContainer');
    userGrid = document.getElementById('userGrid');
    continueSection = document.getElementById('continueSection');
    selectedUserName = document.getElementById('selectedUserName');
    continueBtn = document.getElementById('continueBtn');
    navUserAvatar = document.getElementById('navUserAvatar');
    navUserName = document.getElementById('navUserName');
    switchUserBtn = document.getElementById('switchUserBtn');
    modalOverlay = document.getElementById('modalOverlay');
    modalClose = document.getElementById('modalClose');
    modalContent = document.getElementById('modalContent');
    toastContainer = document.getElementById('toastContainer');
    themeSelectLanding = document.getElementById('themeSelectLanding');
    themeSelectNav = document.getElementById('themeSelectNav');
    
    // Debug: Check if elements exist
    console.log('DOM Elements found:', {
        userGrid: !!userGrid,
        continueBtn: !!continueBtn,
        landingScreen: !!landingScreen
    });
    
    // Set up event listeners
    setupEventListeners();

    // Initialize theme selector
    initThemeSelectors();
    const storedTheme = localStorage.getItem('japan2026_theme') || 'sakura';
    applyTheme(storedTheme);
    
    // Initialize Supabase
    isSupabaseConnected = initSupabase();
    console.log('Supabase connected:', isSupabaseConnected);
    
    // Load users
    try {
        users = await getUsers();
        console.log('Users loaded:', users.length, users);
    } catch (err) {
        console.error('Error loading users:', err);
        users = [];
    }
    
    // If no users loaded, something is wrong - show debug info
    if (!users || users.length === 0) {
        console.error('No users loaded! Using fallback.');
        // Direct fallback
        users = [
            { id: 'fallback-0', name: 'Julian', initials: 'J', color: '#ff5c8d' },
            { id: 'fallback-1', name: 'Dave', initials: 'D', color: '#5ce1e6' },
            { id: 'fallback-2', name: 'Jason', initials: 'Js', color: '#b06cff' },
            { id: 'fallback-3', name: 'Frank', initials: 'F', color: '#ff9a5c' },
            { id: 'fallback-4', name: 'Cathy', initials: 'C', color: '#ffd93d' },
            { id: 'fallback-5', name: 'Matylda', initials: 'M', color: '#4ade80' },
            { id: 'fallback-6', name: 'Patryk', initials: 'P', color: '#ff8fab' }
        ];
    }
    
    // Initialize seed data (don't await - let it run in background)
    initializeSeedData().catch(err => console.error('Seed data error:', err));
    
    // Load saved avatars for demo mode
    if (typeof loadUserAvatars === 'function') {
        await loadUserAvatars();
    }
    
    // Check for stored user
    const storedUserId = localStorage.getItem('japan2026_currentUser');
    if (storedUserId) {
        const storedUser = users.find(u => u.id === storedUserId);
        if (storedUser) {
            currentUser = storedUser;
            showApp();
            return;
        }
    }
    
    // Show landing page
    console.log('Rendering user selection with', users.length, 'users');
    renderUserSelection();
    initSakuraPetals();
});

// ========================================
// EVENT LISTENERS SETUP
// ========================================

function setupEventListeners() {
    // Continue button - now triggers avatar picker
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (!currentUser) return;
            
            // Check if user already has an avatar
            if (currentUser.avatar_url) {
                // User has avatar, go directly to app
                localStorage.setItem('japan2026_currentUser', currentUser.id);
                showApp();
            } else {
                // Show avatar picker
                showAvatarPicker(currentUser.name, (avatarUrl) => {
                    localStorage.setItem('japan2026_currentUser', currentUser.id);
                    showApp();
                });
            }
        });
    }
    
    // Switch user button
    if (switchUserBtn) {
        switchUserBtn.addEventListener('click', () => {
            localStorage.removeItem('japan2026_currentUser');
            currentUser = null;
            appContainer.classList.add('hidden');
            landingScreen.classList.remove('hidden');
            continueSection.classList.add('hidden');
            renderUserSelection();
        });
    }

    // Theme selectors
    if (themeSelectLanding) {
        themeSelectLanding.addEventListener('change', (e) => {
            applyTheme(e.target.value);
            if (themeSelectNav) themeSelectNav.value = e.target.value;
        });
    }
    if (themeSelectNav) {
        themeSelectNav.addEventListener('change', (e) => {
            applyTheme(e.target.value);
            if (themeSelectLanding) themeSelectLanding.value = e.target.value;
        });
    }
    
    // Nav avatar click - change avatar
    const navAvatarWrapper = document.getElementById('navAvatarWrapper');
    if (navAvatarWrapper) {
        navAvatarWrapper.addEventListener('click', () => {
            if (typeof showChangeAvatarModal === 'function') {
                showChangeAvatarModal();
            }
        });
    }
    
    // Modal close button
    if (modalClose) {
        modalClose.addEventListener('click', hideModal);
    }
    
    // Modal overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && !modalOverlay.classList.contains('hidden')) {
            hideModal();
        }
    });
}

// ========================================
// USER SELECTION
// ========================================

function renderUserSelection() {
    if (!userGrid) {
        console.error('userGrid element not found!');
        return;
    }
    
    if (!users || users.length === 0) {
        userGrid.innerHTML = '<p style="color: white; text-align: center;">No users found. Please check console for errors.</p>';
        return;
    }
    
    console.log('Rendering', users.length, 'users to grid');
    
    userGrid.innerHTML = users.map(user => {
        const hasAvatar = user.avatar_url && user.avatar_url.length > 0;
        const bgStyle = hasAvatar 
            ? 'background: transparent;' 
            : `background: linear-gradient(135deg, ${user.color || '#ff5c8d'}, ${adjustColor(user.color || '#ff5c8d', -30)});`;
        
        return `
            <div class="user-card" data-user-id="${user.id}">
                <div class="user-avatar" style="${bgStyle}">
                    ${hasAvatar 
                        ? `<img src="${user.avatar_url}" alt="${user.name}">`
                        : user.initials || user.name.charAt(0)
                    }
                </div>
                <span class="user-name">${user.name}</span>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    userGrid.querySelectorAll('.user-card').forEach(card => {
        card.addEventListener('click', () => selectUser(card.dataset.userId));
    });
    
    console.log('User cards rendered:', userGrid.children.length);
}

function selectUser(userId) {
    // Remove previous selection
    userGrid.querySelectorAll('.user-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Find and select user
    const user = users.find(u => u.id === userId);
    if (!user) return;

    currentUser = user;

    // Update UI
    const card = userGrid.querySelector(`[data-user-id="${userId}"]`);
    if (card) {
        card.classList.add('selected');
    }

    // Immediately show avatar picker
    showAvatarPicker(currentUser.name, (avatarUrl) => {
        localStorage.setItem('japan2026_currentUser', currentUser.id);
        showApp();
    });
}

function showApp() {
    // Hide landing, show app
    if (landingScreen) landingScreen.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
    
    // Update nav user info
    updateNavUser();
    
    // Initialize sections
    if (typeof initDashboard === 'function') initDashboard();
    if (typeof initAvailability === 'function') initAvailability();
    if (typeof initDestinations === 'function') initDestinations();
    if (typeof initAttractions === 'function') initAttractions();
    
    // Set up navigation
    initNavigation();
    
    // Show default section
    showSection('dashboard');
}

function updateNavUser() {
    if (!currentUser) return;
    
    if (navUserAvatar) {
        if (currentUser.avatar_url) {
            navUserAvatar.innerHTML = `<img src="${currentUser.avatar_url}" alt="${currentUser.name}">`;
            navUserAvatar.style.background = 'transparent';
        } else {
            navUserAvatar.innerHTML = currentUser.initials || currentUser.name.charAt(0);
            navUserAvatar.style.background = `linear-gradient(135deg, ${currentUser.color || '#ff5c8d'}, ${adjustColor(currentUser.color || '#ff5c8d', -30)})`;
        }
    }
    if (navUserName) navUserName.textContent = currentUser.name;
}

// ========================================
// THEME HANDLING
// ========================================

function initThemeSelectors() {
    const options = THEMES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    if (themeSelectLanding) themeSelectLanding.innerHTML = options;
    if (themeSelectNav) themeSelectNav.innerHTML = options;
}

function applyTheme(themeId) {
    currentTheme = themeId;
    localStorage.setItem('japan2026_theme', themeId);
    document.body.classList.remove(...THEMES.map(t => `theme-${t.id}`));
    document.body.classList.add(`theme-${themeId}`);

    // Sync selects
    if (themeSelectLanding) themeSelectLanding.value = themeId;
    if (themeSelectNav) themeSelectNav.value = themeId;

    // Toggle Sakura petals for both landing and app containers
    const landingPetals = document.getElementById('sakuraPetals');
    const appPetals = document.getElementById('appSakuraPetals');
    if (landingPetals) {
        landingPetals.style.display = themeId === 'sakura' ? 'block' : 'none';
    }
    if (appPetals) {
        appPetals.style.display = themeId === 'sakura' ? 'block' : 'none';
    }
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            showSection(hash);
        }
    });
    
    // Card links
    document.querySelectorAll('.card-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href').slice(1);
            showSection(hash);
        });
    });
}

function showSection(sectionId) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    
    // Show section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    // Update URL hash
    history.replaceState(null, null, `#${sectionId}`);
    
    // Refresh section data if needed
    switch(sectionId) {
        case 'dashboard':
            if (typeof refreshDashboard === 'function') refreshDashboard();
            break;
        case 'availability':
            if (typeof refreshAvailability === 'function') refreshAvailability();
            break;
        case 'destinations':
            if (typeof refreshDestinations === 'function') refreshDestinations();
            break;
        case 'attractions':
            if (typeof refreshAttractions === 'function') refreshAttractions();
            break;
    }
}

// ========================================
// MODAL HANDLING
// ========================================

function showModal(content, modalClass = '') {
    if (modalContent) modalContent.innerHTML = content;
    if (modalOverlay) {
        modalOverlay.classList.remove('hidden');
        // Add custom modal class if provided
        const modal = modalOverlay.querySelector('.modal');
        if (modal) {
            modal.className = 'modal' + (modalClass ? ' ' + modalClass : '');
        }
    }
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    if (modalOverlay) modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'info') {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    if (toastContainer) {
        toastContainer.appendChild(toast);
        
        // Remove after animation
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function adjustColor(color, amount) {
    if (!color || typeof color !== 'string') return '#ff5c8d';
    const hex = color.replace('#', '');
    if (hex.length !== 6) return color;
    
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateRange(start, end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
}

function getDaysBetween(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Get user by ID from global users array
function getUserFromId(userId) {
    return users.find(u => u.id === userId);
}

// ========================================
// SAKURA PETALS ANIMATION
// ========================================

function initSakuraPetals() {
    const petalCount = 20;

    // Initialize petals for landing page
    const landingContainer = document.getElementById('sakuraPetals');
    if (landingContainer) {
        for (let i = 0; i < petalCount; i++) {
            createPetal(landingContainer, i);
        }
    }

    // Initialize petals for app container
    const appContainer = document.getElementById('appSakuraPetals');
    if (appContainer) {
        for (let i = 0; i < petalCount; i++) {
            createPetal(appContainer, i);
        }
    }
}

function createPetal(container, index) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    
    // Randomize properties
    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 10;
    const delay = -(Math.random() * duration); // start mid-animation for continuous flow
    const size = 8 + Math.random() * 8;
    
    petal.style.cssText = `
        left: ${left}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        width: ${size}px;
        height: ${size}px;
        opacity: ${0.3 + Math.random() * 0.4};
    `;
    
    container.appendChild(petal);
}
