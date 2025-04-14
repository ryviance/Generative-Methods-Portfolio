// Global variables for terrain generation
let seed = 1;
let ground = [];
let trees = [];
let isFullscreen = false;

function setup() {
  const container = $('#canvas-container');
  createCanvas(container.width(), container.height()).parent('canvas-container');

  generateTerrainAndTrees();

  // Hook up fullscreen change detection
  document.onfullscreenchange = fullscreenChanged;
}

function windowResized() {
  resizeScreenToContainer();
}

function draw() {
  background(135, 206, 235);  // light blue sky

  // Draw terrain
  noStroke();
  fill(85, 150, 70);
  beginShape();
  vertex(0, height);
  for (let x = 0; x <= width; x++) {
    vertex(x, ground[x]);
  }
  vertex(width, height);
  endShape(CLOSE);

  // Draw trees
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
  let treeCount = floor(random(5, 15));
  for (let i = 0; i < treeCount; i++) {
    let xPos = random(width);
    let baseY = ground[floor(xPos)];
    let tHeight = random(50, 120);
    tHeight = min(tHeight, baseY - 10);
    let swayOffset = random(1000);
    trees.push({ x: xPos, baseY: baseY, height: tHeight, swayOffset: swayOffset });
  }
}

function resizeScreenToContainer() {
  const container = $('#canvas-container');
  resizeCanvas(container.width(), container.height());
  generateTerrainAndTrees();
}

function fullscreenChanged() {
  setTimeout(() => {
    resizeScreenToContainer();
  }, 100);
}

$(document).ready(function () {
  $('#reimagine').on('click', function () {
    seed++;
    generateTerrainAndTrees();
  });

  $('#fullscreen').on('click', function () {
    fullscreen(!fullscreen());
  });
});
