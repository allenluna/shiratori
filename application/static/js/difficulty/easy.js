document.querySelector("#easy-player-profile").addEventListener("click", (e) => {
    const profId = e.target.id;
    window.location.href = `/easy-profile?id=${profId}`;
});


document.querySelector("#medium-player-profile").addEventListener("click", (e) => {
    const profId = e.target.id;
    window.location.href = `/medium-profile?id=${profId}`;
});

document.querySelector("#hard-player-profile").addEventListener("click", (e) => {
    const profId = e.target.id;
    window.location.href = `/hard-profile?id=${profId}`;
});


document.querySelector("#extreme-player-profile").addEventListener("click", (e) => {
    const profId = e.target.id;
    window.location.href = `/extreme-profile?id=${profId}`;
});