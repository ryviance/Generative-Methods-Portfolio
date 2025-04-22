new p5((p) => {
  let seed = 0;
  let tilesetImage;
  let currentGrid = [];
  let gridSize = 32; // fixed square size

  p.preload = () => {
    tilesetImage = p.loadImage(
      "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
    );
  };

  function reseed() {
    seed = (seed | 0) + 1109;
    p.randomSeed(seed);
    p.noiseSeed(seed);
    console.log("New seed:", seed);
    p.select("#seedReport").html("seed " + seed);
    regenerateGrid();
  }

  function regenerateGrid() {
    p.select("#asciiBox").value(gridToString(generateGrid(gridSize, gridSize)));
    reparseGrid();
  }

  function reparseGrid() {
    currentGrid = stringToGrid(p.select("#asciiBox").value());
  }

  function gridToString(grid) {
    return grid.map(row => row.join("")).join("\n");
  }

  function stringToGrid(str) {
    return str.split("\n").map(line => line.split(""));
  }

  p.setup = () => {
    console.log("Setup triggered");

    const asciiBox = p.select("#asciiBox");
    const reseedBtn = p.select("#reseedButton");

    if (!asciiBox || !reseedBtn) {
      console.error("Missing required elements in DOM");
      return;
    }

    p.createCanvas(16 * gridSize, 16 * gridSize).parent("canvasContainer");
    p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

    asciiBox.attribute("rows", gridSize);
    asciiBox.attribute("cols", gridSize);

    reseedBtn.mousePressed(reseed);
    asciiBox.input(reparseGrid);

    reseed();
  };

  p.draw = () => {
    p.randomSeed(seed);
    drawGrid(currentGrid);
  };

  function drawGrid(grid) {
    p.background(128);
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] === '_') {
          placeTile(i, j, p.floor(p.random(4)), 0);
        }
      }
    }
  }

  function placeTile(i, j, ti, tj) {
    p.image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
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
});