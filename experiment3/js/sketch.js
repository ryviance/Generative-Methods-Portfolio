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

  new p5((p) => {
    let seed2 = 0;
    let tilesetImage2;
    let dungeonGrid = [];
    const gridSize = 32;
  
    p.preload = () => {
      tilesetImage2 = p.loadImage(
        "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
      );
    };
  
    function reseedDungeon() {
      seed2 = (seed2 | 0) + 2187;
      p.randomSeed(seed2);
      p.noiseSeed(seed2);
      p.select("#seedReport2").html("seed " + seed2);
      dungeonGrid = generateDungeonGrid(gridSize, gridSize);
      p.select("#asciiBox2").value(gridToString(dungeonGrid));
    }
  
    function gridToString(grid) {
      return grid.map(row => row.join("")).join("\n");
    }
  
    function generateDungeonGrid(cols, rows) {
      // initialize grid as all walls
      let grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "#")
      );
    
      const rooms = [];
      const roomCount = 6;
      const minSize = 4, maxSize = 8;
    
      function createRoom(x, y, w, h) {
        for (let i = y; i < y + h; i++) {
          for (let j = x; j < x + w; j++) {
            if (i >= 0 && i < rows && j >= 0 && j < cols) {
              grid[i][j] = ".";
            }
          }
        }
      }
    
      for (let i = 0; i < roomCount; i++) {
        const w = p.floor(p.random(minSize, maxSize));
        const h = p.floor(p.random(minSize, maxSize));
        const x = p.floor(p.random(1, cols - w - 1));
        const y = p.floor(p.random(1, rows - h - 1));
        const newRoom = { x, y, w, h, cx: x + p.floor(w / 2), cy: y + p.floor(h / 2) };
    
        let overlaps = rooms.some(r =>
          x < r.x + r.w &&
          x + w > r.x &&
          y < r.y + r.h &&
          y + h > r.y
        );
    
        if (!overlaps) {
          createRoom(x, y, w, h);
    
          if (rooms.length > 0) {
            const prev = rooms[rooms.length - 1];
    
            // connect center to previous center
            if (p.random() < 0.5) {
              carveH(prev.cx, newRoom.cx, prev.cy);
              carveV(prev.cy, newRoom.cy, newRoom.cx);
            } else {
              carveV(prev.cy, newRoom.cy, prev.cx);
              carveH(prev.cx, newRoom.cx, newRoom.cy);
            }
          }
    
          rooms.push(newRoom);
        }
      }
    
      function carveH(x1, x2, y) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          if (y >= 0 && y < rows && x >= 0 && x < cols)
            grid[y][x] = ".";
        }
      }
    
      function carveV(y1, y2, x) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          if (y >= 0 && y < rows && x >= 0 && x < cols)
            grid[y][x] = ".";
        }
      }
    
      return grid;
    }    
  
    function drawDungeon(grid) {
      p.background(0);
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          const char = grid[i][j];
          let ti = 0, tj = 0;
          if (char === ".") [ti, tj] = [20, 23];      // dungeon floor tile in tileset
          else if (char === "#") [ti, tj] = [21, 21]; // dungeon wall tile in tileset
          p.image(tilesetImage2, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
        }
      }
    }    
  
    p.setup = () => {
      p.createCanvas(16 * gridSize, 16 * gridSize).parent("canvasContainer2");
      p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
  
      p.select("#reseedButton2").mousePressed(reseedDungeon);
      reseedDungeon();
    };
  
    p.draw = () => {
      drawDungeon(dungeonGrid);
    };
  });  
});