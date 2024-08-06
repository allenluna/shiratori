// Initialize Socket.IO
var socket = io();

// Define variables
const playerFormsContainer = document.querySelector("#playerFormsContainer");
const currentUserElement = document.querySelector("#current_user");
const loginUserElement = document.querySelector("#login_user");
let plyr1 = document.querySelector("#plyr1").dataset.id;
let plyr2 = document.querySelector("#plyr2").dataset.id;

// Check if elements exist before accessing dataset
const currentUserName = currentUserElement ? currentUserElement.dataset.username : '';
const loginUserName = loginUserElement ? loginUserElement.dataset.username : '';



// Define player names
const player1Element = document.querySelector("#player1");
const player2Element = document.querySelector("#player2");

const player1Name = player1Element ? player1Element.dataset.player : '';
const player2Name = player2Element ? player2Element.dataset.player : '';

if (!currentUserName || !player1Name || !player2Name || !loginUserName) {
    console.error('One or more player names or current user name are undefined');
}

let timer;
let lobbyId;
let checkAlreadyUse = []
let player1Answers = []
let player2Answers = []

document.addEventListener("DOMContentLoaded", () => {
    fetchLobbyId()
        .then(id => {
            if (id) {
                lobbyId = id;
                initializePlayerForms(); // Initialize player forms after lobby ID is fetched
                getCurrentTurn(); // Set initial input states based on the current turn
            }
        });

    // Add event listener for the Start Game button
    document.getElementById('startGameBtn').addEventListener('click', () => {
        socket.emit('start_game');
    });

    // Listen for the reload_page event
    socket.on('reload_page', () => {
        startTimer(); // Start the timer when the game starts
        getCurrentTurn(); // Update input states correctly
    });

    // Listen for turn_changed event
    socket.on('turn_changed', () => {
        getCurrentTurn(); // Update input states when turn changes
    });
});

const fetchLobbyId = () => {
    return fetch('/get-lobby-id')
        .then(response => response.json())
        .then(data => data.lobby_id || Promise.reject('Lobby ID not found'));
};

const startTimer = () => {
    let timeLeft = 5; // Set initial timer value
    document.querySelector("#timer").textContent = `Time left: ${timeLeft}s`;

    clearInterval(timer); // Clear any existing timer

    timer = setInterval(() => {
        timeLeft -= 1;
        document.querySelector("#timer").textContent = `Time left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            switchTurn();
        }
    }, 1000);
};

const switchTurn = () => {
    fetch('/switch-turn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'lobby_id': lobbyId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            getCurrentTurn();
            startTimer(); // Restart the timer for the new turn
        }
    })
    .catch(error => console.error('Error switching turn:', error));
};

const getCurrentTurn = () => {
    // console.log('Fetching current turn');
    fetch('/get-turn?user_name=' + encodeURIComponent(loginUserName))
        .then(response => response.json())
        .then(data => {
            const isUserTurn = data.is_user_turn; // true or false
            const currentTurn = data.current_turn;
            if (currentTurn === player1Name) {
                if (isUserTurn) {
                    enablePlayer1Form();
                } else {
                    disableAllForms();
                }
            } else if (currentTurn === player2Name) {
                if (isUserTurn) {
                    enablePlayer2Form();
                } else {
                    disableAllForms();
                }
            } else {
                // console.log('Disabling all forms');
                disableAllForms(); // Disable all forms if it’s not the current user’s turn
            }
        })
        .catch(error => console.error('Error fetching turn:', error));
};

const updateLabels = (currentTurn) => {
    const player1Label = document.querySelector("#player1_label");
    const player2Label = document.querySelector("#player2_label");

    if (player1Label && player2Label) {
        if (currentTurn === player1Name) {
            player1Label.textContent = `${player1Name}'s Turn`;
            player2Label.textContent = `${player2Name}`;
        } else if (currentTurn === player2Name) {
            player1Label.textContent = `${player1Name}`;
            player2Label.textContent = `${player2Name}'s Turn`;
        }
    } else {
        console.error('Labels not found.');
    }
};


let setArray = (arr) => {
    return new Set([arr])
}

const enablePlayer1Form = () => {
    const player1WordInput = document.querySelector("#player1_word");
    const player1Btn = document.querySelector("#player1Btn");
    const player2WordInput = document.querySelector("#player2_word");
    const player2Btn = document.querySelector("#player2Btn");

    if (player1WordInput && player1Btn && player2WordInput && player2Btn) {
        player1WordInput.disabled = false;
        player1Btn.disabled = false;
        player2WordInput.disabled = true;
        player2Btn.disabled = true;

        
        player1Btn.addEventListener("click", () => {
            let answer = player1WordInput.value;
            player1Answers.push(answer)
            console.log(player1Answers[player1Answers.length - 1])
            const historyList = document.getElementById('history-list');
            const item = document.createElement('li');
            item.className = 'list-group-item';
            item.classList.add('list-group-item-primary');
            item.textContent = player1Answers[player1Answers.length - 1];
            historyList.appendChild(item);
            historyList.scrollTop = historyList.scrollHeight; 
            
            fetch("/players-answer", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"player1_answer": answer, "player1_id": plyr1})
            }).then(res => res.json()).then(res => {
                const playerResultDiv = document.querySelector("#player1-result");
                const wordIcon = document.querySelector("#word-icon");
                const modalResult = document.querySelector("#modal-result");
                playerResultDiv.innerHTML = "";

                res.data.forEach(player => {
                    const cardDiv = document.createElement("div");
                    cardDiv.className = "card mb-2";
                    cardDiv.innerHTML = `
                        <div class="text-center card-body border-0 outline-0" data-word="${player.word}">
                            <h5 class="card-title">${player.word}</h5>
                            <h6>Meaning:</h6>
                            <p class="card-title">${player.meaning}</p>
                            <h6>Example:</h6>
                            <p class="card-title">Ang <span class="fw-bold text-danger">${player.word}</span> ay <span class="fw-bold text-danger">${player.meaning}</span> sa tagalog</p>
                        </div>
                    `;
                    playerResultDiv.appendChild(cardDiv);
                });
            }).catch(error => {
                console.error("Error:", error);
            });
        });

        updateLabels(player1Name); // Update labels based on the current turn
    } else {
        console.error('One or more form elements not found.');
    }
};

const enablePlayer2Form = () => {
    const player1WordInput = document.querySelector("#player1_word");
    const player1Btn = document.querySelector("#player1Btn");
    const player2WordInput = document.querySelector("#player2_word");
    const player2Btn = document.querySelector("#player2Btn");

    if (player1WordInput && player1Btn && player2WordInput && player2Btn) {
        player2WordInput.disabled = false;
        player2Btn.disabled = false;
        player1WordInput.disabled = true;
        player1Btn.disabled = true;

        player2Btn.addEventListener("click", () => {
            let answer = player2WordInput.value;

            player2Answers.push(answer)

            const historyList = document.getElementById('history-list');
            const item = document.createElement('li');
            item.className = 'list-group-item';
            item.classList.add('list-group-item-primary');
            item.textContent = player2Answers[player2Answers.length - 1]
            historyList.appendChild(item);
            historyList.scrollTop = historyList.scrollHeight; // Scroll to bottom of history list

            fetch("/players-answer", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"player2_answer": answer, "player2_id": plyr2})
            }).then(res => res.json()).then(res => {
                const playerResultDiv = document.querySelector("#player2-result");
                const wordIcon = document.querySelector("#word-icon");
                const modalResult = document.querySelector("#modal-result");
                playerResultDiv.innerHTML = "";

                res.data.forEach(player => {
                    const cardDiv = document.createElement("div");
                    cardDiv.className = "card mb-2";
                    cardDiv.innerHTML = `
                        <div class="text-center card-body border-0 outline-0" data-word="${player.word}">
                            <h5 class="card-title">${player.word}</h5>
                            <h6>Meaning:</h6>
                            <p class="card-title">${player.meaning}</p>
                            <h6>Example:</h6>
                            <p class="card-title">Ang <span class="fw-bold text-danger">${player.word}</span> ay <span class="fw-bold text-danger">${player.meaning}</span> sa tagalog</p>
                        </div>
                    `;
                    playerResultDiv.appendChild(cardDiv);
                });
            }).catch(error => {
                console.error("Error:", error);
            });
        });

        updateLabels(player2Name); // Update labels based on the current turn
    } else {
        console.error('One or more form elements not found.');
    }
};

const disableAllForms = () => {
    const player1WordInput = document.querySelector("#player1_word");
    const player1Btn = document.querySelector("#player1Btn");
    const player2WordInput = document.querySelector("#player2_word");
    const player2Btn = document.querySelector("#player2Btn");

    if (player1WordInput && player1Btn && player2WordInput && player2Btn) {
        player1WordInput.disabled = true;
        player1Btn.disabled = true;
        player2WordInput.disabled = true;
        player2Btn.disabled = true;
    } else {
        console.error('One or more form elements not found.');
        console.log('player1WordInput:', player1WordInput);
        console.log('player1Btn:', player1Btn);
        console.log('player2WordInput:', player2WordInput);
        console.log('player2Btn:', player2Btn);
    }
};

const initializePlayerForms = () => {
    const player1Form = `
        <div class="col-md-6 mb-4">
            <div class="card position-relative">
                <label id="player1_label" for="player1_word" class="form-label text-center fs-3 pt-3">${player1Name}</label>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-9 text-center">
                            <div class="input-group">
                                <input type="text" class="form-control" id="player1_word" required placeholder="Word" autocomplete="off" disabled>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-dark w-100" id="player1Btn" disabled>Submit</button>
                        </div>
                    </div>
                    <div class="py-2" id="player1-result"></div>
                </div>
            </div>
        </div>
    `;

    const player2Form = `
        <div class="col-md-6 mb-4">
            <div class="card position-relative">
                <label id="player2_label" for="player2_word" class="form-label text-center fs-3 pt-3">${player2Name}</label>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-9">
                            <input type="text" class="form-control w-100" id="player2_word" required placeholder="Word" autocomplete="off" disabled>
                        </div>
                        <div class="col-md-3 text-center">
                            <button class="btn btn-dark w-100" id="player2Btn" disabled>Submit</button>
                        </div>
                    </div>
                    <div id="player2-result" class="py-2"></div>
                </div>
            </div>
        </div>
    `;

    playerFormsContainer.innerHTML = player1Form + player2Form;
};
