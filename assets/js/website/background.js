let bgColours;
let blobs = [];

function setup(){
    let canvasWidth = max(windowWidth, 1200);
    let canvasHeight = max(windowHeight, 800);

    let cnv = createCanvas(canvasWidth, canvasHeight);
    cnv.position(0,0);
    cnv.style('z-index', '-1');
    cnv.style('position', 'fixed');
    cnv.id("background");

    // background stuff
    bgColours = [
        color(128, 15, 60),  // deep purple
        color(50, 5, 25)    // dark blue
    ];

    for (let i = 0; i < 15; i++) {
        blobs.push({
        x: random(width),
        y: random(height),
        baseR: random(100, 250),          // used for pulsing radius
        speed: random(0.0001, 0.0010),    // used for motion
        pulseSpeed: random(0.005, 0.001), // used for pulsing animation
        offset: random(TWO_PI)
    });
  }
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    drawGradientBackground();

    blendMode(SOFT_LIGHT);
    for (let b of blobs) {
      let t = millis() * b.speed + b.offset;
      let pulse = sin(millis() * b.pulseSpeed + b.offset) * 20;
  
      let x = b.x + sin(t) * 30;
      let y = b.y + cos(t * 1.1) * 30;
      let r = b.baseR + pulse;
  
      drawGlowingBlob(x, y, r);
    }
    blendMode(BLEND);
}

function drawGlowingBlob(x, y, r) {
    let layers = 4;
    let c = lerpColor(bgColours[0], bgColours[1], 0.5);
  
    for (let i = layers; i >= 1; i--) {
      let radius = r * (i / layers);
      let alpha = 15 * i;
  
      // Optional: fade out edges near canvas border
      let d = dist(x, y, width / 2, height / 2);
      let edgeFade = map(d, 0, width * 0.75, 1, 0);
      edgeFade = constrain(edgeFade, 0, 1);
      fill(red(c), green(c), blue(c), alpha * edgeFade);
  
      ellipse(x, y, radius);
    }
}
  
function drawGradientBackground() {
    noStroke();
    
    let t = millis() * 0.0005; // slow time
    let colorShift = sin(t) * 0.5 + 0.5; // 0 to 1 range
  
    let topColour = lerpColor(bgColours[0], bgColours[1], colorShift);
    let bottomColour = lerpColor(bgColours[1], bgColours[0], colorShift);
  
    for (let y = 0; y < height; y++) {
      let inter = map(y, 0, height, 0, 1);
      let c = lerpColor(topColour, bottomColour, inter);
      fill(c);
      rect(0, y, width, 1);
    }
  }
