const wordInput = document.querySelector("#edit-word");
const meaningInput = document.querySelector("#edit-meaning");
const descriptionInput = document.querySelector("#edit-description");
const modalButton = document.querySelector("#modal-footer");
document.querySelector("#playerBtn").addEventListener("click", (e) => {
    e.preventDefault();
    playerPostData();
});

// document.querySelector("#botBtn").addEventListener("click", (e) => {
//     e.preventDefault();
//     botPostData();
// });
const playerPostData = () => {
    const playerWord = document.querySelector("#player-word").value;
    const playerMeaning = document.querySelector("#player-meaning").value;
    const playerDesc = document.querySelector("#player-description").value;

    postData(playerWord, playerMeaning, playerDesc, "/add-bot");
}

// const botPostData = () => {
//     const word = document.querySelector("#bot-word").value;
//     const meaning = document.querySelector("#bot-meaning").value;
//     const desc = document.querySelector("#bot-description").value;

//     postData(word, meaning, desc, "/add-bot");
// }

fetch("/bot-table").then(res => res.json()).then(res => {
    player_dic_data(res.data);
});


const player_dic_data = (datas) => {
    const row = document.querySelector("#row-data");

    datas.forEach(data => {
        let new_data = `
            <td>${data.word}</td>
            <td>${data.meaning}</td>
            <td>${data.description}</td>
            <td>
                <div class="btn-group text-center">
                    <button class="btn btn-primary btn-sm" id="${data.id}" onclick="playerEdit(${data.id})" data-bs-toggle="modal" data-bs-target="#edit-word-data">
                        <i class="bi bi-pencil" id="${data.id}"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" id="${data.id}" onclick='playerDelete(${data.id})'>
                        <i class="bi bi-trash" id="${data.id}"></i>
                    </button>
                </div>
            </td>
        `;
        
        let new_row = document.createElement("tr");
        new_row.id = `row-${data.id}`;
        new_row.classList.add("dataRow");
        new_row.innerHTML = new_data;
        row.appendChild(new_row);
    });
};

const postData = (words, meaning, descriptions, route) => {
    const formData = Object.fromEntries(createFormData(words, meaning, descriptions).entries());
    fetch(route, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData)
    }).then(res => res.json()).then((res) => {
        if (res.error) {
            console.log(res.error);
        } else {
            clearFormInputs("#player-word", "#player-meaning", "#player-description");

            const data_row = document.querySelector("#row-data");
            const new_data = `
                <td>${res.data.word}</td>
                <td>${res.data.meaning}</td>
                <td>${res.data.description}</td>
                <td>
                    <div class="btn-group text-center">
                        <button class="btn btn-primary btn-sm" id="${res.data.id}" onclick="playerEdit(${res.data.id})" data-bs-toggle="modal" data-bs-target="#edit-word-data">
                            <i class="bi bi-pencil" id="${res.data.id}"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" id="${res.data.id}" onclick='playerDelete(${res.data.id})'>
                            <i class="bi bi-trash" id="${res.data.id}"></i>
                        </button>
                    </div>
                </td>
            `;
            
            const new_row = document.createElement("tr");
            new_row.id = `row-${res.data.id}`;
            new_row.classList.add("dataRow");
            new_row.innerHTML = new_data;
            data_row.appendChild(new_row);
            
            console.log('Data submitted successfully');
        }
    }).catch(error => console.error('Error:', error));
}


const createFormData = (word, meaning, description) => {
    const newForm = new FormData();
    newForm.append("word", word);
    newForm.append("meaning", meaning);
    newForm.append("description", description);

    return newForm;
};


///////////////////////// Edit Function //////////////////////// 
const playerEdit = (id) => {
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



const clearFormInputs = (word, meaning, desc) => {
    document.querySelector(word).value = '';
    document.querySelector(meaning).value = '';
    document.querySelector(desc).value = '';
};

document.querySelector("#back-to").addEventListener("click", () => {
    window.history.back()
})