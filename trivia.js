let triviaQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let countdownTime;
let difficulty;
const timeIncrement = 2; // Add 2 seconds with every correct answer

// Select the game container, result, timer, and score elements
const gameContainer = document.getElementById('game-container');
const resultDiv = document.getElementById('result');
const timerDiv = document.getElementById('timer');
const scoreDiv = document.getElementById('score');
const leaderboardDiv = document.getElementById('leaderboard');

// Function to set the difficulty level and load the questions
function setDifficulty(selectedDifficulty) {
    difficulty = selectedDifficulty;
    countdownTime = getCountdownTime(difficulty);
    document.getElementById('difficulty-container').style.display = 'none';
    loadQuestions();
}

// Function to get countdown time based on difficulty level
function getCountdownTime(difficulty) {
    if (difficulty === 'easy') return 15; // 15 seconds per question for easy
    if (difficulty === 'medium') return 10; // 10 seconds for medium
    if (difficulty === 'hard') return 5;   // 5 seconds for hard
}

// Load questions using XMLHttpRequest (XHR)
function loadQuestions() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'questions.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                let allQuestions = JSON.parse(xhr.responseText);  // Load all questions
                triviaQuestions = selectRandomQuestions(allQuestions, 10); // Select 10 random questions
                showQuestion(); // Start the game by displaying the first question
            } catch (e) {
                console.error('Error parsing JSON:', e);
                gameContainer.innerHTML = `<p>Error loading questions. Please try again later.</p>`;
            }
        } else if (xhr.readyState === 4) {
            console.error('Error loading the questions:', xhr.statusText);
            gameContainer.innerHTML = `<p>Error loading questions. Please try again later.</p>`;
        }
    };
    xhr.send();
}

// Function to randomly select 10 questions from the list
function selectRandomQuestions(questions, num) {
    let shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);  // Return the first 10 shuffled questions
}

// Function to display the next question
function showQuestion() {
    if (currentQuestionIndex < triviaQuestions.length) {
        const questionData = triviaQuestions[currentQuestionIndex];
        gameContainer.innerHTML = `
            <p>${questionData.question}</p>
            <button class="btn btn-true" onclick="checkAnswer('True')">True</button>
            <button class="btn btn-false" onclick="checkAnswer('False')">False</button>
        `;
        startTimer();
    } else {
        endGame();
    }
}

// Function to check the answer and proceed to the next question
function checkAnswer(userAnswer) {
    const correctAnswer = triviaQuestions[currentQuestionIndex].answer;
    stopTimer();
    if (userAnswer === correctAnswer) {
        score++;
        countdownTime += timeIncrement;  // Increase the timer by 2 seconds for every correct answer
        resultDiv.innerHTML = `<p class="result" style="color:green">Correct!</p>`;
    } else {
        resultDiv.innerHTML = `<p class="result" style="color:red">Wrong!</p>`;
    }
    updateScore();
    currentQuestionIndex++;
    setTimeout(() => {
        resultDiv.innerHTML = '';  // Clear result text
        showQuestion();  // Show next question
    }, 1000);
}

// Update the score display
function updateScore() {
    scoreDiv.innerHTML = `Score: ${score}`;
}

// Timer functions
function startTimer() {
    let timeLeft = countdownTime;
    timerDiv.innerHTML = `Time left: ${timeLeft}`;
    timer = setInterval(() => {
        timeLeft--;
        timerDiv.innerHTML = `Time left: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            resultDiv.innerHTML = `<p class="result" style="color:red">Time's up!</p>`;
            currentQuestionIndex++;
            setTimeout(() => {
                resultDiv.innerHTML = '';  // Clear result text
                showQuestion();  // Show next question
            }, 1000);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    timerDiv.innerHTML = '';  // Clear the timer display
}

// Function to end the game
function endGame() {
    gameContainer.innerHTML = `<h2>Game Over!</h2>`;
    resultDiv.innerHTML = `You scored ${score} out of ${triviaQuestions.length}`;
    saveScore(score);  // Save the score to the leaderboard
    displayLeaderboard();
}

// Leaderboard functions using localStorage
function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push(score);
    localStorage.setItem('scores', JSON.stringify(scores));
}

function displayLeaderboard() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.sort((a, b) => b - a);  // Sort scores in descending order
    leaderboardDiv.innerHTML = `<h3>Leaderboard</h3>`;
    scores.slice(0, 5).forEach((score, index) => {
        leaderboardDiv.innerHTML += `<p>${index + 1}. Score: ${score}</p>`;
    });
}
