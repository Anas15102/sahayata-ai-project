// --- Backend API URL ---
const API_URL = 'http://127.0.0.1:5001';

// --- Page Navigation ---
const dashboardPage = document.getElementById('dashboard-page');
const activityPage = document.getElementById('activity-page');
const learningPathPage = document.getElementById('learning-path-page');
const healthRoutinePage = document.getElementById('health-routine-page');
const counselorPage = document.getElementById('counselor-page');

const startActivityBtn = document.getElementById('start-activity-btn');
const viewPathBtn = document.getElementById('view-path-btn');
const healthRoutineBtn = document.getElementById('health-routine-btn');
const counselorConnectBtn = document.getElementById('counselor-connect-btn');

const backBtns = document.querySelectorAll('.back-btn');

function hideAllPages() {
    dashboardPage.classList.add('hidden');
    activityPage.classList.add('hidden');
    learningPathPage.classList.add('hidden');
    healthRoutinePage.classList.add('hidden');
    counselorPage.classList.add('hidden');
}

startActivityBtn.addEventListener('click', () => { hideAllPages(); activityPage.classList.remove('hidden'); });
viewPathBtn.addEventListener('click', () => { hideAllPages(); learningPathPage.classList.remove('hidden'); });
healthRoutineBtn.addEventListener('click', () => { 
    hideAllPages(); 
    healthRoutinePage.classList.remove('hidden');
    document.getElementById('health-choice-screen').classList.remove('hidden');
    document.getElementById('diet-planner-section').classList.add('hidden');
    document.getElementById('exercise-planner-section').classList.add('hidden');
});
counselorConnectBtn.addEventListener('click', () => { hideAllPages(); counselorPage.classList.remove('hidden'); });

backBtns.forEach(btn => {
    btn.addEventListener('click', () => { hideAllPages(); dashboardPage.classList.remove('hidden'); });
});

// --- Fun Activities Page Logic ---
const generateActivitiesBtn = document.getElementById('generate-activities-btn');
const funActivitiesResults = document.getElementById('fun-activities-results');
const conditionSelect = document.getElementById('condition-select');
const activityTypeColors = {
    "Physical": "bg-blue-100 text-blue-800",
    "Art-Based": "bg-purple-100 text-purple-800",
    "Interactive": "bg-yellow-100 text-yellow-800",
    "Sensory": "bg-pink-100 text-pink-800"
};

async function generateActivities() {
    const selectedCondition = conditionSelect.value;
    funActivitiesResults.innerHTML = `<div class="flex flex-col items-center justify-center py-10"><div class="loader"></div><p class="mt-4 text-gray-500">Our AI is finding fun activities...</p></div>`;
    try {
        const response = await fetch(`${API_URL}/generate-activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ condition: selectedCondition })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const noActivityHTML = `<div class="text-center text-gray-500 py-8 col-span-full">No activities found for this condition.</div>`;
        
        funActivitiesResults.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${data.activities.length > 0 ? data.activities.map(act => `<div class="border rounded-lg p-4 bg-gray-50 flex flex-col"><div class="flex justify-between items-center mb-2"><h3 class="font-bold text-lg">${act.title}</h3><span class="text-xs font-semibold px-2 py-1 rounded-full ${activityTypeColors[act.type] || 'bg-gray-100 text-gray-800'}">${act.type}</span></div><p class="text-gray-600 text-sm mb-4 flex-grow">${act.description}</p><div class="mt-auto pt-4 border-t"><p class="text-xs font-semibold text-green-700">Benefit: ${act.benefit}</p></div></div>`).join('') : noActivityHTML}</div>`;

    } catch (error) {
        const errorHTML = `<div class="p-4 border-l-4 border-red-500 bg-red-50">Error: Could not connect to the AI agent.</div>`;
        funActivitiesResults.innerHTML = errorHTML;
        console.error('Error:', error);
    }
}

generateActivitiesBtn.addEventListener('click', generateActivities);

// --- Learning Path Page Logic ---
const generatePathBtn = document.getElementById('generate-path-btn'); 
const learningPathResults = document.getElementById('learning-path-results');
const childNameInput = document.getElementById('child-name-input');
const learningNeedsInput = document.getElementById('learning-needs-input');
const learningStyleSelect = document.getElementById('learning-style-select');
const focusSubjectsInput = document.getElementById('focus-subjects-input');
const progressSummaryInput = document.getElementById('progress-summary-input');

async function generateLearningPath() {
    const payload = {
        name: childNameInput.value,
        needs: learningNeedsInput.value,
        style: learningStyleSelect.value,
        subjects: focusSubjectsInput.value,
        summary: progressSummaryInput.value
    };

    if (!payload.name || !payload.needs || !payload.subjects) {
        learningPathResults.innerHTML = `<div class="p-4 border-l-4 border-red-500 bg-red-50">Please fill out at least the Name, Learning Needs, and Focus Subjects fields.</div>`;
        return;
    }

    learningPathResults.innerHTML = `<div class="flex flex-col items-center justify-center py-10"><div class="loader"></div><p class="mt-4 text-gray-500">Our AI is crafting a personalized plan for ${payload.name}...</p></div>`;
    try {
        const response = await fetch(`${API_URL}/generate-learning-path`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        let resultsHTML = `<h3 class="text-2xl font-bold mb-4 text-gray-900">${data.planTitle}</h3>`;
        resultsHTML += '<div class="space-y-6">';
        data.weeklyPlan.forEach(week => {
            resultsHTML += `
                <div class="p-4 border rounded-lg bg-gray-50">
                    <p class="font-bold text-lg text-indigo-600">${week.week}: ${week.theme}</p>
                    <ul class="mt-2 space-y-2">
                        ${week.tasks.map(task => `
                            <li class="flex items-start">
                                <svg class="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                                <span class="text-gray-700">${task}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });
        resultsHTML += '</div>';
        learningPathResults.innerHTML = resultsHTML;

    } catch (error) { 
        learningPathResults.innerHTML = `<div class="p-4 border-l-4 border-red-500 bg-red-50">Error: Could not connect to the AI agent. Please ensure the backend is running.</div>`; 
        console.error('Error:', error); 
    }
}
generatePathBtn.addEventListener('click', generateLearningPath);

// --- Health Routine Page Logic ---
const healthChoiceScreen = document.getElementById('health-choice-screen');
const dietPlannerSection = document.getElementById('diet-planner-section');
const exercisePlannerSection = document.getElementById('exercise-planner-section');
const chooseDietCard = document.getElementById('choose-diet-card');
const chooseExerciseCard = document.getElementById('choose-exercise-card');
const backToHealthChoiceBtns = document.querySelectorAll('.back-to-health-choice-btn');

chooseDietCard.addEventListener('click', () => {
    healthChoiceScreen.classList.add('hidden');
    dietPlannerSection.classList.remove('hidden');
});
chooseExerciseCard.addEventListener('click', () => {
    healthChoiceScreen.classList.add('hidden');
    exercisePlannerSection.classList.remove('hidden');
});
backToHealthChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        dietPlannerSection.classList.add('hidden');
        exercisePlannerSection.classList.add('hidden');
        healthChoiceScreen.classList.remove('hidden');
    });
});

const generateDietBtn = document.getElementById('generate-diet-btn'); 
const dietResults = document.getElementById('diet-results');
const ingredientsInput = document.getElementById('ingredients-input');
const generateExerciseBtn = document.getElementById('generate-exercise-btn'); 
const exerciseResults = document.getElementById('exercise-results');
const exerciseDurationSelect = document.getElementById('exercise-duration-select');

async function generateDietPlan() {
    const ingredients = ingredientsInput.value;
    if (!ingredients) { dietResults.innerHTML = `<div class="p-4 border-l-4 border-red-500 bg-red-50">Please enter ingredients first.</div>`; return; }
    dietResults.innerHTML = `<div class="flex flex-col items-center justify-center py-10"><div class="loader"></div><p class="mt-4 text-gray-500">Our AI is creating a tasty recipe...</p></div>`;
    try {
        const response = await fetch(`${API_URL}/generate-diet-plan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ingredients: ingredients }) });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        dietResults.innerHTML = `<div class="p-4 border-l-4 border-green-500 bg-green-50"><h4 class="font-bold">AI Recipe Suggestion:</h4><p>${data.recipe}</p></div>`;
    } catch (error) { dietResults.innerHTML = `<div class="p-4 border-l-4 border-red-500 bg-red-50">Error: Could not connect to the AI agent.</div>`; console.error('Error:', error); }
}

async function generateExercisePlan() {
    const duration = exerciseDurationSelect.value;
    exerciseResults.innerHTML = `<div class="flex flex-col items-center justify-center py-10"><div class="loader"></div><p class="mt-4 text-gray-500">Our AI is planning a fun workout...</p></div>`;
    try {
        const response = await fetch(`${API_URL}/generate-exercise-plan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ duration: duration }) });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        let resultsHTML = `<h3 class="text-xl font-bold mb-4 text-gray-900">Your ${duration}-Minute Fun Workout</h3>`;
        resultsHTML += '<ul class="space-y-4">';
        data.routine.forEach(item => {
            resultsHTML += `
                <li class="flex items-start">
                    <svg class="h-5 w-5 text-teal-500 mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <p class="font-semibold">${item.name} <span class="text-sm text-gray-500 font-normal">- ${item.duration}</span></p>
                        <p class="text-sm text-gray-600">${item.description}</p>
                    </div>
                </li>
            `;
        });
        resultsHTML += '</ul>';
        exerciseResults.innerHTML = resultsHTML;
    } catch (error) { exerciseResults.innerHTML = `<div class="p-4 border-l-4 border-red-500 bg-red-50">Error: Could not connect to the AI agent.</div>`; console.error('Error:', error); }
}

generateDietBtn.addEventListener('click', generateDietPlan);
generateExerciseBtn.addEventListener('click', generateExercisePlan);

// --- Counselor Page Logic ---
const counselorList = document.getElementById('counselor-list');
const bookingModal = document.getElementById('booking-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalText = document.getElementById('modal-text');
const counselorsDB = [ { name: 'Dr. Priya Sharma', specialty: 'Autism Spectrum Disorder', img: 'https://placehold.co/100x100/A78BFA/FFFFFF?text=Dr.S' }, { name: 'Mr. Rahul Verma', specialty: 'ADHD & Focus', img: 'https://placehold.co/100x100/FBBF24/FFFFFF?text=Mr.V' }, { name: 'Ms. Anjali Mehta', specialty: 'Dyslexia & Learning Support', img: 'https://placehold.co/100x100/34D399/FFFFFF?text=Ms.M' } ];
function renderCounselors() {
    counselorList.innerHTML = counselorsDB.map(c => `<div class="bg-white rounded-xl shadow-lg p-4 flex items-center gap-4"><img class="h-16 w-16 rounded-full object-cover" src="${c.img}" alt="Photo of ${c.name}"><div class="flex-grow"><h3 class="font-bold text-lg">${c.name}</h3><p class="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full inline-block">${c.specialty}</p></div><button class="book-session-btn px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700" data-counselor="${c.name}">Book a Session</button></div>`).join('');
}
counselorList.addEventListener('click', function(e) {
    if (e.target.classList.contains('book-session-btn')) {
        const counselorName = e.target.dataset.counselor;
        modalText.textContent = `Your session with ${counselorName} has been confirmed. You will receive an email with the details.`;
        bookingModal.classList.remove('hidden');
    }
});
closeModalBtn.addEventListener('click', () => { bookingModal.classList.add('hidden'); });

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    renderCounselors();
});
