// imports
import axios from './node_modules/axios/index.cjs';
import dotenv from './node_modules/dotenv/lib/main';
dotenv.config();
import OpenAI from './node_modules/openai/index.mjs';

let cooked = false;

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

// PRITHIKAA'S CODE
const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};

async function create_array() {
    fetch('https://www.googleapis.com/calendar/v3/calendars/66e3c9fe603a1a452f0eac3ea75bf0dc6595e23426a3542e5724b2e1a2a5870e@group.calendar.google.com/events?key=AIzaSyDHzyBKIp_K7hNiAC6TTxp6jGFXGKZZv_0')
        .then((response) => response.json()) // Transform the data into json
        .then(function (data) {
            // console.log(JSON.stringify(data));
            var res =
                JSON.parse(JSON.stringify(data));
            //console.log(res);
            res.items = res.items.map(item => {
                return {
                    summary: item.summary,
                    start: item.start,
                    end: item.end
                };
            });
            // console.log(res);
            //return parse_all(res.items);
            const today = new Date().toLocaleDateString(undefined, options);
            let hours = 0;
            res.items.forEach(element => {
                const startTime = new Date(element.start.dateTime);
                var date_string = startTime.toLocaleDateString(undefined, options);
                if (today.localeCompare(date_string) == 0) {
                    const endTime = new Date(element.end.dateTime);
                    hours += ((endTime.getTime() - startTime.getTime()) / 3600000.0);
                }
            });
            // var sleep = Math.floor((Math.random() * 4) * 100) / 100;
            // sleep += 4;
            var sleep = 7;
            hours += sleep;
            console.log("h: " + hours);
            main(hours);
            //return hours;
        });
}

// VOID'S CODE it works i think
// static
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

// dynamic
let gptOutput = ''; // recipe name
let topLink = ''; // link to a recipe to fetch to user
let downtimeScore = 3.0; // how many hours per day the user is free for, collected by calendar
let userConfidence = 0.5; // 0-1 score of how confident the user is in cooking
let budget = 10; // user's budget per meal in dollars
let dietaryRestrictions = ''; // to be implemented

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
        console.log('No top link found.'); // TODO incorporate error messages into UI??
    }
};

async function main(hours) {
    // create array
    // let hours = await create_array();
    // calendarData should be set
    console.log("h2: " + hours);
    downtimeScore = (24 - hours) / 24.0;
    console.log("dt: " + downtimeScore);

    // build gptInput
    let time = '';
    if (downtimeScore < 0.1) {
        // hella busy (i.e. VERY cooked)
        time = 'very VERY quick grab n go';
        cooked = true;
    } else if (downtimeScore < 0.5) {
        // cooked
        time = 'quick 5 minute';
        cooked = true; // use this variable in display
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
    if (difficulty < 0.1) {
        // novice
        difficulty = 'very easy';
    } else if (difficulty < 0.2) {
        // beginner
        difficulty = 'easy';
    } else if (difficulty < 0.4) {
        // intermediate
        difficulty = 'intermediate';
    } else if (difficulty < 0.6) {
        difficulty = 'advanced';
    } else if (difficulty = 0.8) {
        // expert
        difficulty = 'very hard';
    } else {
        difficulty = 'extremely difficult';
    }

    let budgetStr = '';
    if (budget < 2) {
        budgetStr = 'dirt broke college student cheap';
    } else if (budget < 5) {
        budgetStr = 'cheap';
    } else if (budget < 10) {
        budgetStr = 'decently priced';
    } else if (budget < 20) {
        budgetStr = 'higher-priced';
    } else {
        // budget >= 20
        budgetStr = 'bougie';
    }

    let gptInput = "Generate a " + time + " " + difficulty + " " + budgetStr + " " + dietaryRestrictions + " " +
        "recipe for a meal. Only give the name of the recipe. Don't output anything else. Please.";
    console.log(gptInput);
    await getRecipe(gptInput);
    // gptOutput now reflects the recipe generated by ai
    console.log("recipe generated: " + gptOutput)
    await fetchTopLink(gptOutput);
    // gptOutput now reflects top link resulting from web searching gptOutput
    console.log("link found: " + topLink);
}

create_array();
// main();