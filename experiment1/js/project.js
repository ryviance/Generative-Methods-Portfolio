// project.js - Random story generator
// Author: Eion Ling
// Date: 4/8/2025

const fillers = {
  chefs: [
    "Gordon Ramsay", "Julia Child", "Anthony Bourdain", "Wolfgang Puck", "Alice Waters",
    "Emeril Lagasse", "Massimo Bottura", "Heston Blumenthal", "Ferran Adrià",
    "Thomas Keller", "Nobu Matsuhisa", "Samin Nosrat"
  ],
  pre: ["Spaghett", "Flamb", "Chop", "Simmer", "Boil", "Roast"],
  post: ["olini", "é", "zilla", "stein", "worthy", "boi", "delish"],
  moods: [
    "hangry", "inspired", "chaotic", "zen", "sleep-deprived", "passionate",
    "experimental", "mystical", "frenzied", "possessed", "extra"
  ],
  utensils: [
    "spatula", "whisk", "cleaver", "ladle", "paring knife", "rolling pin",
    "grater", "saucepan", "torch", "tongs", "colander", "mandoline"
  ],
  num: [
    "a pinch", "a dash", "a heaping scoop", "twelve sprinkles", "a suspicious amount",
    "exactly three shakes", "one soul's worth"
  ],
  flavor: [
    "umami", "spicy", "sweet", "bitter", "sour", "savory", "smoky",
    "funky", "crunchy", "unctuous"
  ],
  ingredients: [
    "truffles", "anchovies", "gummy bears", "cabbage", "forbidden cheese",
    "dragonfruit", "cheddar tears", "ramen dust", "shrimp ghosts", "basilisk eggs"
  ],
  message: [
    "recipe", "scent", "summons", "flavor vision", "rumble in the gut",
    "food whisper", "sizzle echo", "ancient Yelp review"
  ]
};

const template = `Let's cook something together!

I just received a $message from $pre$post, where the $moods chef $chefs needs our help in the kitchen. They've run out of $ingredients and chaos is boiling over.

Bring your trusty $utensils, and don't forget $num of $flavor magic. With your help, we might just turn this culinary disaster into a five-star feast.`;

const slotPattern = /\$(\w+)/;

function replacer(match, name) {
  let options = fillers[name];
  if (options) {
    return options[Math.floor(Math.random() * options.length)];
  } else {
    return `<UNKNOWN:${name}>`;
  }
}

function generate() {
  let story = template;
  while (story.match(slotPattern)) {
    story = story.replace(slotPattern, replacer);
  }

  document.getElementById("box").innerText = story;
}

document.addEventListener("DOMContentLoaded", () => {
  const clicker = document.getElementById("clicker");
  if (clicker) {
    clicker.addEventListener("click", generate);
  }

  generate(); // Show a random story on page load
});
