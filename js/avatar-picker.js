// ========================================
// JAPAN 2026 - Avatar Picker Module
// ========================================

// Avatar style names (matching the generator utility - Japanese themed)
const AVATAR_STYLE_NAMES = ['Ukiyo-e', 'Sakura Anime', 'Sumi-e Ink', 'Shrine Spirit', 'Neo Tokyo', 'Ghibli Dream'];

let selectedAvatarUrl = null;
let avatarPickerCallback = null;
let currentUserAvatarOptions = [];

// ========================================
// SHOW AVATAR PICKER
// ========================================

function showAvatarPicker(userName, callback) {
    avatarPickerCallback = callback;
    selectedAvatarUrl = null;

    // Get user-specific avatar options if available
    const user = users.find(u => u.name === userName);
    currentUserAvatarOptions = user?.avatar_options || [];
    const hasCustomAvatars = currentUserAvatarOptions.length > 0;

    // Build avatar options HTML
    let avatarOptionsHTML = '';

    if (hasCustomAvatars) {
        // Show user's generated avatars in a 3x2 grid
        avatarOptionsHTML = `
            <div class="avatar-grid-view" id="avatarGridView">
                <div class="avatar-picker-grid">
                    ${currentUserAvatarOptions.map((url, index) => `
                        <div class="avatar-option custom-avatar" data-avatar-url="${url}" data-index="${index}">
                            <img src="${url}" alt="${AVATAR_STYLE_NAMES[index] || 'Avatar ' + (index + 1)}">
                        </div>
                    `).join('')}
                </div>
                <div class="avatar-picker-actions">
                    <button class="btn-secondary" id="avatarSkipBtn">Skip for now</button>
                </div>
            </div>
        `;
    } else {
        // No custom avatars available
        avatarOptionsHTML = `
            <div class="avatar-grid-view" id="avatarGridView">
                <p class="avatar-no-options">No avatars available for this user.</p>
                <div class="avatar-picker-actions">
                    <button class="btn-secondary" id="avatarSkipBtn">Skip for now</button>
                </div>
            </div>
        `;
    }

    const pickerHTML = `
        <div class="avatar-picker-container">
            <div class="avatar-picker-header">
                <h2>Choose Your Avatar</h2>
                <p class="avatar-picker-subtitle">Select a profile picture for <span class="highlight">${userName}</span></p>
            </div>

            ${avatarOptionsHTML}

            <!-- Full Preview View (hidden initially) -->
            <div class="avatar-full-preview hidden" id="avatarFullPreview">
                <div class="avatar-full-image">
                    <img id="avatarPreviewImg" src="" alt="Preview">
                </div>
                <div class="avatar-preview-actions">
                    <button class="btn-secondary" id="avatarBackBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        <span>Back</span>
                    </button>
                    <button class="btn-primary" id="avatarConfirmBtn">
                        <span>Confirm & Continue</span>
                        <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    showModal(pickerHTML, 'avatar-picker-modal');

    // Add event listeners
    setupAvatarPickerEvents();
}

function setupAvatarPickerEvents() {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const gridView = document.getElementById('avatarGridView');
    const fullPreview = document.getElementById('avatarFullPreview');
    const previewImg = document.getElementById('avatarPreviewImg');
    const backBtn = document.getElementById('avatarBackBtn');
    const confirmBtn = document.getElementById('avatarConfirmBtn');
    const skipBtn = document.getElementById('avatarSkipBtn');

    // Click on avatar option - show full preview
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedAvatarUrl = option.dataset.avatarUrl;

            // Show full preview
            previewImg.src = selectedAvatarUrl;
            gridView.classList.add('hidden');
            fullPreview.classList.remove('hidden');
        });
    });

    // Back button - return to grid
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            fullPreview.classList.add('hidden');
            gridView.classList.remove('hidden');
            selectedAvatarUrl = null;
        });
    }

    // Confirm button
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (selectedAvatarUrl && avatarPickerCallback) {
                await saveUserAvatar(currentUser.id, selectedAvatarUrl);
                currentUser.avatar_url = selectedAvatarUrl;

                // Update the user in the global users array
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex >= 0) {
                    users[userIndex].avatar_url = selectedAvatarUrl;
                }

                hideModal();
                avatarPickerCallback(selectedAvatarUrl);
            }
        });
    }

    // Skip button
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            hideModal();
            if (avatarPickerCallback) {
                avatarPickerCallback(null);
            }
        });
    }
}

// ========================================
// SAVE AVATAR TO DATABASE
// ========================================

async function saveUserAvatar(userId, avatarUrl) {
    if (!supabaseClient) {
        // Demo mode - save to localStorage
        const storedAvatars = localStorage.getItem('japan2026_avatars');
        const avatars = storedAvatars ? JSON.parse(storedAvatars) : {};
        avatars[userId] = avatarUrl;
        localStorage.setItem('japan2026_avatars', JSON.stringify(avatars));
        return { success: true };
    }

    // Update in Supabase
    const { data, error } = await supabaseClient
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error saving avatar:', error);
        showToast('Failed to save avatar', 'error');
        return null;
    }

    return data;
}

async function getUserAvatar(userId) {
    if (!supabaseClient) {
        // Demo mode - get from localStorage
        const storedAvatars = localStorage.getItem('japan2026_avatars');
        if (storedAvatars) {
            const avatars = JSON.parse(storedAvatars);
            return avatars[userId] || null;
        }
        return null;
    }

    // Get from Supabase - already included in user data
    return null;
}

// ========================================
// CHANGE AVATAR (from main app)
// ========================================

function showChangeAvatarModal() {
    if (!currentUser) return;

    showAvatarPicker(currentUser.name, (newAvatarUrl) => {
        if (newAvatarUrl) {
            // Update nav avatar
            updateNavUser();
            showToast('Avatar updated!', 'success');
        }
    });
}

// ========================================
// INITIALIZE - Load saved avatars for demo mode
// ========================================

async function loadUserAvatars() {
    if (!supabaseClient) {
        const storedAvatars = localStorage.getItem('japan2026_avatars');
        if (storedAvatars) {
            const avatars = JSON.parse(storedAvatars);
            users.forEach(user => {
                if (avatars[user.id]) {
                    user.avatar_url = avatars[user.id];
                }
            });
        }
    }
}
