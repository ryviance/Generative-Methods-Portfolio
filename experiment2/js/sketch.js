let seed = 1;
let ground = [];
let trees = [];
let plants = [];
let clouds = [];
let isFullscreen = false;
let sunsetColors = [];

function setup() {
  const container = $('#canvas-container');
  createCanvas(container.width(), container.height()).parent('canvas-container');
  generateSunset();
  generateTerrainAndTrees();
  generateClouds();
  generatePlants();
  document.onfullscreenchange = fullscreenChanged;
}

function windowResized() {
  resizeScreenToContainer();
}

function draw() {
  drawSunset();
  drawClouds();
  drawMountains();
  drawTerrain();
  drawBottomGrass();
  drawPlants();
  drawTrees();
}

function generateSunset() {
  let baseHue = random(10, 50);
  let hueOffset = random(20, 60);
  let topColor = color(baseHue, 100, 90);
  let midColor = color(baseHue + hueOffset, 80, 70);
  let botColor = color(baseHue + hueOffset * 1.5, 60, 50);
  colorMode(HSB);
  sunsetColors = [topColor, midColor, botColor];
  colorMode(RGB);
}

function drawSunset() {
  let c1 = sunsetColors[0];
  let c2 = sunsetColors[1];
  let c3 = sunsetColors[2];
  for (let y = 0; y < height; y++) {
    let inter1 = lerpColor(c1, c2, y / (height / 2));
    let inter2 = lerpColor(c2, c3, y / (height / 2));
    let col = y < height / 2 ? inter1 : inter2;
    stroke(col);
    line(0, y, width, y);
  }
}

function generateTerrainAndTrees() {
  randomSeed(seed);
  noiseSeed(seed);
  ground = [];
  let noiseScale = 0.005;
  let amplitude = height * 0.3;
  let baseHeight = height * 0.75;
  for (let x = 0; x <= width; x++) {
    ground[x] = baseHeight - noise(x * noiseScale) * amplitude;
  }
  trees = [];
  let treeCount = floor(random(8, 18));
  for (let i = 0; i < treeCount; i++) {
    let xPos = random(width);
    let baseY = ground[floor(xPos)];
    let tHeight = random(60, 130);
    tHeight = min(tHeight, baseY - 10);
    let swayOffset = random(1000);
    trees.push({ x: xPos, baseY: baseY, height: tHeight, swayOffset: swayOffset });
  }
  generatePlants();
}

function generateClouds() {
  clouds = [];
  let cloudCount = 8;
  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: random(width),
      y: random(height * 0.3),
      size: random(60, 130),
      speed: random(0.2, 0.5),
    });
  }
}

function generatePlants() {
  plants = [];
  let plantCount = 60;
  for (let i = 0; i < plantCount; i++) {
    let x = random(width);
    let y = ground[floor(x)];
    let h = random(5, 20);
    let type = random() < 0.7 ? 'blade' : 'bush';
    plants.push({ x: x, y: y, height: h, type: type });
  }
}

function drawMountains() {
  let baseY = height * 0.6;
  let layers = 4;
  for (let i = 0; i < layers; i++) {
    let scale = 0.0015 + i * 0.0005;
    let hOffset = i * 8000;
    let col = 80 + i * 20;
    fill(col, col, col, 180 - i * 30);
    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width; x++) {
      let y = baseY - noise(x * scale + hOffset) * height * (0.15 + i * 0.05);
      vertex(x, y);
    }
    vertex(width, height);
    endShape(CLOSE);
  }
}

function drawClouds() {
  noStroke();
  for (let c of clouds) {
    fill(0, 0, 0, 30);
    ellipse(c.x + 10, c.y + 15, c.size, c.size * 0.5);
    fill(255, 255, 255, 240);
    ellipse(c.x, c.y, c.size, c.size * 0.6);
    ellipse(c.x + c.size * 0.3, c.y + 10, c.size * 0.6, c.size * 0.4);
    ellipse(c.x - c.size * 0.3, c.y + 10, c.size * 0.6, c.size * 0.4);
    c.x += c.speed;
    if (c.x > width + 100) c.x = -100;
  }
}

function drawTerrain() {
  for (let i = 0; i < 3; i++) {
    let offset = i * 3;
    fill(85 + offset, 150 + offset, 70 + offset);
    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width; x++) {
      vertex(x, ground[x] + offset);
    }
    vertex(width, height);
    endShape(CLOSE);
  }
}

function drawBottomGrass() {
  for (let i = 0; i < 2; i++) {
    let shade = 50 + i * 20;
    fill(shade, 120 + i * 10, 50);
    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width; x++) {
      let variation = noise(x * 0.02 + i * 999) * 10;
      vertex(x, ground[x] + 8 + variation + i * 5);
    }
    vertex(width, height);
    endShape(CLOSE);
  }
}

function drawTrees() {
  for (let tree of trees) {
    let sway = noise(tree.swayOffset + frameCount * 0.01) * 20 - 10;
    stroke(100, 50, 20);
    strokeWeight(4);
    line(tree.x, tree.baseY, tree.x + sway, tree.baseY - tree.height);
    noStroke();
    fill(30, 120, 30);
    ellipse(tree.x + sway, tree.baseY - tree.height, tree.height * 0.4, tree.height * 0.4);
  }
}

function drawPlants() {
  for (let plant of plants) {
    if (plant.type === 'blade') {
      stroke(20, 100, 20);
      strokeWeight(1);
      line(plant.x, plant.y, plant.x, plant.y - plant.height);
      line(plant.x, plant.y - plant.height / 2, plant.x + 2, plant.y - plant.height / 2 - 3);
      line(plant.x, plant.y - plant.height / 2, plant.x - 2, plant.y - plant.height / 2 - 3);
    } else {
      noStroke();
      fill(40, 110, 40);
      ellipse(plant.x, plant.y - plant.height / 2, plant.height * 0.8, plant.height * 0.5);
    }
  }
}

function resizeScreenToContainer() {
  const container = $('#canvas-container');
  resizeCanvas(container.width(), container.height());
  generateSunset();
  generateTerrainAndTrees();
  generateClouds();
}

function fullscreenChanged() {
  setTimeout(() => {
    resizeScreenToContainer();
  }, 100);
}

$(document).ready(function () {
  $('#reimagine').on('click', function () {
    seed++;
    generateSunset();
    generateTerrainAndTrees();
  });
  $('#fullscreen').on('click', function () {
    fullscreen(!fullscreen());
  });
});
