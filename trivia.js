let triviaQuestions = [];
let selectedQuestions = []; // Store the selected 10 random questions
let score = 0;
let currentQuestionIndex = 0;
let timer;
let timeLeft;
let selectedDifficulty = 'easy';
const gameContainer = document.getElementById('game-container');
const resultDiv = document.getElementById('result');
const scoreDiv = document.getElementById('score');
const timerDiv = document.getElementById('timer');
const leaderboardDiv = document.getElementById('leaderboard');

// Fetch trivia questions from the JSON file
async function fetchQuestions() {
    try {
        const response = await fetch('questions.json'); // Make sure your JSON file path is correct
        triviaQuestions = await response.json();
        startGame();
    } catch (error) {
        console.error("Error fetching trivia questions:", error);
    }
}

// Start the game with selected difficulty
function startGame() {
    document.getElementById('difficulty-container').style.display = 'none'; // Hide difficulty buttons
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = getInitialTime();
    updateScore();

    // Shuffle the questions and pick 10 random ones
    shuffleQuestions(triviaQuestions);
    selectedQuestions = triviaQuestions.slice(0, 10);

    showNextQuestion();
    startTimer();
}

// Fisher-Yates shuffle algorithm to randomize questions
function shuffleQuestions(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Show the next question
function showNextQuestion() {
    if (currentQuestionIndex >= selectedQuestions.length || timeLeft <= 0) {
        endGame();
        return;
    }

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    gameContainer.innerHTML = `
        <p>${currentQuestion.question}</p>
        <button class="btn btn-true" onclick="handleAnswer('True')">True</button>
        <button class="btn btn-false" onclick="handleAnswer('False')">False</button>
    `;
}

// Handle user's answer
function handleAnswer(answer) {
    const currentQuestion = selectedQuestions[currentQuestionIndex];

    if (answer === currentQuestion.answer) {
        score++;
        resultDiv.innerHTML = `<p style="color: green; font-size: 2rem;">Correct!</p>`;
        timeLeft += 2; // Add 2 seconds for correct answer
    } else {
        resultDiv.innerHTML = `<p style="color: red; font-size: 2rem;">Wrong!</p>`;
    }

    updateScore();
    currentQuestionIndex++;
    setTimeout(() => {
        resultDiv.innerHTML = ''; // Clear the result message after 1 second
        showNextQuestion();
    }, 1000);
}

// Update the score display
function updateScore() {
    scoreDiv.innerHTML = `Score: ${score}`;
}

// Start the countdown timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDiv.innerHTML = `Time left: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

// Get the initial time based on the selected difficulty
function getInitialTime() {
    switch (selectedDifficulty) {
        case 'easy':
            return 30;
        case 'medium':
            return 20;
        case 'hard':
            return 15;
        default:
            return 30;
    }
}

// Save the score to the leaderboard (using localStorage)
function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    scores.push(score);
    scores.sort((a, b) => b - a); // Sort scores in descending order
    localStorage.setItem('leaderboard', JSON.stringify(scores));
}

// Display the leaderboard
function displayLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardDiv.innerHTML = `<h3>Leaderboard</h3>`;
    scores.slice(0, 5).forEach((score, index) => {
        leaderboardDiv.innerHTML += `<p>${index + 1}. Score: ${score}</p>`;
    });
}

// End the game and display the Play Again button
function endGame() {
    clearInterval(timer); // Stop the timer
    gameContainer.innerHTML = `<h2>Game Over!</h2>`;
    resultDiv.innerHTML = `You scored ${score} out of ${selectedQuestions.length}`;
    saveScore(score);
    displayLeaderboard();

    // Display the Play Again button
    gameContainer.innerHTML += `
        <button class="level-btn" onclick="resetGame()">Play Again</button>
    `;
}

// Reset the game and return to the difficulty selection screen
function resetGame() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('score').innerHTML = `Score: 0`;
    resultDiv.innerHTML = ''; // Clear the result
    leaderboardDiv.innerHTML = ''; // Clear the leaderboard
    gameContainer.innerHTML = ''; // Clear the question container
    timerDiv.innerHTML = ''; // Clear the timer
    document.getElementById('difficulty-container').style.display = 'block'; // Show the difficulty selection again
}

// Set the selected difficulty and fetch questions
function setDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    fetchQuestions(); // Fetch new questions and start the game
}
