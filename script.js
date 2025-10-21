// Enhanced Key Generator with iOS 18 Design
class KeyGenerator {
    constructor() {
        this.keys = [];
        this.historySize = 10;
        this.expirationHours = 24;
        this.generationCooldown = 86400; // 5 seconds for testing (change to 86400 for 24 hours)
        this.confirmationResolve = null;
        this.lastGenerationTime = this.getLastGenerationTime();
        this.adminCode = "LYORABEST"; // Change this to your preferred admin code
        this.init();
    }
    
    async init() {
        await this.loadKeys();
        this.loadHistory();
        this.setupEventListeners();
        this.updateStats();
        this.createConfirmationModal();
        this.updateGenerateButtonState();
        this.startTimerUpdate();
    }
    
    // Load keys from the provided URL
    async loadKeys() {
        try {
            const response = await fetch('https://pastefy.app/tlJgJv8C/raw');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            this.keys = text.split('\n')
                .filter(key => key.trim() !== '')
                .map(key => key.trim());
            
            if (this.keys.length === 0) {
                throw new Error('No keys found in the provided URL');
            }
            
            console.log(`Loaded ${this.keys.length} keys from source`);
        } catch (error) {
            console.error('Error loading keys:', error);
            // Fallback to some default keys if the URL fails
            this.keys = [
                'iOS18-K3Y-1A2B3C4D5E6F7G8H',
                'iOS18-K3Y-9I0J1K2L3M4N5O6P',
                'iOS18-K3Y-7Q8R9S0T1U2V3W4X',
                'iOS18-K3Y-5Y6Z7A8B9C0D1E2F',
                'iOS18-K3Y-3G4H5I6J7K8L9M0N',
                'iOS18-K3Y-1O2P3Q4R5S6T7U8V',
                'iOS18-K3Y-9W0X1Y2Z3A4B5C6D',
                'iOS18-K3Y-7E8F9G0H1I2J3K4L',
                'iOS18-K3Y-5M6N7O8P9Q0R1S2T',
                'iOS18-K3Y-3U4V5W6X7Y8Z9A0B'
            ];
            this.showToast('Using fallback keys - source unavailable', 'warning');
        }
    }
    
    setupEventListeners() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', () => {
            this.generateKey();
        });
        
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.addEventListener('click', () => {
            this.copyKeyToClipboard();
        });
        
        const clearHistoryBtn = document.getElementById('clearHistory');
        clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.generateKey();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                this.copyKeyToClipboard();
            }
        });
    }
    
    startTimerUpdate() {
        // Update timer every second
        setInterval(() => {
            this.updateGenerateButtonState();
        }, 1000);
    }
    
    getLastGenerationTime() {
        return parseInt(localStorage.getItem('lastGenerationTime') || '0');
    }
    
    setLastGenerationTime() {
        const currentTime = Math.floor(Date.now() / 1000);
        localStorage.setItem('lastGenerationTime', currentTime.toString());
        this.lastGenerationTime = currentTime;
    }
    
    getRemainingCooldown() {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceLastGeneration = currentTime - this.lastGenerationTime;
        return Math.max(0, this.generationCooldown - timeSinceLastGeneration);
    }
    
    formatTime(seconds) {
        if (this.generationCooldown === 86400) {
            // Format for 24 hours: HH:MM:SS
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            // Format for testing: show seconds
            return `${seconds}s`;
        }
    }
    
    canGenerateKey() {
        return this.getRemainingCooldown() === 0;
    }
    
    updateGenerateButtonState() {
        const generateBtn = document.getElementById('generateBtn');
        const remainingCooldown = this.getRemainingCooldown();
        
        if (remainingCooldown > 0) {
            // Cooldown active
            generateBtn.disabled = true;
            const timeDisplay = this.formatTime(remainingCooldown);
            generateBtn.innerHTML = `
                <i class="fas fa-clock"></i>
                <span class="button-text">Next: ${timeDisplay}</span>
            `;
            generateBtn.style.background = 'linear-gradient(135deg, #8e8e93, #a8a8ad)';
            generateBtn.style.cursor = 'not-allowed';
            generateBtn.classList.add('cooldown-pulse');
        } else {
            // Ready to generate
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <i class="fas fa-plus-circle"></i>
                <span class="button-text">Generate New Key</span>
            `;
            generateBtn.style.background = 'linear-gradient(135deg, var(--ios-primary), var(--ios-primary-light))';
            generateBtn.style.cursor = 'pointer';
            generateBtn.classList.remove('cooldown-pulse');
        }
    }
    
    generateKey() {
        if (!this.canGenerateKey()) {
            const remainingCooldown = this.getRemainingCooldown();
            const timeDisplay = this.formatTime(remainingCooldown);
            this.showToast(`Please wait ${timeDisplay} before generating a new key`, 'warning');
            return;
        }
        
        if (this.keys.length === 0) {
            this.updateKeyDisplay('No keys available. Please try again.');
            return;
        }
        
        // Get a random key from the loaded keys
        const randomIndex = Math.floor(Math.random() * this.keys.length);
        const key = this.keys[randomIndex];
        const timestamp = new Date().toISOString();
        
        // Update the display
        this.updateKeyDisplay(key);
        
        // Add to history
        this.addToHistory(key, timestamp);
        
        // Update stats
        this.updateStats();
        
        // Set cooldown
        this.setLastGenerationTime();
        this.updateGenerateButtonState();
        
        // Add visual feedback
        this.animateButton();
        
        this.showToast('New key generated successfully!', 'success');
    }
    
    updateKeyDisplay(key) {
        const keyText = document.getElementById('keyText');
        keyText.textContent = key;
        
        // Add animation
        const keyDisplay = document.getElementById('keyDisplay');
        keyDisplay.classList.remove('pulse');
        void keyDisplay.offsetWidth; // Trigger reflow
        keyDisplay.classList.add('pulse');
    }
    
    addToHistory(key, timestamp) {
        const history = this.getHistory();
        
        // Create new history item
        const historyItem = {
            key: key,
            timestamp: timestamp,
            id: Date.now().toString()
        };
        
        // Add to the beginning of the list
        history.unshift(historyItem);
        
        // Limit history size
        if (history.length > this.historySize) {
            history.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('keyHistory', JSON.stringify(history));
        
        // Update the UI
        this.renderHistory();
    }
    
    getHistory() {
        const history = localStorage.getItem('keyHistory');
        return history ? JSON.parse(history) : [];
    }
    
    loadHistory() {
        this.renderHistory();
    }
    
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const history = this.getHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-clock"></i>
                    <p>No recent keys yet</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = '';
        
        history.forEach(item => {
            const isExpired = this.isKeyExpired(item.timestamp);
            const timeAgo = this.getTimeAgo(item.timestamp);
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item fade-in';
            historyItem.innerHTML = `
                <div class="history-key">${item.key}</div>
                <div class="history-meta">
                    <div class="history-time">${timeAgo}</div>
                    ${isExpired ? '<div class="expired-badge">EXPIRED</div>' : ''}
                </div>
            `;
            
            if (isExpired) {
                historyItem.style.opacity = '0.7';
            }
            
            historyList.appendChild(historyItem);
        });
    }
    
    isKeyExpired(timestamp) {
        const keyTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - keyTime) / (1000 * 60 * 60);
        return hoursDiff >= this.expirationHours;
    }
    
    getTimeAgo(timestamp) {
        const keyTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const secondsDiff = Math.floor((currentTime - keyTime) / 1000);
        
        if (secondsDiff < 60) {
            return 'Just now';
        } else if (secondsDiff < 3600) {
            const minutes = Math.floor(secondsDiff / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (secondsDiff < 86400) {
            const hours = Math.floor(secondsDiff / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(secondsDiff / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }
    
    clearHistory() {
        this.showConfirmationModal(
            'Clear All History',
            'Are you sure you want to clear all key history? This action cannot be undone.',
            'trash',
            'Clear'
        ).then(confirmed => {
            if (confirmed) {
                localStorage.removeItem('keyHistory');
                this.renderHistory();
                this.updateStats();
                this.showToast('History cleared successfully', 'success');
            } else {
                this.showToast('Clear cancelled', 'info');
            }
        });
    }
    
    createConfirmationModal() {
        const modalHTML = `
            <div class="confirmation-modal" id="confirmationModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-icon">
                            <i class="fas fa-exclamation"></i>
                        </div>
                        <h3 class="modal-title" id="modalTitle">Confirm Action</h3>
                        <p class="modal-message" id="modalMessage">Are you sure you want to proceed?</p>
                    </div>
                    <div class="modal-body">
                        <div class="modal-actions">
                            <button class="modal-btn modal-btn-cancel ripple" id="modalCancel">
                                <i class="fas fa-times"></i>
                                Cancel
                            </button>
                            <button class="modal-btn modal-btn-confirm ripple" id="modalConfirm">
                                <i class="fas fa-check"></i>
                                <span id="confirmText">Confirm</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup event listeners for modal
        const modal = document.getElementById('confirmationModal');
        const cancelBtn = document.getElementById('modalCancel');
        const confirmBtn = document.getElementById('modalConfirm');
        
        cancelBtn.addEventListener('click', () => this.hideConfirmationModal(false));
        confirmBtn.addEventListener('click', () => this.hideConfirmationModal(true));
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideConfirmationModal(false);
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.hideConfirmationModal(false);
            }
        });
        
        // Add ripple effect to all buttons
        this.addRippleEffectToButtons();
    }
    
    showConfirmationModal(title, message, icon = 'exclamation', confirmText = 'Confirm') {
        return new Promise((resolve) => {
            this.confirmationResolve = resolve;
            
            const modal = document.getElementById('confirmationModal');
            const modalIcon = modal.querySelector('.modal-icon i');
            const modalTitle = document.getElementById('modalTitle');
            const modalMessage = document.getElementById('modalMessage');
            const confirmTextSpan = document.getElementById('confirmText');
            
            // Update modal content based on action type
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            confirmTextSpan.textContent = confirmText;
            
            // Update icon and color based on action type
            const modalIconElement = modal.querySelector('.modal-icon');
            if (icon === 'trash') {
                modalIcon.className = 'fas fa-trash';
                modalIconElement.style.background = 'linear-gradient(135deg, var(--ios-red), #ff6b6b)';
            } else if (icon === 'exclamation') {
                modalIcon.className = 'fas fa-exclamation';
                modalIconElement.style.background = 'linear-gradient(135deg, var(--ios-orange), #ffa726)';
            } else if (icon === 'check') {
                modalIcon.className = 'fas fa-check';
                modalIconElement.style.background = 'linear-gradient(135deg, var(--ios-green), #4cd964)';
            }
            
            // Show modal
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Focus on cancel button for accessibility
            document.getElementById('modalCancel').focus();
        });
    }
    
    hideConfirmationModal(confirmed) {
        const modal = document.getElementById('confirmationModal');
        
        if (!confirmed) {
            // Add shake animation when cancelled
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.add('modal-shake');
            setTimeout(() => {
                modalContent.classList.remove('modal-shake');
            }, 400);
        }
        
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Re-enable scrolling
        
        if (this.confirmationResolve) {
            this.confirmationResolve(confirmed);
            this.confirmationResolve = null;
        }
    }
    
    addRippleEffectToButtons() {
        const buttons = document.querySelectorAll('.ripple');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (this.disabled) return;
                
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    updateStats() {
        const history = this.getHistory();
        const activeKeys = history.filter(item => !this.isKeyExpired(item.timestamp)).length;
        
        document.getElementById('totalKeys').textContent = history.length;
        document.getElementById('activeKeys').textContent = activeKeys;
    }
    
    async copyKeyToClipboard() {
        const keyText = document.getElementById('keyText').textContent;
        
        if (keyText === 'Tap the button to generate a key') {
            this.showToast('No key to copy', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(keyText);
            this.showToast('Key copied to clipboard!', 'success');
            
            // Add visual feedback to copy button
            const copyBtn = document.getElementById('copyBtn');
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.background = 'var(--ios-green)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.background = '';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.showToast('Failed to copy key', 'error');
        }
    }
    
    animateButton() {
        const button = document.getElementById('generateBtn');
        button.classList.remove('pulse');
        void button.offsetWidth; // Trigger reflow
        button.classList.add('pulse');
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast';
        
        // Add type-based styling
        if (type === 'success') {
            toast.style.background = 'rgba(52, 199, 89, 0.9)';
        } else if (type === 'error') {
            toast.style.background = 'rgba(255, 59, 48, 0.9)';
        } else if (type === 'warning') {
            toast.style.background = 'rgba(255, 149, 0, 0.9)';
        } else {
            toast.style.background = 'rgba(0, 0, 0, 0.8)';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Method to check and remove expired keys from history automatically
    cleanupExpiredKeys() {
        const history = this.getHistory();
        const now = new Date().getTime();
        const validHistory = history.filter(item => {
            const keyTime = new Date(item.timestamp).getTime();
            const hoursDiff = (now - keyTime) / (1000 * 60 * 60);
            return hoursDiff < this.expirationHours;
        });
        
        if (validHistory.length !== history.length) {
            localStorage.setItem('keyHistory', JSON.stringify(validHistory));
            this.renderHistory();
            this.updateStats();
        }
    }
    
    // Method to reset cooldown with admin authentication
    resetCooldown() {
        this.showAdminAuthenticationModal().then((success) => {
            if (success) {
                localStorage.removeItem('lastGenerationTime');
                this.lastGenerationTime = 0;
                this.updateGenerateButtonState();
                this.showToast('Cooldown reset successfully by admin', 'success');
            } else {
                this.showToast('Admin authentication failed', 'error');
            }
        });
    }
    
    showAdminAuthenticationModal() {
        return new Promise((resolve) => {
            const modalHTML = `
                <div class="confirmation-modal" id="adminAuthModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-icon admin-icon">
                                <i class="fas fa-lock"></i>
                            </div>
                            <h3 class="modal-title">Admin Authentication</h3>
                            <p class="modal-message">Enter admin code to reset cooldown</p>
                        </div>
                        <div class="modal-body">
                            <div class="admin-input-group">
                                <input type="password" id="adminCodeInput" class="admin-code-input" placeholder="Enter admin code...">
                                <button class="admin-submit-btn ripple" id="adminSubmit">
                                    <i class="fas fa-key"></i>
                                    Verify
                                </button>
                            </div>
                            <div class="admin-modal-actions">
                                <button class="modal-btn modal-btn-cancel ripple" id="adminCancel">
                                    <i class="fas fa-times"></i>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById('adminAuthModal');
            const codeInput = document.getElementById('adminCodeInput');
            const submitBtn = document.getElementById('adminSubmit');
            const cancelBtn = document.getElementById('adminCancel');
            
            const cleanup = () => {
                modal.remove();
                document.removeEventListener('keydown', handleKeydown);
            };
            
            const handleKeydown = (e) => {
                if (e.key === 'Enter') {
                    submitBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            };
            
            submitBtn.addEventListener('click', () => {
                if (codeInput.value === this.adminCode) {
                    resolve(true);
                    cleanup();
                } else {
                    this.showToast('Invalid admin code', 'error');
                    codeInput.style.borderColor = 'var(--ios-red)';
                    codeInput.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        codeInput.style.borderColor = '';
                        codeInput.style.animation = '';
                    }, 1000);
                }
            });
            
            cancelBtn.addEventListener('click', () => {
                resolve(false);
                cleanup();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    resolve(false);
                    cleanup();
                }
            });
            
            document.addEventListener('keydown', handleKeydown);
            
            // Show modal and focus input
            modal.classList.add('show');
            setTimeout(() => {
                codeInput.focus();
            }, 300);
        });
    }
}

// Initialize the key generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const keyGenerator = new KeyGenerator();
    
    // Update time in status bar
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false 
        });
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }
    
    // Run cleanup on startup
    keyGenerator.cleanupExpiredKeys();
    
    updateTime();
    setInterval(updateTime, 60000);
    
    // Add CSS for ripple effect and admin modal styles
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .ripple {
            position: relative;
            overflow: hidden;
        }
        
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .modal-btn:disabled,
        .ios-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }
        
        .modal-btn:disabled:hover,
        .ios-button:disabled:hover {
            transform: none !important;
        }
        
        /* Cooldown animation */
        @keyframes pulse-gentle {
            0% { opacity: 0.7; }
            50% { opacity: 0.9; }
            100% { opacity: 0.7; }
        }
        
        .cooldown-pulse {
            animation: pulse-gentle 2s infinite;
        }
        
        /* Admin modal styles */
        .admin-input-group {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .admin-code-input {
            width: 100%;
            padding: 16px 20px;
            border: 1px solid var(--ios-border);
            border-radius: var(--ios-radius-small);
            font-size: 16px;
            font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
            background: rgba(255, 255, 255, 0.9);
            transition: all 0.2s ease;
            backdrop-filter: blur(20px);
        }
        
        .admin-code-input:focus {
            outline: none;
            border-color: var(--ios-primary);
            box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
            background: rgba(255, 255, 255, 1);
        }
        
        .admin-submit-btn {
            background: linear-gradient(135deg, #34c759, #4cd964);
            color: white;
            border: none;
            border-radius: var(--ios-radius-small);
            padding: 16px 24px;
            font-size: 17px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.2s ease;
            width: 100%;
            box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
        }
        
        .admin-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(52, 199, 89, 0.4);
            background: linear-gradient(135deg, #30a14e, #40c055);
        }
        
        .admin-submit-btn:active {
            transform: translateY(0);
        }
        
        .admin-modal-actions {
            display: flex;
            gap: 12px;
            margin-top: 8px;
        }
        
        .modal-icon.admin-icon {
            background: linear-gradient(135deg, #5856d6, #af52de) !important;
        }
        
        /* Shake animation for wrong password */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Hidden admin reset trigger */
        .admin-reset-trigger {
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            background: transparent;
            border: none;
            cursor: pointer;
            opacity: 0.3;
            transition: opacity 0.3s ease;
            z-index: 1000;
        }
        
        .admin-reset-trigger:hover {
            opacity: 1;
        }
        
        /* Responsive design for admin modal */
        @media (max-width: 480px) {
            .admin-input-group {
                gap: 12px;
            }
            
            .admin-code-input {
                padding: 14px 16px;
                font-size: 16px;
            }
            
            .admin-submit-btn {
                padding: 14px 20px;
                font-size: 16px;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // Add hidden admin reset trigger (triple-click to show)
    let clickCount = 0;
    let clickTimer;
    
    document.addEventListener('click', (e) => {
        if (e.target === document.body || e.target.classList.contains('ios-container')) {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 1000);
            } else if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                keyGenerator.resetCooldown();
            }
        }
    });
    
    // Add visual indicator for admin reset (hidden by default)
    const adminTrigger = document.createElement('button');
    adminTrigger.className = 'admin-reset-trigger';
    adminTrigger.innerHTML = '<i class="fas fa-user-shield" style="color: var(--ios-primary); font-size: 20px;"></i>';
    adminTrigger.title = 'Admin Reset (Triple-click anywhere to activate)';
    adminTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        keyGenerator.resetCooldown();
    });
    document.body.appendChild(adminTrigger);
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // This is a placeholder for actual service worker registration
        console.log('Service Worker support detected - ready for offline functionality');
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyGenerator;
}