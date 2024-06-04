let playerScore = 0;
let botScore = 0;
let timer;
let turn = 'player'; // 'player' or 'bot'

// Start timer function
const startTimer = () => {
    let timeLeft = 30;
    document.querySelector("#timer").textContent = `Time left: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft -= 1;
        document.querySelector("#timer").textContent = `Time left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (turn === 'player') {
                updateScore('bot');
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

// Function to update the score
const updateScore = (player) => {
    if (player === 'player') {
        playerScore += 1;
    } else {
        botScore += 1;
    }

    document.querySelector("#player-score").textContent = `Player Score: ${playerScore}`;
    document.querySelector("#bot-score").textContent = `Bot Score: ${botScore}`;

    if (playerScore >= 5) {
        alert("Player wins!");
        resetGame();
        window.location.reload();
    } else if (botScore >= 5) {
        alert("Bot wins!");
        window.location.reload();
        resetGame();
    }
};

// Function to reset the game
const resetGame = () => {
    playerScore = 0;
    botScore = 0;
    document.querySelector("#player-score").textContent = `Player Score: ${playerScore}`;
    document.querySelector("#bot-score").textContent = `Bot Score: ${botScore}`;
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
const playerInputHandler = (e) => {
    const search = e.target.value;

    fetch("/single-player-search", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"search": search})
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
                <button class="card-body border-0 outline-0" data-word="${player.word}">
                    <h5 class="card-title">${player.word}</h5>
                </button>
            `;
            playerResultDiv.appendChild(cardDiv);

            cardDiv.querySelector("button").addEventListener("click", () => {
                document.querySelector("#player-word").value = player.word;
                playerResultDiv.innerHTML = "";

                wordIcon.innerHTML = `<i class="bi bi-book" data-bs-toggle="modal" data-bs-target="#staticBackdrop"></i>`;
                modalResult.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="staticBackdropLabel">${player.word}</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h6 class="fs-5">Meaning:</h6>
                            <p>${player.meaning}</p>
                            <hr>
                            <h6 class="fs-5">Example:</h6>
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
    const search = data.slice(-2);

    fetch("/bot-search", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"search": search})
    }).then(res => res.json()).then((res) => {
        const botResult = document.querySelector("#bot-result");
        const botWord = document.querySelector("#bot-word");
        botResult.innerHTML = "";

        if (res.data.length === 0) {
            // Bot failed to find a word, no score update, switch turn
            switchTurn('player');
            return;
        }

        res.data.forEach(bot => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card mb-2";
            botWord.value = bot.word;

            cardDiv.innerHTML = `
                <div class="card-body border-0 outline-0" data-word="${bot.word}">
                    <h5 class="card-title">${bot.word}</h5>
                    <h6>Meaning:</h6>
                    <p class="card-title">${bot.meaning}</p>
                    <h6>Example:</h6>
                    <p class="card-title">Ang <span class="fw-bold">${bot.word}</span> ay <span class="fw-bold">${bot.meaning}</span> sa tagalog</p>
                </div>
            `;
            botResult.appendChild(cardDiv);
        });

        updateScore('bot');
        switchTurn('player');
    });
};

document.querySelector("#player-word").addEventListener("input", playerInputHandler);


resetGame();
