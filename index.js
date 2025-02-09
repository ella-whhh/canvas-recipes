function loadSettings() {
    print("settings");
    let settings = document.getElementById("settings");
    let recipe = document.getElementById("recipe");
    recipe.style.display = "none";
    settings.style.display = "block";
}

function loadRecipe() {
    print("recipe");
    let settings = document.getElementById("settings");
    let recipe = document.getElementById("recipe");
    recipe.style.display = "block";
    settings.style.display = "none";
}