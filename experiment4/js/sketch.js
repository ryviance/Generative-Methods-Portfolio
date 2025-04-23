// === Global Configuration and State ===
let tileSize = 50;                // Size of each tile in pixels
let cameraX = 0, cameraY = 0;     // Camera offset in the world (top-left corner in pixels)
let seed = Math.floor(Math.random() * 100000);  // Random initial seed (you can set a fixed value if desired)
let toggledTiles = {};            // Dictionary to keep track of toggled tiles (by "x,y" coordinate keys)

// === p5.js Setup Function ===
function setup() {
  // Create canvas to match the portfolio container size (or full window if no container)
  const containerId = 'canvas-container';  // TODO: set this to the actual container ID in the HTML
  let containerElement = document.getElementById(containerId);
  let canvasWidth = windowWidth;
  let canvasHeight = windowHeight;
  if (containerElement) {
    canvasWidth = containerElement.clientWidth || windowWidth;
    canvasHeight = containerElement.clientHeight || windowHeight;
  }
  let canvas = createCanvas(canvasWidth, canvasHeight);
  if (containerElement) {
    canvas.parent(containerElement);  // Attach canvas to the container in the DOM
  }

  // Set initial drawing settings
  noSmooth();               // disable smoothing (optional, for crisp pixel edges if using pixel art)
  noiseSeed(seed);
  randomSeed(seed);

  // Create seed input UI
  let seedInput = createInput(String(seed), 'number');  // input as type="number"
  seedInput.position(10, 10);  // position it at top-left of the canvas (adjust as needed or style via CSS)
  seedInput.style('width', '100px');
  seedInput.attribute('title', 'Enter a numerical seed and press Enter');  // tooltip for clarity
  // When user changes the seed and presses enter or leaves the field
  seedInput.changed(() => {
    let newSeed = parseInt(seedInput.value());
    if (!isNaN(newSeed)) {
      seed = newSeed;
    }
    // Re-seed the noise and random generators with the new seed
    noiseSeed(seed);
    randomSeed(seed);
    // Clear toggled tiles (they no longer apply to the new terrain)
    toggledTiles = {};
    // Redraw immediately (optional, as draw() loops continuously anyway)
    redraw();
  });
}

// Handles window resizing to keep canvas full size in container
function windowResized() {
  const containerId = 'canvas-container';  // same container ID as above
  let containerElement = document.getElementById(containerId);
  let newWidth = windowWidth;
  let newHeight = windowHeight;
  if (containerElement) {
    newWidth = containerElement.clientWidth || windowWidth;
    newHeight = containerElement.clientHeight || windowHeight;
  }
  resizeCanvas(newWidth, newHeight);
}

// === p5.js Draw Loop ===
function draw() {
  background(220);    // Clear background (light gray)

  // Render the procedural tile map for the current camera position
  drawTiles();

  // Highlight the tile under the mouse cursor
  highlightHoveredTile();
}

// Draw all tiles visible in the canvas
function drawTiles() {
  // Calculate which tiles are visible based on camera offset and canvas size
  let startCol = Math.floor(cameraX / tileSize);
  let startRow = Math.floor(cameraY / tileSize);
  // If camera offset is negative, adjust starting indices so we cover that area as well
  // (Math.floor works for negative too, e.g., -1.2 -> -2, which is correct for tile index)
  let endCol = startCol + Math.ceil(width / tileSize) + 1;
  let endRow = startRow + Math.ceil(height / tileSize) + 1;

  // Loop through each visible tile coordinate
  for (let tileY = startRow; tileY < endRow; tileY++) {
    for (let tileX = startCol; tileX < endCol; tileX++) {
      // Determine tile color based on Perlin noise at this tile coordinate
      // Sample noise at a low frequency (scaled by 0.1) for smooth variation
      let noiseValue = noise(tileX * 0.1, tileY * 0.1);
      let tileColor;
      if (noiseValue < 0.3) {
        // Water (deep blue)
        tileColor = color(0, 105, 170);
      } else if (noiseValue < 0.6) {
        // Grass land (green)
        tileColor = color(85, 160, 75);
      } else {
        // Mountain land (brown)
        tileColor = color(145, 123, 76);
      }

      // If this tile has been toggled by the user, override the color for visual feedback
      let coordKey = tileX + ',' + tileY;
      if (toggledTiles[coordKey]) {
        // For toggled tiles, use a distinct highlight color (e.g., red)
        tileColor = color(200, 50, 50);
      }

      // Draw the tile
      fill(tileColor);
      stroke(100);          // grid line color (gray)
      strokeWeight(1);      // thin grid lines
      // Calculate pixel position of this tile relative to the top-left of the canvas
      let screenX = (tileX * tileSize) - cameraX;
      let screenY = (tileY * tileSize) - cameraY;
      rect(screenX, screenY, tileSize, tileSize);
    }
  }
}

// Highlight the tile currently hovered by the mouse (visual outline)
function highlightHoveredTile() {
  // Determine which tile index the mouse is over
  let hoverTileX = Math.floor((cameraX + mouseX) / tileSize);
  let hoverTileY = Math.floor((cameraY + mouseY) / tileSize);
  // Calculate the screen position of that tile
  let screenX = hoverTileX * tileSize - cameraX;
  let screenY = hoverTileY * tileSize - cameraY;
  // Draw a semi-transparent outline around the tile
  push();
  noFill();
  stroke(255, 255, 0, 200);  // yellow outline, slightly transparent
  strokeWeight(3);
  rect(screenX, screenY, tileSize, tileSize);
  pop();
}

// === Input Handling ===

// Arrow keys to move the camera (scroll the world)
function keyPressed() {
  const moveDistance = tileSize;  // move one tile per key press (discrete movement)
  if (keyCode === LEFT_ARROW) {
    cameraX -= moveDistance;
  } else if (keyCode === RIGHT_ARROW) {
    cameraX += moveDistance;
  } else if (keyCode === UP_ARROW) {
    cameraY -= moveDistance;
  } else if (keyCode === DOWN_ARROW) {
    cameraY += moveDistance;
  }
  // Constrain camera to not go negative if you want bounded world; 
  // for unbounded world, we allow negative cameraX/cameraY (no constraint).
  // e.g., if bounded to 0 minimum:
  // cameraX = max(cameraX, 0);
  // cameraY = max(cameraY, 0);
}

// Mouse click to toggle a tile's state
function mousePressed() {
  // Only toggle if mouse is inside the canvas area
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;  // ignore clicks outside the canvas
  }
  // Identify the tile that was clicked
  let clickedTileX = Math.floor((cameraX + mouseX) / tileSize);
  let clickedTileY = Math.floor((cameraY + mouseY) / tileSize);
  let coordKey = clickedTileX + ',' + clickedTileY;
  // Toggle the tile's state
  if (toggledTiles[coordKey]) {
    // If already toggled, untoggle it (remove from the dictionary)
    delete toggledTiles[coordKey];
  } else {
    // If not toggled, add it
    toggledTiles[coordKey] = true;
  }
}