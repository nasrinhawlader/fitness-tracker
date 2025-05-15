// Select DOM elements
const workoutList = document.getElementById('workoutList');
const fitnessForm = document.getElementById('fitnessForm');
const filterActivity = document.getElementById('filterActivity');
const totalWorkouts = document.getElementById('totalWorkouts');
const totalCalories = document.getElementById('totalCalories');
const averageDuration = document.getElementById('averageDuration');
const progressChartCanvas = document.getElementById('progressChart');
const progressChartContext = progressChartCanvas.getContext('2d');
const goalDisplay = document.getElementById('goal');
const goalDeleteButton = document.getElementById('deleteGoal');
const exportDataButton = document.getElementById('exportData');

let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let goal = null;

// Initialize chart
let progressChart = new Chart(progressChartContext, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Calories Burned',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }]
    }
});

// Load workouts from LocalStorage
function loadWorkouts() {
    workouts.forEach(addWorkoutToList);
    updateStats(workouts);
    updateChart(workouts);
}

// Save workout to LocalStorage
function saveWorkout(workout) {
    workouts.push(workout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

// Add workout to the list
function addWorkoutToList(workout) {
    const workoutItem = document.createElement('li');
    workoutItem.innerHTML = `<span><strong>${workout.activity}</strong> - ${workout.duration} mins - ${workout.calories} kcal - ${workout.notes} (${workout.date})</span>
        <button class="delete-btn">Delete</button>`;
    workoutList.appendChild(workoutItem);

    // Delete button functionality
    workoutItem.querySelector('.delete-btn').addEventListener('click', () => {
        removeWorkout(workout);
        workoutItem.remove();
    });
}

// Remove workout from LocalStorage
function removeWorkout(workoutToRemove) {
    workouts = workouts.filter(workout => workout !== workoutToRemove);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    updateStats(workouts);
    updateChart(workouts);
}

// Update stats (total workouts, total calories, average duration)
function updateStats(workouts) {
    const total = workouts.length;
    const calories = workouts.reduce((acc, w) => acc + w.calories, 0);
    const avgDuration = workouts.length ? (workouts.reduce((acc, w) => acc + w.duration, 0) / total).toFixed(1) : 0;

    totalWorkouts.textContent = total;
    totalCalories.textContent = calories;
    averageDuration.textContent = avgDuration;
}

// Update chart with new data
function updateChart(workouts) {
    const dates = workouts.map(w => w.date);
    const calories = workouts.map(w => w.calories);

    // Update chart data
    progressChart.data.labels = dates;
    progressChart.data.datasets[0].data = calories;

    progressChart.update();
}

// Filter workouts by activity
filterActivity.addEventListener('input', () => {
    const filteredWorkouts = workouts.filter(workout => workout.activity.toLowerCase().includes(filterActivity.value.toLowerCase()));
    workoutList.innerHTML = '';
    filteredWorkouts.forEach(addWorkoutToList);
    updateStats(filteredWorkouts);
    updateChart(filteredWorkouts);
});

// Form submit event
fitnessForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const activity = document.getElementById('activity').value;
    const duration = Number(document.getElementById('duration').value);
    const calories = Number(document.getElementById('calories').value);
    const notes = document.getElementById('notes').value;
    const date = document.getElementById('date').value;

    const workout = { activity, duration, calories, notes, date };

    addWorkoutToList(workout);
    saveWorkout(workout);
    updateStats(workouts);
    updateChart(workouts);
    fitnessForm.reset();
});

// Goal setting functionality
document.getElementById('setGoal').addEventListener('click', () => {
    const goalInput = prompt('Enter your fitness goal (e.g., "Lose 5 kg", "Run 20 miles")');
    if (goalInput) {
        goal = goalInput;
        goalDisplay.textContent = goal;
        goalDeleteButton.style.display = 'inline';  // Show the delete button when goal is set
    }
});

// Delete goal functionality
goalDeleteButton.addEventListener('click', () => {
    goal = null;
    goalDisplay.textContent = 'None';
    goalDeleteButton.style.display = 'none';  // Hide the delete button after removing the goal
});

// Export data functionality
exportDataButton.addEventListener('click', () => {
    const workoutData = JSON.stringify(workouts);
    const blob = new Blob([workoutData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workouts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Load existing workouts when the page loads
window.onload = loadWorkouts;
