// State Management
let tasks = [];
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isTimerRunning = false;
let currentMode = 'pomodoro'; // pomodoro, short, long

const modes = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

// DOM Elements
const taskList = document.getElementById('task-list');
const dateDisplay = document.getElementById('date-display');
const timerDisplay = document.getElementById('timer-display');
const btnTimer = document.getElementById('btn-timer');
const iconTimer = document.getElementById('icon-timer');
const progressBar = document.getElementById('progress-bar');
const categoriesList = document.getElementById('categories-list');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    renderCategories();
    // Load tasks from LocalStorage (Simulated)
    const saved = localStorage.getItem('focusflow_tasks');
    if(saved) {
        tasks = JSON.parse(saved);
        renderTasks();
        updateStats();
    }
});

// --- DATE & TIME ---
function updateDate() {
    const now = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'long' };
    dateDisplay.innerText = now.toLocaleDateString('pt-BR', options);
}

// --- TASK MANAGEMENT ---
function addTask() {
    const titleInput = document.getElementById('task-title');
    const startInput = document.getElementById('task-start');
    const endInput = document.getElementById('task-end');
    const categoryInput = document.getElementById('task-category');

    if (!titleInput.value.trim()) return alert("Por favor, digite uma tarefa.");

    const newTask = {
        id: Date.now(),
        title: titleInput.value,
        start: startInput.value || '--:--',
        end: endInput.value || '--:--',
        category: categoryInput.value,
        completed: false,
        createdAt: new Date()
    };

    tasks.unshift(newTask); // Add to top
    saveAndRender();
    
    // Reset inputs
    titleInput.value = '';
    startInput.value = '';
    endInput.value = '';
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveAndRender();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
    renderTasks();
    updateStats();
}

function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item group flex items-center gap-4 p-4 rounded-xl bg-white/40 border border-white/20 shadow-sm cursor-pointer ${task.completed ? 'bg-white/20' : ''}`;
        
        // Categoria cor badge
        let catColor = 'bg-gray-500';
        if(task.category === 'Trabalho') catColor = 'bg-blue-500';
        if(task.category === 'Estudo') catColor = 'bg-purple-500';
        if(task.category === 'Pessoal') catColor = 'bg-green-500';
        if(task.category === 'Saúde') catColor = 'bg-red-500';

        item.innerHTML = `
            <input type="checkbox" 
                class="task-checkbox w-5 h-5 rounded-md border-gray-400 text-primary focus:ring-primary cursor-pointer"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            
            <div class="flex-1 transition-opacity duration-300">
                <h4 class="font-medium text-textMain text-lg leading-tight">${task.title}</h4>
                <div class="flex items-center gap-3 mt-1 text-xs text-textMuted font-medium">
                    <span class="flex items-center gap-1">
                        <div class="w-2 h-2 rounded-full ${catColor}"></div>
                        ${task.category}
                    </span>
                    ${task.start !== '--:--' ? `
                    <span class="flex items-center gap-1 bg-white/30 px-2 py-0.5 rounded">
                        <i class="ph ph-clock"></i> ${task.start} - ${task.end}
                    </span>` : ''}
                </div>
            </div>

            <button onclick="deleteTask(${task.id})" class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <i class="ph ph-trash"></i>
            </button>
        `;
        
        taskList.appendChild(item);
    });
}

function renderCategories() {
    const cats = [
        { name: 'Trabalho', color: 'bg-blue-500' },
        { name: 'Estudo', color: 'bg-purple-500' },
        { name: 'Pessoal', color: 'bg-green-500' },
        { name: 'Saúde', color: 'bg-red-500' }
    ];

    categoriesList.innerHTML = cats.map(c => `
        <div class="flex items-center gap-2 text-sm text-textMuted hover:bg-white/40 p-2 rounded-lg cursor-pointer transition-colors">
            <div class="w-2 h-2 rounded-full ${c.color}"></div>
            ${c.name}
        </div>
    `).join('');
}

function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    
    document.getElementById('stat-completed').innerText = completed;
    document.getElementById('stat-pending').innerText = pending;
}

// --- POMODORO TIMER ---
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timerDisplay.innerText = formatTime(timeLeft);
    
    // Progress Bar Logic
    const totalTime = modes[currentMode];
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
}

function toggleTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        iconTimer.classList.remove('ph-pause-fill');
        iconTimer.classList.add('ph-play-fill');
        btnTimer.classList.remove('bg-red-500');
        btnTimer.classList.add('bg-primary');
    } else {
        isTimerRunning = true;
        iconTimer.classList.remove('ph-play-fill');
        iconTimer.classList.add('ph-pause-fill');
        btnTimer.classList.remove('bg-primary');
        btnTimer.classList.add('bg-red-500'); // Visual feedback for stop

        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isTimerRunning = false;
                alert("Tempo esgotado! Hora de descansar ou focar.");
                resetTimer();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = modes[currentMode];
    updateTimerDisplay();
    iconTimer.classList.remove('ph-pause-fill');
    iconTimer.classList.add('ph-play-fill');
    btnTimer.classList.remove('bg-red-500');
    btnTimer.classList.add('bg-primary');
}

function setMode(mode) {
    currentMode = mode;
    resetTimer();
    
    // Update active button styles
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('bg-primary/10', 'text-primary');
        btn.classList.add('hover:bg-white/40');
    });
    
    // Find the clicked button (simple logic for demo)
    const btnText = mode === 'pomodoro' ? 'Pomodoro' : mode === 'short' ? 'Curto' : 'Longo';
    const activeBtn = Array.from(document.querySelectorAll('.mode-btn')).find(b => b.innerText.includes(btnText));
    if(activeBtn) {
        activeBtn.classList.add('bg-primary/10', 'text-primary');
        activeBtn.classList.remove('hover:bg-white/40');
    }
}