// === Global Configuration and State ===
let tileSize = 50;
let cameraX = 0, cameraY = 0;
let seed = Math.floor(Math.random() * 100000);
let toggledTiles = {};
let tilePerturbations = {};
let biomeType = 'forest'; // Options: 'forest', 'desert', 'volcanic'
let lavaPoolTiles = new Set();
let lavaRiverTiles = new Set();

// === Setup ===
function setup() {
  const containerId = 'canvas-container';
  let containerElement = document.getElementById(containerId);
  let canvasWidth = containerElement?.clientWidth || windowWidth;
  let canvasHeight = containerElement?.clientHeight || windowHeight;
  let canvas = createCanvas(canvasWidth, canvasHeight);
  if (containerElement) canvas.parent(containerElement);
  noSmooth();

  generateWorld(seed);

  let controlPanel = createDiv().style('margin-top', '12px');
  if (containerElement) controlPanel.parent(containerElement);

  createSpan("Seed: ").parent(controlPanel);
  let seedInput = createInput(String(seed), 'number');
  seedInput.style('width', '80px').parent(controlPanel);
  seedInput.changed(() => {
    let newSeed = parseInt(seedInput.value());
    if (!isNaN(newSeed)) seed = newSeed;
    generateWorld(seed);
    redraw();
  });

  createSpan(" Biome: ").parent(controlPanel);
  let biomeSelector = createSelect();
  biomeSelector.option('forest');
  biomeSelector.option('desert');
  biomeSelector.option('volcanic');
  biomeSelector.selected('forest').parent(controlPanel);
  biomeSelector.changed(() => {
    biomeType = biomeSelector.value();
    generateWorld(seed);
    redraw();
  });
}

function generateWorld(seedVal) {
  noiseSeed(seedVal);
  randomSeed(seedVal);
  toggledTiles = {};
  tilePerturbations = {};
  lavaPoolTiles.clear();
  lavaRiverTiles.clear();
  if (biomeType === 'volcanic') {
    generateLavaPools();
    generateLavaRivers();
  }
}

function generateLavaPools() {
  let numPools = int(random(3, 6));
  for (let i = 0; i < numPools; i++) {
    let poolSize = int(random(10, 30));
    let startX = int(random(-50, 50));
    let startY = int(random(-50, 50));
    let pool = new Set();
    let toExpand = [[startX, startY]];
    while (pool.size < poolSize && toExpand.length > 0) {
      let [x, y] = toExpand.shift();
      let key = `${x},${y}`;
      if (pool.has(key)) continue;
      pool.add(key);
      lavaPoolTiles.add(key);
      let neighbors = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
      shuffle(neighbors, true);
      toExpand.push(...neighbors);
    }
  }
}

function generateLavaRivers() {
  let startX = int(random(-30, -20));
  let startY = int(random(-10, 10));
  let length = int(random(40, 60));
  let x = startX, y = startY;

  for (let i = 0; i < length; i++) {
    let key = `${x},${y}`;
    lavaRiverTiles.add(key);
    let branch = random([[-1,0], [1,0], [0,1], [0,-1]]);
    x += branch[0];
    y += branch[1];

    // Make the river 2–3 tiles wide
    let width = floor(random(2, 4));
    for (let dx = -width + 1; dx < width; dx++) {
      for (let dy = -width + 1; dy < width; dy++) {
        if (abs(dx) + abs(dy) < width) {
          lavaRiverTiles.add(`${x + dx},${y + dy}`);
        }
      }
    }
  }
}

function windowResized() {
  const containerId = 'canvas-container';
  let containerElement = document.getElementById(containerId);
  let newWidth = containerElement?.clientWidth || windowWidth;
  let newHeight = containerElement?.clientHeight || windowHeight;
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

  for (let y = startRow; y < endRow; y++) {
    for (let x = startCol; x < endCol; x++) {
      let baseNoise = noise(x * 0.1, y * 0.1);
      let coordKey = `${x},${y}`;
      let perturbation = tilePerturbations[coordKey] || 0;
      let noiseValue = constrain(baseNoise + perturbation, 0, 1);

      let tileColor;
      if (biomeType === 'forest') {
        tileColor = getForestTileColor(noiseValue, x, y);
      } else if (biomeType === 'desert') {
        tileColor = getDesertTileColor(noiseValue, x, y);
      } else {
        tileColor = getVolcanicTileColor(noiseValue, x, y, coordKey);
      }

      fill(tileColor);
      stroke(100);
      strokeWeight(1);
      let screenX = x * tileSize - cameraX;
      let screenY = y * tileSize - cameraY;
      rect(screenX, screenY, tileSize, tileSize);
    }
  }
}

function getForestTileColor(n, x, y) {
  if (n < 0.3) return color(0, 105, 170);
  if (n < 0.6) {
    let patch = noise(x * 0.2, y * 0.2);
    return patch < 0.4 ? color(34, 100, 34) : color(85, 160, 75);
  }
  return color(145, 123, 76);
}

function getDesertTileColor(n, x, y) {
  if (n < 0.2) return color(255, 229, 180);
  if (n < 0.6) {
    let cactus = (x * 928371 + y * 1299827) % 10;
    return cactus === 0 ? color(60, 180, 75) : color(255, 229, 180);
  }
  let pyramid = (x * 6389 + y * 1451) % 20;
  return pyramid === 0 ? color(230, 200, 120) : color(194, 178, 128);
}

function getVolcanicTileColor(n, x, y, key) {
  if (lavaPoolTiles.has(key)) return color(255, 80, 0);
  if (lavaRiverTiles.has(key)) return color(255, 40, 0);
  if (n < 0.2) return color(120, 0, 0);
  if (n < 0.6) {
    let volcano = (x * 7771 + y * 3313) % 40;
    return volcano === 0 ? color(255, 20, 20) : color(70, 70, 70);
  }
  return color(50, 50, 50);
}

function highlightHoveredTile() {
  let tx = Math.floor((cameraX + mouseX) / tileSize);
  let ty = Math.floor((cameraY + mouseY) / tileSize);
  let screenX = tx * tileSize - cameraX;
  let screenY = ty * tileSize - cameraY;
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
      let coordKey = `${x},${y}`;
      tilePerturbations[coordKey] = (tilePerturbations[coordKey] || 0) + random(-0.03, 0.03);
    }
  }
}