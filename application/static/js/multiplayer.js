document.addEventListener("DOMContentLoaded", () => {
    loadLobbies();

    document.querySelector("#btnCreateLobby").addEventListener("click", () => {
        let name = document.querySelector("#name").value;

        fetch("/create-lobby", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"name": name})
        }).then(res => res.json()).then(res => {
            if(res.data === "works"){
                lobby_items(res.name, res.id);
                document.querySelector("#name").value = ""; // Clear the input field
                // Close the modal
                let createLobbyModal = document.querySelector('#createLobbyModal');
                let modal = bootstrap.Modal.getInstance(createLobbyModal);
                modal.hide();
            } else {
                console.error(res.message);
            }
        }).catch(err => {
            console.error("Error:", err);
        });
    });
});


const lobby_items = (name, id, userData ,userCount = 0) => {
    let lobby = document.querySelector("#lobby");
    let lobbyItems = document.createElement("div");
    lobbyItems.className = "lobby-items mb-3";

    let userIndicators;
    switch (userCount) {
        case 1:
            userIndicators = `
                <div class="dot-user"></div>
                <i class="dot-empty"></i>
            `;
            break;
        case 2:
            userIndicators = `
                <div class="dot-user"></div>
                <i class="dot-user"></i>
            `;
            break;
        default:
            userIndicators = `
                <div class="dot-empty"></div>
                <i class="dot-empty"></i>
            `;
    }

    let hasUsers = userCount > 0;
    lobbyItems.innerHTML = `
        <div class="lobby-name">${name}</div>
        <div class="user-join">
            ${userIndicators}
            <div class="btn ${hasUsers ? 'btn-success' : 'btn-secondary'} join-btn" data-lobby-id="${id}" ${hasUsers ? '' : 'disabled'}>${hasUsers ? 'Makyabe' : 'Alang Tau'}</div>
        </div>
    `;

    lobby.appendChild(lobbyItems);

    let joinButton = lobbyItems.querySelector(".join-btn");
    if (joinButton && !joinButton.classList.contains("disabled")) {
        joinButton.addEventListener("click", (event) => {
            let lobbyId = event.target.getAttribute("data-lobby-id");
            fetch(`/join-lobby/${lobbyId}`, {
                method: "POST"
            }).then(response => {
                if (response.ok) {
                    window.location.href = `/join-lobby/${lobbyId}`;
                } else {
                    return response.json().then(data => {
                        alert(data.error || 'An error occurred');
                    });
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('An error occurred while trying to join the lobby');
            });
        });
    }
}


const loadLobbies = () => {
    fetch("/get-lobbies", {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(lobbies => {
        lobbies.forEach(lobby => {
            lobby_items(lobby.name, lobby.id, lobby.has_users, lobby.user_count);
        });
    })
    .catch(err => {
        console.error("Error:", err);
    });
}
