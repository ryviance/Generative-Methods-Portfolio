let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

function preload() {
  tilesetImage = loadImage(
    "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
  );
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  console.log("New seed:", seed);
  select("#seedReport").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
  return grid.map(row => row.join("")).join("\n");
}

function stringToGrid(str) {
  return str.split("\n").map(line => line.split(""));
}

function setup() {
  console.log("Setup triggered");

  const asciiBox = select("#asciiBox");
  const reseedBtn = select("#reseedButton");

  if (!asciiBox || !reseedBtn) {
    console.error("Missing required elements in DOM");
    return;
  }

  numCols = asciiBox.attribute("rows") | 0;
  numRows = asciiBox.attribute("cols") | 0;

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  reseedBtn.mousePressed(reseed);
  asciiBox.input(reparseGrid);

  reseed();
}

function draw() {
  randomSeed(seed);
  drawGrid(currentGrid);
}

function drawGrid(grid) {
  background(128);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === '_') {
        placeTile(i, j, floor(random(4)), 0);
      }
    }
  }
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}

function generateGrid(cols, rows) {
  let grid = [];
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push("_");
    }
    grid.push(row);
  }
  return grid;
}