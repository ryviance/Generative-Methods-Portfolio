// sketch.js - merged animation and generative terrain
// Author: Eion Ling
// Date: 4/13/2025

// Constants
const VALUE1 = 1;
const VALUE2 = 2;

const grassColor = "#74740d";
const skyColor = "#69ade4";
const stoneColor = "#858290";
const treeColor = "#33330b";

// Globals
let myInstance;
let canvasContainer;
let centerHorz, centerVert;
let seed = 239;

class MyClass {
  constructor(param1, param2) {
    this.property1 = param1;
    this.property2 = param2;
  }

  myMethod() {
    // Add logic if needed
  }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2;
  centerVert = canvasContainer.height() / 2;
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

function setup() {
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();

  createButton("Reimagine").mousePressed(() => {
    seed++;
  });
}

function draw() {
  randomSeed(seed);

  // Background & Landscape
  noStroke();
  fill(skyColor);
  rect(0, 0, width, height / 2);

  fill(grassColor);
  rect(0, height / 2, width, height / 2);

  fill(stoneColor);
  beginShape();
  vertex(0, height / 2);
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    let x = (width * i) / steps;
    let y = height / 2 - (random() * random() * random() * height) / 4 - height / 50;
    vertex(x, y);
  }
  vertex(width, height / 2);
  endShape(CLOSE);

  fill(treeColor);
  const trees = 20 * random();
  const scrub = mouseX / width;
  for (let i = 0; i < trees; i++) {
    let z = random();
    let x = width * ((random() + (scrub / 50 + millis() / 500000.0) / z) % 1);
    let s = width / 50 / z;
    let y = height / 2 + height / 20 / z;
    triangle(x, y - s, x - s / 4, y, x + s / 4, y);
  }

  // Rotating square overlay
  myInstance.myMethod();
  push();
  translate(centerHorz, centerVert);
  rotate(frameCount / 100.0);
  fill(234, 31, 81);
  noStroke();
  rect(-125, -125, 250, 250);
  pop();

  // Static text
  fill(255);
  textStyle(BOLD);
  textSize(140);
  text("p5*", centerHorz - 105, centerVert + 40);
}

function mousePressed() {
  // Add interaction if needed
}