// ========================================
// JAPAN 2026 - Avatar Picker Module
// ========================================

// Default avatar options (used when no custom avatars are generated)
const DEFAULT_AVATAR_OPTIONS = [
    { id: 'avatar-1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffdfbf', name: 'Adventurer 1' },
    { id: 'avatar-2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=c0aede', name: 'Adventurer 2' },
    { id: 'avatar-3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=b6e3f4', name: 'Adventurer 3' },
    { id: 'avatar-4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=ffd5dc', name: 'Adventurer 4' },
    { id: 'avatar-5', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver&backgroundColor=d1f4d1', name: 'Adventurer 5' },
    { id: 'avatar-6', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Coco&backgroundColor=ffe4b5', name: 'Adventurer 6' },
    { id: 'avatar-7', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix&backgroundColor=ffdfbf', name: 'Style 1' },
    { id: 'avatar-8', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka&backgroundColor=c0aede', name: 'Style 2' },
    { id: 'avatar-9', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Milo&backgroundColor=b6e3f4', name: 'Style 3' },
    { id: 'avatar-10', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffdfbf', name: 'Notion 1' },
    { id: 'avatar-11', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Luna&backgroundColor=ffd5dc', name: 'Notion 2' },
    { id: 'avatar-12', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=d1f4d1', name: 'Notion 3' },
];

// Avatar style names (matching the generator utility - Japanese themed)
const AVATAR_STYLE_NAMES = ['Ukiyo-e', 'Sakura Anime', 'Sumi-e Ink', 'Shrine Spirit', 'Neo Tokyo', 'Ghibli Dream'];

let selectedAvatarUrl = null;
let avatarPickerCallback = null;

// ========================================
// SHOW AVATAR PICKER
// ========================================

function showAvatarPicker(userName, callback) {
    avatarPickerCallback = callback;
    selectedAvatarUrl = null;
    
    // Get user-specific avatar options if available
    const user = users.find(u => u.name === userName);
    const userAvatarOptions = user?.avatar_options || [];
    const hasCustomAvatars = userAvatarOptions.length > 0;
    
    // Build avatar options HTML
    let avatarOptionsHTML = '';
    
    if (hasCustomAvatars) {
        // Show user's generated avatars
        avatarOptionsHTML = `
            <div class="avatar-section">
                <h3 class="avatar-section-title">Your Personal Avatars</h3>
                <div class="avatar-picker-grid">
                    ${userAvatarOptions.map((url, index) => `
                        <div class="avatar-option custom-avatar" data-avatar-url="${url}">
                            <img src="${url}" alt="${AVATAR_STYLE_NAMES[index] || 'Avatar ' + (index + 1)}">
                            <span class="avatar-style-label">${AVATAR_STYLE_NAMES[index] || ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="avatar-section">
                <h3 class="avatar-section-title">Or Choose a Generic Avatar</h3>
                <div class="avatar-picker-grid generic-grid">
                    ${DEFAULT_AVATAR_OPTIONS.slice(0, 6).map(avatar => `
                        <div class="avatar-option" data-avatar-url="${avatar.url}">
                            <img src="${avatar.url}" alt="${avatar.name}">
                        </div>
                    `).join('')}
                    <!-- Upload custom option -->
                    <div class="avatar-option avatar-upload" id="avatarUploadBtn">
                        <div class="upload-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                        </div>
                        <span>Upload</span>
                        <input type="file" id="avatarFileInput" accept="image/*" hidden>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Show default avatar options
        avatarOptionsHTML = `
            <div class="avatar-picker-grid">
                ${DEFAULT_AVATAR_OPTIONS.map(avatar => `
                    <div class="avatar-option" data-avatar-url="${avatar.url}">
                        <img src="${avatar.url}" alt="${avatar.name}">
                    </div>
                `).join('')}
                <!-- Upload custom option -->
                <div class="avatar-option avatar-upload" id="avatarUploadBtn">
                    <div class="upload-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                    </div>
                    <span>Upload</span>
                    <input type="file" id="avatarFileInput" accept="image/*" hidden>
                </div>
            </div>
        `;
    }
    
    const pickerHTML = `
        <div class="avatar-picker-header">
            <h2>Choose Your Avatar</h2>
            <p class="avatar-picker-subtitle">Select a profile picture for <span class="highlight">${userName}</span></p>
        </div>
        
        ${avatarOptionsHTML}
        
        <!-- Preview section -->
        <div class="avatar-preview-section hidden" id="avatarPreviewSection">
            <div class="avatar-preview">
                <img id="avatarPreviewImg" src="" alt="Preview">
            </div>
            <p class="preview-label">Preview</p>
        </div>
        
        <div class="avatar-picker-actions">
            <button class="btn-secondary" id="avatarSkipBtn">Skip for now</button>
            <button class="btn-primary" id="avatarConfirmBtn" disabled>
                <span>Confirm & Continue</span>
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    `;
    
    showModal(pickerHTML);
    
    // Add event listeners
    setupAvatarPickerEvents();
}

function setupAvatarPickerEvents() {
    const avatarOptions = document.querySelectorAll('.avatar-option:not(.avatar-upload)');
    const uploadBtn = document.getElementById('avatarUploadBtn');
    const fileInput = document.getElementById('avatarFileInput');
    const previewSection = document.getElementById('avatarPreviewSection');
    const previewImg = document.getElementById('avatarPreviewImg');
    const confirmBtn = document.getElementById('avatarConfirmBtn');
    const skipBtn = document.getElementById('avatarSkipBtn');
    
    // Click on avatar option
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            
            selectedAvatarUrl = option.dataset.avatarUrl;
            
            // Show preview
            previewSection.classList.remove('hidden');
            previewImg.src = selectedAvatarUrl;
            
            // Enable confirm button
            confirmBtn.disabled = false;
        });
    });
    
    // Upload button click
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast('Image must be less than 2MB', 'error');
                return;
            }
            
            // Convert to base64 for storage
            const reader = new FileReader();
            reader.onload = (event) => {
                selectedAvatarUrl = event.target.result;
                
                // Remove previous selection
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                uploadBtn.classList.add('selected');
                
                // Show preview
                previewSection.classList.remove('hidden');
                previewImg.src = selectedAvatarUrl;
                
                // Enable confirm button
                confirmBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Confirm button
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
    
    // Skip button
    skipBtn.addEventListener('click', () => {
        hideModal();
        if (avatarPickerCallback) {
            avatarPickerCallback(null);
        }
    });
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
