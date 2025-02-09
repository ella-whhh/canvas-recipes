// imports
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';

// ELLA'S CODE
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

// VOID'S CODE it works i think
// static
const BRAVE_API_KEY = process.env.BRAVE_API_KEY; // BSAPDnG03B9plirRTdZ-QbH5EhnCUGJ

// dynamic
let gptOutput = ''; // recipe name
let topLink = ''; // link to a recipe to fetch to user
let downtimeScore = 3.0; // how many hours per day the user is free for
let userConfidence = 0.5; // 0-1 score of how confident the user is in cooking
let budget = 10; // user's budget per meal in dollars

//////// AI
const openai = new OpenAI({
    apiKey: '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',
    baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function getRecipe(input) {
    const completion = await openai.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [{ "role": "user", "content": input }],
        temperature: 0.5,
        top_p: 1,
        max_tokens: 1024,
        stream: true,
    })

    // migrate to class variable
    for await (const chunk of completion) {
        gptOutput += chunk.choices[0]?.delta?.content || '';
    }
}

//////// WEBSCRAPING
async function getTopSearchLink(query) {
    // Return the link from the top Brave search result for the given query
    const url = 'https://api.search.brave.com/res/v1/web/search';
    const headers = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY,
    };
    const params = {
        q: query,
        result_filter: 'web',
        count: 1, // Request only the top result
    };

    try {
        const response = await axios.get(url, { headers, params });

        const results = response.data;

        if (results.web && results.web.results && results.web.results.length > 0) {
            const topResult = results.web.results[0];
            // Attempt to extract the link (could be under 'url' or 'link')
            const topLink = topResult.url || topResult.link;

            if (topLink) {
                return topLink;
            } else {
                console.log('No link found in the top result.');
            }
        } else {
            console.log('No web results found.');
        }
    } catch (error) {
        console.error('Error during Brave search: ${error}');
    }

    return null;
}

async function fetchTopLink(query) {
    topLink = await getTopSearchLink(query);
    if (!topLink) {
        console.log('No top link found.');
    }
};

async function main() {
    // build gptInput
    let time = '';
    if(downtimeScore < 0.1) {
        // hella busy (i.e. VERY cooked)
        time = 'very VERY quick grab n go';
    } else if (downtimeScore < 0.5) {
        // cooked
        time = 'quick 5 minute';
    } else if (downtimeScore < 1) {
        // medium cooked
        time = 'quick 15 minute';
    } else if (downtimeScore < 2) {
        // free
        time = 'quick 30 min';
    } else if (downtimeScore < 4) {
        // hella free
        time = '45 min';
    } else if (downtimeScore < 8) {
        time = '1 hr';
    } else {
        // downtimeScore >= 4
        time = '2+ hr';
    }

    let difficulty = '';
    if(difficulty < 0.1) {
        // novice
        difficulty = 'very easy';
    } else if (difficulty < 0.2) {
        // beginner
        difficulty = 'easy';
    } else if (difficulty < 0.4) {
        // intermediate
        difficulty = 'intermediate';
    } else if ( difficulty < 0.6) { 
        difficulty = 'advanced';
    } else if (difficulty = 0.8) {
        // expert
        difficulty = 'very hard';
    } else {
        difficulty = 'extremely difficult';
    }

    let budgetStr = '';
    if(budget < 2) {
        budgetStr = 'dirt broke college student cheap';
    } else if(budget < 5) {
        budgetStr = 'cheap';
    } else if (budget < 10) {
        budgetStr = 'affordable';
    } else if (budget < 20) {
        budgetStr = 'mid-range';
    } else {
        // budget >= 20
        budgetStr = 'bougie';
    }
    
    let gptInput = "Generate a " + time + " " + difficulty + " " + budgetStr + " " + 
            "recipe for a meal. Only give the name of the recipe. Don't output anything else. Please.";
    console.log(gptInput);
    await getRecipe(gptInput);
    // gptOutput now reflects the recipe generated by ai
    console.log("recipe generated: " + gptOutput)
    await fetchTopLink(gptOutput);
    // gptOutput now reflects top link resulting from web searching gptOutput
    console.log("link found: " + topLink);
}

main();
