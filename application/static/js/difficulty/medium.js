let playerScore = 5;
let botScore = 5;
let timer;
let turn = 'player'; // 'player' or 'bot'

// Start timer function
const startTimer = () => {
    let timeLeft = 20;
    document.querySelector("#timer").textContent = `Time left: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft -= 1;
        document.querySelector("#timer").textContent = `Time left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (turn === 'player') {
                updateScore('player', true); // Decrease player's score
                resetInputForms();
                switchTurn('bot');
            } else {
                // No score increment here; bot fails to answer on time
                resetInputForms();
                switchTurn('player');
            }
        }
    }, 1000);
};

// Function to switch turns between player and bot
const switchTurn = (nextTurn) => {
    clearInterval(timer);
    turn = nextTurn;
    document.querySelector("#timer").textContent = `Time left: 30s`;

    if (turn === 'player') {
        document.querySelector("#player-word").disabled = false;
        document.querySelector("#player-word").classList.remove("disabled");
        document.querySelector("#player-word").focus();
        document.querySelector("#bot-word").disabled = true;
        document.querySelector("#bot-word").classList.add("disabled");
        startTimer();
    } else {
        document.querySelector("#player-word").disabled = true;
        document.querySelector("#player-word").classList.add("disabled");
        document.querySelector("#bot-word").disabled = true;
        document.querySelector("#bot-word").classList.add("disabled");
        setTimeout(() => {
            botPlayer(document.querySelector("#player-word").value);
        }, 1000);
    }
};

// Function to update the score and add history
// Function to update the score and add history
const updateScore = (player, decrement = false) => {
    const playerName = document.querySelector("#player_name").textContent
    const answer = (player === 'player') ? document.querySelector("#player-word").value : document.querySelector("#bot-word").value;
    const historyItem = (player === 'player') ? `${playerName}: ${answer}` : `Kompyuter: ${answer}`;

    // Update score
    if (player === 'player') {
        if (decrement) {
            playerScore = Math.max(0, playerScore - 1); // Decrease player's score, ensuring it doesn't go below 0
        }
    } else {
        if (decrement) {
            botScore = Math.max(0, botScore - 1); // Decrease bot's score, ensuring it doesn't go below 0
        }
    }

    // Update score display
    document.querySelector("#score").textContent = `Pass Left - Player: ${playerScore} | Bot: ${botScore}`;

    // Add history item to offcanvas
    const historyList = document.getElementById('history-list');
    const item = document.createElement('li');
    // item.className = 'list-group-item';
    item.textContent = historyItem;
    item.style.listStyle = "none";
    // if (player === 'player') {
    //     item.classList.add('list-group-item-primary');
    // } else {
    //     item.classList.add('list-group-item-secondary');
    // }
    historyList.appendChild(item);
    historyList.scrollTop = historyList.scrollHeight; // Scroll to bottom of history list

    // Check for game over conditions
    if (playerScore === 0) {
        alert("Bot wins!");
        resetGame();
    } else if (botScore === 0) {
        alert("Player wins!");
        resetGame();
    }
};


// Function to reset the game
const resetGame = () => {
    playerScore = 5;
    botScore = 5;
    document.querySelector("#score").textContent = `Pass Left - Player: ${playerScore} | Bot: ${botScore}`;
    resetInputForms();
    switchTurn('player');
};

// Function to reset input forms

const resetInputForms = () => {
    document.querySelector("#player-word").value = "";
    document.querySelector("#bot-word").value = "";
    document.querySelector("#player-result").innerHTML = "";
    document.querySelector("#bot-result").innerHTML = "";
};

// Player input handler
let prevSearch = "";
const playerInputHandler = (e) => {
    const search = e.target.value;
    fetch("/medium-single-player-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "search": search })
    }).then(res => res.json()).then((res) => {
        const playerResultDiv = document.querySelector("#player-result");
        const wordIcon = document.querySelector("#word-icon");
        const modalResult = document.querySelector("#modal-result");
        playerResultDiv.innerHTML = "";

        if (search.trim() === "") {
            return;
        }

        res.data.forEach(player => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card mb-2";
            cardDiv.innerHTML = `
                <button class="card-body border-0 outline-0 p-2" data-word="${player.word}">
                    <h5 class="card-title">${player.word}</h5>
                </button>
            `;
            playerResultDiv.appendChild(cardDiv);

            cardDiv.querySelector("button").addEventListener("click", () => {
                if (prevSearch === player.word) {
                    alert("Word Already Used.");
                    return;
                }

                prevSearch = player.word;

                document.querySelector("#player-word").value = player.word;
                playerResultDiv.innerHTML = "";

                wordIcon.innerHTML = `<i data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                <img src='../static/assets/search-of-knowledge.png' />
                </i>`;
                modalResult.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="staticBackdropLabel">${player.word}</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h6 class="fs-5">Buri nang sabyan:</h6>
                            <p>${player.meaning}</p>
                            <hr>
                            <h6 class="fs-5">Pamag Bigkas:</h6>
                            <p>${player.description}</p>
                        </div>
                    </div>
                `;

                updateScore('player');
                switchTurn('bot');
            });
        });
    });
};


// Bot player function
const botPlayer = (data) => {
    const search = data.slice(-3);

    fetch("/bot-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "search": data })
    }).then(res => res.json()).then((res) => {
        const botResult = document.querySelector("#bot-result");
        const botWord = document.querySelector("#bot-word");
        botResult.innerHTML = "";

        if (res.data.length === 0) {
            // Bot failed to find a word, decrease botScore and switch turn
            updateScore('bot', true); // Decrease bot's score
            switchTurn('player');
            return;
        }

        res.data.forEach(bot => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card mb-2";
            botWord.value = bot.word;

            cardDiv.innerHTML = `
                <div class="text-center card-body border-0 outline-0" data-word="${bot.word}">
                    <h5 class="card-title">${bot.word}</h5>
                    <h6>Buri nang sabyan:</h6>
                    <p class="card-title">${bot.meaning}</p>
                    <h6>Pamag Bigkas:</h6>
                    <p class="card-title"<span class="fw-bold text-red">${bot.meaning}</span></p>
                </div>
            `;
            botResult.appendChild(cardDiv);
            // updateScore('bot', true);
        });

        switchTurn('player');
    }).catch(error => {
        console.error('Error fetching bot data:', error);
        switchTurn('player'); // Ensure turn is switched even on error
    });
};

document.querySelector('.history').addEventListener('mouseenter', function() {
    var offcanvas = new bootstrap.Offcanvas(document.getElementById('history'));
    offcanvas.show();
});


document.querySelector("#player-word").addEventListener("input", playerInputHandler);

resetGame();
