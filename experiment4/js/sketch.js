// === Global Configuration and State ===
let tileSize = 50;
let cameraX = 0, cameraY = 0;
let seed = Math.floor(Math.random() * 100000);
let toggledTiles = {};
let tilePerturbations = {};
let biomeType = 'forest'; // Can be 'forest' or 'desert'

// === Setup ===
function setup() {
  const containerId = 'canvas-container';
  let containerElement = document.getElementById(containerId);
  let canvasWidth = windowWidth;
  let canvasHeight = windowHeight;
  if (containerElement) {
    canvasWidth = containerElement.clientWidth || windowWidth;
    canvasHeight = containerElement.clientHeight || windowHeight;
  }

  let canvas = createCanvas(canvasWidth, canvasHeight);
  if (containerElement) canvas.parent(containerElement);
  noSmooth();
  noiseSeed(seed);
  randomSeed(seed);

  // Seed input + biome switch
  let controlPanel = createDiv().style('margin-top', '12px');
  if (containerElement) controlPanel.parent(containerElement);

  createSpan("Seed: ").parent(controlPanel);
  let seedInput = createInput(String(seed), 'number');
  seedInput.style('width', '80px');
  seedInput.parent(controlPanel);
  seedInput.changed(() => {
    let newSeed = parseInt(seedInput.value());
    if (!isNaN(newSeed)) {
      seed = newSeed;
    }
    noiseSeed(seed);
    randomSeed(seed);
    toggledTiles = {};
    tilePerturbations = {};
    redraw();
  });

  createSpan(" Biome: ").parent(controlPanel);
  let biomeSelector = createSelect();
  biomeSelector.option('forest');
  biomeSelector.option('desert');
  biomeSelector.selected('forest');
  biomeSelector.parent(controlPanel);
  biomeSelector.changed(() => {
    biomeType = biomeSelector.value();
    redraw();
  });
}

// === Drawing ===
function draw() {
  background(220);
  drawTiles();
  highlightHoveredTile();
}

function drawTiles() {
  let startCol = Math.floor(cameraX / tileSize);
  let startRow = Math.floor(cameraY / tileSize);
  let endCol = startCol + Math.ceil(width / tileSize) + 1;
  let endRow = startRow + Math.ceil(height / tileSize) + 1;

  for (let tileY = startRow; tileY < endRow; tileY++) {
    for (let tileX = startCol; tileX < endCol; tileX++) {
      let baseNoise = noise(tileX * 0.1, tileY * 0.1);
      let coordKey = tileX + ',' + tileY;
      let perturbation = tilePerturbations[coordKey] || 0;
      let noiseValue = constrain(baseNoise + perturbation, 0, 1);

      // Select tile color based on biome
      let tileColor;
      if (biomeType === 'forest') {
        tileColor = getForestTileColor(noiseValue);
      } else {
        tileColor = getDesertTileColor(noiseValue, tileX, tileY);
      }

      fill(tileColor);
      stroke(100);
      strokeWeight(1);
      let screenX = tileX * tileSize - cameraX;
      let screenY = tileY * tileSize - cameraY;
      rect(screenX, screenY, tileSize, tileSize);
    }
  }
}

// === Biome Coloring ===
function getForestTileColor(noiseValue) {
  if (noiseValue < 0.3) return color(0, 105, 170);         // Water
  if (noiseValue < 0.6) return color(85, 160, 75);          // Grass
  return color(145, 123, 76);                               // Mountain
}

function getDesertTileColor(noiseValue, x, y) {
  if (noiseValue < 0.2) return color(255, 229, 180);        // Sand
  if (noiseValue < 0.6) {
    // Cactus pattern
    let hash = (x * 928371 + y * 1299827) % 10;
    return hash === 0 ? color(60, 180, 75) : color(255, 229, 180);
  }
  // Mountains or pyramid
  let hash = (x * 6389 + y * 1451) % 20;
  if (hash === 0) return color(230, 200, 120);              // Pyramid gold
  return color(194, 178, 128);                              // Desert rock
}

// === Highlight & Input ===
function highlightHoveredTile() {
  let hoverTileX = Math.floor((cameraX + mouseX) / tileSize);
  let hoverTileY = Math.floor((cameraY + mouseY) / tileSize);
  let screenX = hoverTileX * tileSize - cameraX;
  let screenY = hoverTileY * tileSize - cameraY;
  push();
  noFill();
  stroke(255, 255, 0, 200);
  strokeWeight(3);
  rect(screenX, screenY, tileSize, tileSize);
  pop();
}

function keyPressed() {
  const move = tileSize;
  if (keyCode === LEFT_ARROW) cameraX -= move;
  else if (keyCode === RIGHT_ARROW) cameraX += move;
  else if (keyCode === UP_ARROW) cameraY -= move;
  else if (keyCode === DOWN_ARROW) cameraY += move;
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

  let startCol = Math.floor(cameraX / tileSize);
  let startRow = Math.floor(cameraY / tileSize);
  let endCol = startCol + Math.ceil(width / tileSize) + 1;
  let endRow = startRow + Math.ceil(height / tileSize) + 1;

  for (let y = startRow; y < endRow; y++) {
    for (let x = startCol; x < endCol; x++) {
      let coordKey = x + ',' + y;
      tilePerturbations[coordKey] = (tilePerturbations[coordKey] || 0) + random(-0.03, 0.03);
    }
  }
}