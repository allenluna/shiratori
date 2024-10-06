document.querySelector("#taluki").addEventListener("click", () => {
    let authForm = document.querySelector(".auth-form");
    let homePage = document.querySelector("#carousel-homepage");
    homePage.style.display = "none";
    authForm.style.display = "block";

})