// sketch.js - Evolutionary Art Generator with Inspiration Matching
// Author: Eion Ling
// Date:

// === Constants and Globals ===
let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;
let mutationCount = 0;

let canvasContainer;
let centerHorz, centerVert;

const VALUE1 = 1;
const VALUE2 = 2;

class MyClass {
  constructor(param1, param2) {
    this.property1 = param1;
    this.property2 = param2;
  }

  myMethod() {
    // Optional utility or debug logic
  }
}

// === Initialization and Setup ===
function preload() {
  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl, img => {
      img.resize(256, 0); // Resize to fixed width, maintain aspect
    });
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
}

function setup() {
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(256, 256); // Fixed canvas size
  canvas.parent("canvas-container");

  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();

  currentCanvas = canvas;
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;

  // Draw the original inspiration image and capture pixels
  image(currentInspiration.image, 0, 0, width, height);
  loadPixels();
  currentInspirationPixels = pixels.slice(); // clone pixels array

  updateOriginalImageDisplay();
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2;
  centerVert = canvasContainer.height() / 2;
}

// === Draw Loop ===
function draw() {
  if (!currentInspiration.image || !currentInspiration.image.width) {
    background(50);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Loading image...", width / 2, height / 2);
    return;
  }

  if (!currentDesign) return;

  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  mutateDesign(currentDesign, currentInspiration, slider.value / 100.0);

  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  loadPixels();
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore.toFixed(6);

  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore.toFixed(6);
  }

  fpsCounter.innerHTML = Math.round(frameRate());
}

// === Support Functions ===
function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}

function updateOriginalImageDisplay() {
  const div = document.getElementById("original-image");
  div.innerHTML = "";
  const img = document.createElement("img");
  img.src = currentInspiration.assetUrl;
  img.alt = currentInspiration.name;
  img.width = 256;
  img.height = 256;
  div.appendChild(img);
}

function evaluate() {
  let error = 0;
  let n = pixels.length;
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1 / (1 + error / n);
}

function memorialize() {
  let url = currentCanvas.canvas.toDataURL();
  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.height = height;
  img.title = currentScore.toFixed(6);

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;
  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

// === Design Logic ===
function getInspirations() {
  return [
    {
      name: "Starry Night",
      assetUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/500px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
      credit: "The Starry Night, Vincent van Gogh, 1889"
    },
    {
      name: "Hokusai Wave",
      assetUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1200px-Tsunami_by_hokusai_19th_century.jpg",
      credit: "The Great Wave off Kanagawa, Hokusai, 1831"
    },
    {
      name: "Earthrise (NASA)",
      assetUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8K5bs1xszrUQo-BNEgrsXRR116rx6eW_Raw&s",
      credit: "Earthrise, NASA Apollo 8, 1968"
    },
    {
      name: "WWI Dog Photo",
      assetUrl: "https://warfarehistorynetwork.com/wp-content/uploads/Military-Dogs-World-War-2-Pictures-of-Pets-in-Action-005.jpg",
      credit: "WWI Soldiers and Dog, Public Domain"
    }
  ];
}

function initDesign(inspiration) {
  let design = {
    bg: 128,
    fg: []
  };
  for (let i = 0; i < 100; i++) {
    design.fg.push({
      x: random(width),
      y: random(height),
      w: random(width / 2),
      h: random(height / 2),
      fill: random(255)
    });
  }
  return design;
}

function renderDesign(design, inspiration) {
  background(design.bg);
  noStroke();
  for (let box of design.fg) {
    fill(box.fill, 128);
    rect(box.x, box.y, box.w, box.h);
  }
}

function mutateDesign(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate);
  for (let box of design.fg) {
    box.fill = mut(box.fill, 0, 255, rate);
    box.x = mut(box.x, 0, width, rate);
    box.y = mut(box.y, 0, height, rate);
    box.w = mut(box.w, 0, width / 2, rate);
    box.h = mut(box.h, 0, height / 2, rate);
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}