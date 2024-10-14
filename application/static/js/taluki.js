document.querySelector("#taluki").addEventListener("click", () => {
    let authForm = document.querySelector(".auth-form");
    let homePage = document.querySelector("#carousel-homepage");
    homePage.style.display = "none";
    authForm.style.display = "block";

})



document.querySelector("#username").addEventListener("input", (e) => {
    let nameBtn = document.querySelector("#nameBtn");
    // Enable or disable the button based on input value
    nameBtn.disabled = e.target.value.trim() === ""; // Disable if input is empty
});
