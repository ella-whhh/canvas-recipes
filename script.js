let settingsButton = document.getElementById("settings-button");
let recipeButton = document.getElementById("recipe-button");
let findMealButton = document.getElementById("find-meal");
settingsButton.addEventListener("click", loadSettings);
recipeButton.addEventListener("click", loadRecipe);
findMealButton.addEventListener("click", loadRecipe);

// hopefully we can access the question data here
let form = document.getElementById("questions");

// window.onload = function () {
//     var settingsButton = document.getElementById("settings-button");
//     var recipeButton = document.getElementById("recipe-button");
//     settingsButton.addEventListener("click", loadSettings);
//     recipeButton.addEventListener("click", loadRecipe);
// }

function loadSettings() {
    let settings = document.getElementById("settings");
    let recipe = document.getElementById("recipe");
    recipe.style.display = "none";
    settings.style.display = "flex";
}

function loadRecipe() {
    let settings = document.getElementById("settings");
    let recipe = document.getElementById("recipe");
    recipe.style.display = "flex";
    settings.style.display = "none";
}