/* ========================================
   CLEAR MINDS - MAIN JAVASCRIPT
   ======================================== */

// ========================================
// STORAGE & INITIALIZATION
// ========================================

const MOOD_DATA = 'clearMinds_moodData';
const GRATITUDE_PROMPTS = [
    'What is one thing that made you smile today?',
    'Who am I grateful for and why?',
    'What is one skill I am grateful to have?',
    'What is a simple pleasure I enjoyed today?',
    'What is one way someone helped me today?',
    'What is something in nature I appreciate?',
    'What is one challenge I overcame today?',
    'What is something I learned today?',
    'What is one good decision I made today?',
    'What person have I not thanked recently?'
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    initializeCounters();
    initializeMoodTracker();
});

// ========================================
// DARK MODE / THEME TOGGLE
// ========================================

function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// ========================================
// NAVIGATION
// ========================================

function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            animateHamburger();
        });
    }
    
    // Close menu on link click
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

function animateHamburger() {
    const spans = document.querySelectorAll('.hamburger span');
    spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(8px, -8px)';
}

// ========================================
// MOOD TRACKER
// ========================================

function initializeMoodTracker() {
    const moodOptions = document.querySelectorAll('.mood-option');
    
    moodOptions.forEach(option => {
        option.addEventListener('click', () => handleMoodSelection(option));
    });
    
    // Load and display existing mood data
    loadMoodData();
}

function handleMoodSelection(element) {
    // Remove previous selection
    document.querySelectorAll('.mood-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selection to clicked element
    element.classList.add('selected');
    const mood = element.getAttribute('data-mood');
    
    // Show response
    showMoodResponse(mood);
    
    // Save to storage
    saveMoodData(mood);
    
    // Update chart
    updateMoodChart();
}

function showMoodResponse(mood) {
    const responses = {
        excellent: {
            message: 'That\'s wonderful! Keep this positive energy going!',
            suggestions: ['Keep a gratitude journal', 'Share your joy', 'Help someone', 'Celebrate yourself']
        },
        good: {
            message: 'Great to hear! Let\'s maintain this positive state.',
            suggestions: ['Do something you love', 'Spend time with loved ones', 'Exercise', 'Learn something new']
        },
        okay: {
            message: 'That\'s okay. Let\'s work on improving your mood.',
            suggestions: ['Take a break', 'Practice breathing', 'Go for a walk', 'Talk to someone']
        },
        sad: {
            message: 'We\'re here for you. Let\'s try some mood-boosting activities.',
            suggestions: ['Meditation', 'Listen to music', 'Reach out to someone', 'Journal your feelings']
        },
        stressed: {
            message: 'Stress is normal. Let\'s help you relax and reset.',
            suggestions: ['Breathing exercise', 'Progressive relaxation', 'Take a walk', 'Practice meditation']
        }
    };
    
    const response = responses[mood];
    const responseDiv = document.getElementById('mood-response');
    const messageDiv = document.getElementById('mood-message');
    const suggestionsDiv = document.getElementById('mood-suggestions');
    
    if (responseDiv && messageDiv && suggestionsDiv) {
        messageDiv.textContent = response.message;
        
        suggestionsDiv.innerHTML = '';
        response.suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'mood-suggestion-item';
            item.textContent = suggestion;
            suggestionsDiv.appendChild(item);
        });
        
        responseDiv.classList.remove('hidden');
    }
}

function saveMoodData(mood) {
    const today = new Date().toISOString().split('T')[0];
    let data = JSON.parse(localStorage.getItem(MOOD_DATA)) || {};
    
    if (!data[today]) {
        data[today] = [];
    }
    
    data[today].push({
        mood: mood,
        time: new Date().toLocaleTimeString()
    });
    
    localStorage.setItem(MOOD_DATA, JSON.stringify(data));
}

function loadMoodData() {
    const data = JSON.parse(localStorage.getItem(MOOD_DATA)) || {};
    const today = new Date().toISOString().split('T')[0];
    
    if (data[today] && data[today].length > 0) {
        const lastMood = data[today][data[today].length - 1].mood;
        const element = document.querySelector(`[data-mood="${lastMood}"]`);
        if (element) {
            element.classList.add('selected');
            showMoodResponse(lastMood);
        }
    }
}

function updateMoodChart() {
    const canvas = document.getElementById('moodCanvas');
    if (!canvas) return;
    
    const data = JSON.parse(localStorage.getItem(MOOD_DATA)) || {};
    const moodCounts = {
        excellent: 0,
        good: 0,
        okay: 0,
        sad: 0,
        stressed: 0
    };
    
    // Count moods from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    Object.keys(data).forEach(date => {
        if (new Date(date) >= sevenDaysAgo) {
            data[date].forEach(record => {
                if (moodCounts[record.mood] !== undefined) {
                    moodCounts[record.mood]++;
                }
            });
        }
    });
    
    // Create chart
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.moodChart) {
        window.moodChart.destroy();
    }
    
    window.moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Excellent', 'Good', 'Okay', 'Sad', 'Stressed'],
            datasets: [{
                label: 'Mood Frequency (Last 7 Days)',
                data: [
                    moodCounts.excellent,
                    moodCounts.good,
                    moodCounts.okay,
                    moodCounts.sad,
                    moodCounts.stressed
                ],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#f59e0b',
                    '#ec4899',
                    '#ef4444'
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ========================================
// BREATHING EXERCISE
// ========================================

function startBreathingExercise() {
    const modal = document.getElementById('breathingModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeBreathingModal() {
    const modal = document.getElementById('breathingModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function performBreathing() {
    const breathText = document.getElementById('breathText');
    const breathCount = document.getElementById('breathCount');
    const circle = document.getElementById('breathingCircle');
    
    let count = 0;
    let currentPhase = 0; // 0: inhale, 1: hold, 2: exhale
    const phases = [
        { name: 'Breathe In', duration: 4000 },
        { name: 'Hold', duration: 7000 },
        { name: 'Exhale', duration: 8000 }
    ];
    
    function performCycle() {
        if (count >= 4) {
            breathText.textContent = 'Complete!';
            setTimeout(() => {
                breathText.textContent = 'Ready?';
                circle.style.animation = 'none';
            }, 1500);
            return;
        }
        
        let phase = 0;
        const cycleStart = Date.now();
        
        function updatePhase() {
            const elapsed = Date.now() - cycleStart;
            
            // Calculate current phase
            let phaseIndex = 0;
            let phaseElapsed = elapsed;
            
            for (let i = 0; i < phases.length; i++) {
                if (phaseElapsed < phases[i].duration) {
                    phaseIndex = i;
                    break;
                }
                phaseElapsed -= phases[i].duration;
            }
            
            breathText.textContent = phases[phaseIndex].name;
            
            // Total cycle duration
            const totalDuration = phases.reduce((acc, p) => acc + p.duration, 0);
            
            if (elapsed < totalDuration) {
                requestAnimationFrame(updatePhase);
            } else {
                count++;
                breathCount.textContent = count;
                
                if (count < 4) {
                    setTimeout(performCycle, 1000);
                } else {
                    performCycle();
                }
            }
        }
        
        updatePhase();
    }
    
    performCycle();
}

// ========================================
// GRATITUDE SECTION
// ========================================

let currentGratitudeIndex = 0;

function startGratitude() {
    const modal = document.getElementById('gratitudeModal');
    if (modal) {
        currentGratitudeIndex = Math.floor(Math.random() * GRATITUDE_PROMPTS.length);
        displayGratitudePrompt();
        modal.classList.remove('hidden');
    }
}

function closeGratitudeModal() {
    const modal = document.getElementById('gratitudeModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function displayGratitudePrompt() {
    const promptElement = document.getElementById('gratitudePrompt');
    if (promptElement) {
        promptElement.textContent = GRATITUDE_PROMPTS[currentGratitudeIndex];
    }
}

function saveGratitude() {
    const textarea = document.getElementById('gratitudeText');
    const text = textarea.value.trim();
    
    if (!text) {
        alert('Please write something before proceeding!');
        return;
    }
    
    // Save gratitude entry
    const today = new Date().toISOString().split('T')[0];
    let gratitudeData = JSON.parse(localStorage.getItem('clearMinds_gratitude')) || {};
    
    if (!gratitudeData[today]) {
        gratitudeData[today] = [];
    }
    
    gratitudeData[today].push({
        prompt: GRATITUDE_PROMPTS[currentGratitudeIndex],
        response: text,
        time: new Date().toLocaleTimeString()
    });
    
    localStorage.setItem('clearMinds_gratitude', JSON.stringify(gratitudeData));
    
    // Move to next prompt
    currentGratitudeIndex = (currentGratitudeIndex + 1) % GRATITUDE_PROMPTS.length;
    textarea.value = '';
    displayGratitudePrompt();
    
    // Show success message
    showNotification('Gratitude entry saved! Keep it up! 🌟', 'success');
}

// ========================================
// COUNTER ANIMATION
// ========================================

function initializeCounters() {
    const counters = document.querySelectorAll('[data-target]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 20);
}

// ========================================
// NOTIFICATIONS
// ========================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        animation: slideDown 0.3s ease;
        z-index: 1001;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// SMOOTH SCROLLING
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener('keydown', (e) => {
    // Alt + B: Start breathing exercise
    if (e.altKey && e.key === 'b') {
        startBreathingExercise();
    }
    
    // Alt + G: Start gratitude
    if (e.altKey && e.key === 'g') {
        startGratitude();
    }
    
    // Alt + T: Toggle theme
    if (e.altKey && e.key === 't') {
        toggleTheme();
    }
});

// ========================================
// PAGE VISIBILITY
// ========================================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App backgrounded');
    } else {
        console.log('App in focus');
    }
});

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', (e) => {
    console.error('Script error:', e.error);
});

// ========================================
// SERVICE WORKER (Optional)
// ========================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed, app still works
    });
}
