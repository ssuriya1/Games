
let targetNumber;
let attempts;

function initGame() {
    targetNumber = Math.ceil(Math.random() * 10);
    attempts = 0;
    document.getElementById('guessInput').value = '';
    document.getElementById('message').textContent = '';
    document.getElementById('attempts').textContent = 'Attempts: 0';
    document.getElementById('playAgainBtn').style.display = 'none';
    document.getElementById('guessInput').focus();
}

function checkGuess() {
    const input = document.getElementById('guessInput');
    const message = document.getElementById('message');
    const guess = parseInt(input.value);
    
    if (guess < 1 || guess > 10 || isNaN(guess)) {
        message.textContent = 'Please enter a number between 1 and 10';
        message.style.color = '#ff4444';
        return;
    }

    attempts++;
    document.getElementById('attempts').textContent = `Attempts: ${attempts}`;
    
    if (guess < targetNumber) {
        message.textContent = '↑ Too low! Try higher';
        message.style.color = '#ff9999';
    } else if (guess > targetNumber) {
        message.textContent = '↓ Too high! Try lower';
        message.style.color = '#ff9999';
    } else {
        message.textContent = '🎉 Correct! You won!';
        message.style.color = '#4CAF50';
        document.getElementById('playAgainBtn').style.display = 'inline-block';
        input.disabled = true;
    }
    
    message.classList.remove('highlight');
    void message.offsetWidth;
    message.classList.add('highlight');
}

function resetGame() {
    document.getElementById('guessInput').disabled = false;
    initGame();
}

document.getElementById('guessInput').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkGuess();
    }
});

initGame();