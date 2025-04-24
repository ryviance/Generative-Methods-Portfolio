
// === Global Configuration and State ===
let tileSize = 50;
let cameraX = 0, cameraY = 0;
let seed = Math.floor(Math.random() * 100000);
let toggledTiles = {};
let tilePerturbations = {};  // NEW: Stores noise perturbations per tile

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

  let seedInput = createInput(String(seed), 'number');
  seedInput.position(10, 10);
  seedInput.style('width', '100px');
  seedInput.attribute('title', 'Enter a numerical seed and press Enter');
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
}

function windowResized() {
  const containerId = 'canvas-container';
  let containerElement = document.getElementById(containerId);
  let newWidth = windowWidth;
  let newHeight = windowHeight;
  if (containerElement) {
    newWidth = containerElement.clientWidth || windowWidth;
    newHeight = containerElement.clientHeight || windowHeight;
  }
  resizeCanvas(newWidth, newHeight);
}

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

      let tileColor;
      if (noiseValue < 0.3) {
        tileColor = color(0, 105, 170);
      } else if (noiseValue < 0.6) {
        tileColor = color(85, 160, 75);
      } else {
        tileColor = color(145, 123, 76);
      }

      fill(tileColor);
      stroke(100);
      strokeWeight(1);
      let screenX = (tileX * tileSize) - cameraX;
      let screenY = (tileY * tileSize) - cameraY;
      rect(screenX, screenY, tileSize, tileSize);
    }
  }
}

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
  const moveDistance = tileSize;
  if (keyCode === LEFT_ARROW) cameraX -= moveDistance;
  else if (keyCode === RIGHT_ARROW) cameraX += moveDistance;
  else if (keyCode === UP_ARROW) cameraY -= moveDistance;
  else if (keyCode === DOWN_ARROW) cameraY += moveDistance;
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

  let startCol = Math.floor(cameraX / tileSize);
  let startRow = Math.floor(cameraY / tileSize);
  let endCol = startCol + Math.ceil(width / tileSize) + 1;
  let endRow = startRow + Math.ceil(height / tileSize) + 1;

  for (let tileY = startRow; tileY < endRow; tileY++) {
    for (let tileX = startCol; tileX < endCol; tileX++) {
      let coordKey = tileX + ',' + tileY;
      // Apply a small perturbation within range [-0.03, +0.03]
      tilePerturbations[coordKey] = (tilePerturbations[coordKey] || 0) + random(-0.03, 0.03);
    }
  }
}