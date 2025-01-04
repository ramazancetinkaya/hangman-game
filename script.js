let words = null;

const loadWords = async () => {
    try {
        const response = await fetch('words.json');
        if (!response.ok) throw new Error('Failed to fetch words');
        words = await response.json();
        startNewGame();
    } catch (error) {
        document.getElementById('error-popup').style.display = 'block';
    }
};

const pickRandomWord = () => {
    if (!words) return null;
    const categories = Object.keys(words);
    if (categories.length === 0) return null;
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const wordList = words[selectedCategory];
    if (!wordList || wordList.length === 0) return null;
    const selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
    return { word: selectedWord.word, category: selectedCategory, difficulty: selectedWord.difficulty };
};

let { word, category, difficulty } = {};
let remainingAttempts = 6;
const guessedLetters = [];

const canvas = document.getElementById('hangman');
const ctx = canvas.getContext('2d');

const disableAllButtons = () => {
    document.querySelectorAll('.letter').forEach(btn => btn.disabled = true);
};

const updateRemainingAttempts = () => {
    document.getElementById('remaining').textContent = `Remaining Attempts: ${remainingAttempts}`;
};

const drawHangman = () => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';

    // Base
    if (remainingAttempts === 5) {
        ctx.strokeRect(50, 350, 200, 10);
    }

    // Pole
    if (remainingAttempts === 4) {
        ctx.beginPath();
        ctx.moveTo(150, 350);
        ctx.lineTo(150, 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(150, 50);
        ctx.lineTo(250, 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(250, 50);
        ctx.lineTo(250, 100);
        ctx.stroke();
    }

    // Head
    if (remainingAttempts === 3) {
        ctx.beginPath();
        ctx.arc(250, 130, 30, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Body
    if (remainingAttempts === 2) {
        ctx.beginPath();
        ctx.moveTo(250, 160);
        ctx.lineTo(250, 260);
        ctx.stroke();
    }

    // Arms
    if (remainingAttempts === 1) {
        ctx.beginPath();
        ctx.moveTo(250, 200);
        ctx.lineTo(220, 230);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(250, 200);
        ctx.lineTo(280, 230);
        ctx.stroke();
    }

    // Legs
    if (remainingAttempts === 0) {
        ctx.beginPath();
        ctx.moveTo(250, 260);
        ctx.lineTo(220, 300);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(250, 260);
        ctx.lineTo(280, 300);
        ctx.stroke();
        disableAllButtons();
        showPopup(`Game over! The word was "${word}".`);
    }
};

const updateWordDisplay = () => {
    const displayWord = word
        .split('')
        .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
        .join(' ');

    document.getElementById('word').textContent = displayWord;
};

const handleLetterClick = (letter) => {
    if (word.includes(letter)) {
        guessedLetters.push(letter);
        updateWordDisplay();

        if (!document.getElementById('word').textContent.includes('_')) {
            disableAllButtons();
            showPopup(`You win! The word was "${word}".`);
        }
    } else {
        remainingAttempts -= 1;
        updateRemainingAttempts();
        drawHangman();
    }

    document.querySelector(`button[data-letter="${letter}"]`).disabled = true;
};

const showPopup = (message) => {
    document.getElementById('popup-message').textContent = message;
    document.getElementById('popup').style.display = 'block';
};

const startNewGame = () => {
    document.getElementById('popup').style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('letters').innerHTML = '';
    guessedLetters.length = 0;
    remainingAttempts = 6;
    updateRemainingAttempts();
    const result = pickRandomWord();
    if (result) {
        ({ word, category, difficulty } = result);
        document.getElementById('category').innerHTML = `Category: <span class="highlight">${category}</span>`;
        document.getElementById('difficulty').innerHTML = `Difficulty: <span class="highlight">${difficulty}</span>`;
        initializeGame();
    } else {
        showPopup('Error loading the word. Please restart the game.');
    }
};

const initializeGame = () => {
    updateWordDisplay();

    const lettersContainer = document.getElementById('letters');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    alphabet.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'letter';
        button.textContent = letter;
        button.setAttribute('data-letter', letter);
        button.addEventListener('click', () => handleLetterClick(letter));
        lettersContainer.appendChild(button);
    });
};

loadWords();
