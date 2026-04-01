/**
 * Dark Custom New Tab - Logic File
 * Handles Search Operators and Background Image Switching
 */

const initNewTab = () => {
    const bubble = document.getElementById('bubbleWrap');
    const trigger = document.getElementById('dropTrigger');
    const searchForm = document.getElementById('searchForm');
    const fileExtInput = document.getElementById('fileExtInput');
    
    // Background Image Elements
    const bgInput = document.getElementById('bgInput');
    const customizeBtn = document.getElementById('customizeBtn');
    const defaultBgUrl = 'theme_ntp_background.png';

    const getBoolSetting = (key, defaultVal) => {
        const val = localStorage.getItem(key);
        if (val === null) return defaultVal;
        return val === 'true';
    };

    // Load saved background or fallback to default
    const loadBackground = () => {
        const savedBg = localStorage.getItem('customBackground');
        if (savedBg) {
            document.body.style.backgroundImage = `url(${savedBg})`;
        } else {
            document.body.style.backgroundImage = `url(${defaultBgUrl})`;
        }
    };

    loadBackground();

    const settings = {
        ai: localStorage.getItem('aiEnabled') !== 'false', 
        exact: getBoolSetting('exactEnabled', false),
        reddit: getBoolSetting('redditEnabled', false),
        fileEnabled: getBoolSetting('fileEnabled', false),
        fileType: localStorage.getItem('lastFileType') || 'pdf'
    };

    const toggles = {
        ai: document.getElementById('aiToggleCheckbox'),
        exact: document.getElementById('verbatimToggle'),
        reddit: document.getElementById('pastYearToggle'),
        file: document.getElementById('imagesToggle')
    };

    // Initialize UI State
    if (toggles.ai) toggles.ai.checked = settings.ai;
    if (toggles.exact) toggles.exact.checked = settings.exact;
    if (toggles.reddit) toggles.reddit.checked = settings.reddit;
    if (toggles.file) toggles.file.checked = settings.fileEnabled;
    if (fileExtInput) fileExtInput.value = settings.fileType;

    const updateSetting = (key, value) => {
        settings[key] = value;
        const storageKey = key === 'fileType' ? 'lastFileType' : key + 'Enabled';
        localStorage.setItem(storageKey, value.toString());
    };

    // Listeners
    toggles.ai?.addEventListener('change', function() { updateSetting('ai', this.checked); });
    toggles.exact?.addEventListener('change', function() { updateSetting('exact', this.checked); });
    toggles.reddit?.addEventListener('change', function() { updateSetting('reddit', this.checked); });
    toggles.file?.addEventListener('change', function() { updateSetting('fileEnabled', this.checked); });
    
    fileExtInput?.addEventListener('input', function() {
        updateSetting('fileType', this.value.trim().toLowerCase());
    });

    // Background Change Logic - Triggered by the Pencil Icon
    customizeBtn?.addEventListener('click', () => bgInput.click());

    // Reset to default on Right Click of the pencil icon
    customizeBtn?.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        localStorage.removeItem('customBackground');
        loadBackground();
    });

    bgInput?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Image = event.target.result;
                document.body.style.backgroundImage = `url(${base64Image})`;
                try {
                    localStorage.setItem('customBackground', base64Image);
                } catch (err) {
                    console.error("Image too large for local storage.");
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Dropdown Logic
    const handleToggleDropdown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        bubble?.classList.toggle('active');
    };

    if (trigger) {
        trigger.addEventListener('click', handleToggleDropdown);
    }

    document.addEventListener('click', (e) => {
        if (bubble && bubble.classList.contains('active') && !bubble.contains(e.target)) {
            bubble.classList.remove('active');
        }
    });

    searchForm?.addEventListener('submit', function(e) {
        const input = document.getElementById('searchInput');
        if (!input) return;

        let query = input.value.trim();
        if (query === "") {
            e.preventDefault();
            return;
        }

        // Handle URL parameters for AI avoidance
        // We remove existing udm inputs to avoid duplicates
        const existingUdm = searchForm.querySelector('input[name="udm"]');
        if (existingUdm) existingUdm.remove();

        if (toggles.ai && !toggles.ai.checked) {
            const udmInput = document.createElement('input');
            udmInput.type = 'hidden';
            udmInput.name = 'udm';
            udmInput.value = '14';
            searchForm.appendChild(udmInput);
        }

        let modifiedQuery = query;
        if (toggles.exact?.checked) modifiedQuery = `"${modifiedQuery}"`;
        if (toggles.reddit?.checked) modifiedQuery += " site:reddit.com";
        if (toggles.file?.checked) {
            const ext = fileExtInput.value.trim() || 'pdf';
            modifiedQuery += ` filetype:${ext}`;
        }

        input.value = modifiedQuery;
        
        // Restore visual query after a short delay so user doesn't see the operators in the box
        setTimeout(() => { if (input) input.value = query; }, 500);
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewTab);
} else {
    initNewTab();
}