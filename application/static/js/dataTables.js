// Selectors
const playerRowData = document.querySelector("#playerRowData");
const botRowData = document.querySelector("#botRowData");
const wordInput = document.querySelector("#wordInput");
const meaningInput = document.querySelector("#meaningInput");
const descriptionInput = document.querySelector("#descriptionInput");
const modalButton = document.querySelector("#modalFooter");

// Fetch and display player table data
fetch("/player-table")
    .then(res => res.json())
    .then((res) => {
        tableData(res.data, 'playerEdit', 'playerDelete', 'playerEditResult', playerRowData);
    });

// Fetch and display bot table data
fetch("/bot-table")
    .then(res => res.json())
    .then((res) => {
        tableData(res.data, 'botEdit', 'botDelete', 'botEditResult', botRowData);
    });

// Function to fill modal with current data for editing player
const playerEdit = (id) => {
    fetch(`/player-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then((res) => {
        wordInput.value = res.data.word;
        meaningInput.value = res.data.meaning;
        descriptionInput.value = res.data.description;

        // Update the modal button to save the current item
        modalButton.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" onclick='playerEditResult(${res.data.id})'>Save</button>
        `;
    });
}

// Function to handle the saving of edited player data
const playerEditResult = (id) => {
    const data = JSON.stringify({
        id: id,
        word: wordInput.value,
        meaning: meaningInput.value,
        description: descriptionInput.value
    });

    fetch(`/player-edit-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data
    })
    .then(res => res.json())
    .then((res) => {
        const row = document.querySelector(`#row-${res.data.id}`);
        row.innerHTML = `
            <td>${res.data.word}</td>
            <td>${res.data.meaning}</td>
            <td>${res.data.description}</td>
            <td>
                <div class="btn-group text-center">
                    <button class="btn btn-primary btn-sm" onclick="playerEdit(${res.data.id})" data-bs-toggle="modal" data-bs-target="#wordModal">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick='playerDelete(${res.data.id})'>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Clear input fields after updating
        wordInput.value = "";
        meaningInput.value = "";
        descriptionInput.value = "";
    });
}

// Function to handle deleting of player data
const playerDelete = (id) => {
    fetch("/delete-player-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then((res) => {
        if (res.success) {
            const row = document.querySelector(`#row-${id}`);
            if (row) {
                row.remove();
            }
        } else {
            console.error('Failed to delete the item from the server.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to fill modal with current data for editing bot
const botEdit = (id) => {
    fetch(`/bot-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then((res) => {
        wordInput.value = res.data.word;
        meaningInput.value = res.data.meaning;
        descriptionInput.value = res.data.description;

        // Update the modal button to save the current item
        modalButton.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" onclick='botEditResult(${res.data.id})'>Save</button>
        `;
    });
}

// Function to handle the saving of edited bot data
const botEditResult = (id) => {
    const data = JSON.stringify({
        id: id,
        word: wordInput.value,
        meaning: meaningInput.value,
        description: descriptionInput.value
    });

    fetch(`/bot-edit-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data
    })
    .then(res => res.json())
    .then((res) => {
        const row = document.querySelector(`#row-${res.data.id}`);
        row.innerHTML = `
            <td>${res.data.word}</td>
            <td>${res.data.meaning}</td>
            <td>${res.data.description}</td>
            <td>
                <div class="btn-group text-center">
                    <button class="btn btn-primary btn-sm" onclick="botEdit(${res.data.id})" data-bs-toggle="modal" data-bs-target="#wordModal">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick='botDelete(${res.data.id})'>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Clear input fields after updating
        wordInput.value = "";
        meaningInput.value = "";
        descriptionInput.value = "";
    });
}

// Function to handle deleting of bot data
const botDelete = (id) => {
    fetch("/delete-bot-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then((res) => {
        if (res.success) {
            const row = document.querySelector(`#row-${id}`);
            if (row) {
                row.remove();
            }
        } else {
            console.error('Failed to delete the item from the server.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to populate the table
const tableData = (datas, fun, del, clickEvent, rowData) => {
    let rows = "";
    datas.forEach(data => {
        console.log(data.word)
        rows += `
            <tr id="row-${data.id}">
                <td>${data.word}</td>
                <td>${data.meaning}</td>
                <td>${data.description}</td>
                <td>
                    <div class="btn-group text-center">
                        <button class="btn btn-primary btn-sm" onclick="${fun}(${data.id})" data-bs-toggle="modal" data-bs-target="#wordModal">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick='${del}(${data.id})'>
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    rowData.innerHTML = rows;

    modalButton.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" onclick='${clickEvent}()'>Save</button>
    `;
}
