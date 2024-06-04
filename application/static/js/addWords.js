document.querySelector("#playerBtn").addEventListener("click", (e) => {
    e.preventDefault();
    playerPostData();
});

document.querySelector("#botBtn").addEventListener("click", (e) => {
    e.preventDefault();
    botPostData();
});
const playerPostData = () => {
    const playerWord = document.querySelector("#player-word").value;
    const playerMeaning = document.querySelector("#player-meaning").value;
    const playerDesc = document.querySelector("#player-description").value;

    postData(playerWord, playerMeaning, playerDesc, "/add-player");
}

const botPostData = () => {
    const word = document.querySelector("#bot-word").value;
    const meaning = document.querySelector("#bot-meaning").value;
    const desc = document.querySelector("#bot-description").value;

    postData(word, meaning, desc, "/add-bot");
}

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
            if(route == "/add-player"){
                clearFormInputs("#player-word", "#player-meaning", "#player-description")
            }
            clearFormInputs("#bot-word", "#bot-meaning", "#bot-description")
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



const clearFormInputs = (word, meaning, desc) => {
    document.querySelector(word).value = '';
    document.querySelector(meaning).value = '';
    document.querySelector(desc).value = '';
};