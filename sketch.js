Đã dùng 89% bộ nhớ … Nếu hết dung lượng lưu trữ, bạn sẽ không thể tạo, chỉnh sửa và tải tệp lên. Tiết kiệm 50% khi mua các gói hằng năm cho 1 năm với ưu đãi đặc biệt dịp Năm mới.
let centerX, centerY;
let coreRadius = 60;

let rayCount = 28;
let rays = [];
let rotationAngle = 0;

let ripples = [];
let rippleDelay = 20;

let trash = [];
let innerLines = [];

let clickSound;
let bgSound;
let whaleSound;
let deepOceanSound;
let wavesSound;
let dolphinSound;


let sandySound;


let dropFinalSound;
let lastDropFinalTime = 0;
let dropFinalInterval = 5000; 

let soundButtonSfx;

let lastWhaleTime = 0;
let lastWaveTime = 0;
let lastDolphinTime = 0;


let isMuted = false;        // sound state
const btnSize = 40;         // button size
const btnY = 20;            // top margin
const btnSoundX = 20;       



//  HIDDEN TRASH + MAGNET

let hiddenTrash = [];
let lensRadius = 120;
let lensStroke = 2.5;
let hiddenTrashPerDrop = 30;

// magnet params
let magnetStrength = 0.035;
let magnetDamping  = 0.94;
let magnetSnapDist = 8;
let maxMagnetVel   = 2.0;
let attachedLerp   = 0.12;


//  LINE HEAT (white -> red -> white)

let lineHeat = 0;
let targetLineHeat = 0;
let heatStep = 0.12;
let heatLerp = 0.08;


// PRELOAD

function preload() {
  clickSound     = loadSound("Droptrashfinal.wav");
  bgSound        = loadSound("PianoEdited.wav");
  whaleSound     = loadSound("Whaledone.wav");
  deepOceanSound = loadSound("DeepOceanDone.wav");
  wavesSound     = loadSound("WavesEdited.wav");
  dolphinSound   = loadSound("Dolphindone.wav");

  sandySound     = loadSound("SandyFinal.wav");

  dropFinalSound = loadSound("DropFinal.wav");
  soundButtonSfx = loadSound("SoundButtonFinal.wav");
}


// SETUP

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvas-section');

  centerX = width / 2;
  centerY = height / 2;

  buildRays();
  buildInnerLines();

  for (let i = 0; i < 3; i++) {
    ripples.push({ radius: 0, alpha: 180 });
  }

  addHiddenTrash(60);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = width / 2;
  centerY = height / 2;
}

// Press R to reset
function keyPressed() {
  if (key === 'r' || key === 'R') resetTrash();
}

function resetTrash() {
  hiddenTrash = [];
  trash = [];

  ripples = [];
  for (let i = 0; i < 3; i++) ripples.push({ radius: 0, alpha: 180 });

  lastDropFinalTime = millis();

  targetLineHeat = 0;
  lineHeat = 0;

  addHiddenTrash(60);
}

// DRAW
function draw() {
  background(0, 70);

  // NEW UI
  drawUI();

  // smooth heat
  lineHeat = lerp(lineHeat, targetLineHeat, heatLerp);

  translate(centerX, centerY);

  drawRays();
  drawCoreCircle();

  push();
  rotate(rotationAngle);
  drawInnerLines();
  pop();

  drawRedCenter();
  updateRipples();
  updateTrash();

  // lens + magnet
  drawTrashLensMagnet();

  // hold sound
  updateSandyHoldSound();

  // DropFinal every 5s
  updateDropFinalEvery5s();

  // whale
  if (!isMuted && whaleSound && whaleSound.isLoaded()) {
    if (millis() - lastWhaleTime > 3000) {
      whaleSound.setVolume(0.05);
      whaleSound.play();
      lastWhaleTime = millis();
    }
  }

  // waves
  if (!isMuted && wavesSound && wavesSound.isLoaded()) {
    if (millis() - lastWaveTime > 2000) {
      wavesSound.setVolume(0.06);
      wavesSound.play();
      lastWaveTime = millis();
    }
  }

  // dolphin
  if (!isMuted && dolphinSound && dolphinSound.isLoaded()) {
    if (millis() - lastDolphinTime > 4000) {
      dolphinSound.setVolume(0.04);
      dolphinSound.play();
      lastDolphinTime = millis();
    }
  }
}


// UI HELPERS (NEW)

function isOverSoundButton() {
  return (
    mouseX > btnSoundX &&
    mouseX < btnSoundX + btnSize &&
    mouseY > btnY &&
    mouseY < btnY + btnSize
  );
}

// This replaces your old sound button drawing
function drawUI() {
  push();
  noStroke();

  let isHoverSound = isOverSoundButton();

  // Button background
  fill(isHoverSound ? 80 : 40, 200);
  rect(btnSoundX, btnY, btnSize, btnSize, 8);

  // Icon
  fill(255);

  if (isMuted) {
    textAlign(CENTER, CENTER);
    textSize(10);
    textStyle(NORMAL);
    text("MUTE", btnSoundX + btnSize / 2, btnY + btnSize / 2);

    stroke(255, 0, 0);
    strokeWeight(2);
    line(btnSoundX + 5, btnY + 5, btnSoundX + btnSize - 5, btnY + btnSize - 5);
  } else {
    // Speaker shape
    noStroke();
    beginShape();
    vertex(btnSoundX + 10, btnY + 14);
    vertex(btnSoundX + 18, btnY + 14);
    vertex(btnSoundX + 24, btnY + 10);
    vertex(btnSoundX + 24, btnY + 30);
    vertex(btnSoundX + 18, btnY + 26);
    vertex(btnSoundX + 10, btnY + 26);
    endShape(CLOSE);

    // Sound waves
    noFill();
    stroke(255);
    strokeWeight(2);
    arc(btnSoundX + 24, btnY + 20, 14, 14, -0.7, 0.7);
    arc(btnSoundX + 24, btnY + 20, 22, 22, -0.7, 0.7);
  }

  pop();
}

// keep your original SFX behavior + master mute
function toggleSound() {
  if (typeof userStartAudio === "function") userStartAudio();

  const wasMuted = isMuted;

  // play SFX every click
  if (soundButtonSfx && soundButtonSfx.isLoaded()) {
    // if muted, temporarily unmute so SFX can be heard
    if (wasMuted && typeof masterVolume === "function") masterVolume(1);

    soundButtonSfx.setVolume(0.25);
    soundButtonSfx.stop();
    soundButtonSfx.play();
  }

  // flip state
  isMuted = !isMuted;

  if (isMuted) {
    stopAllSoundsExceptButtonSfx();

    // mute after SFX finishes
    let ms = 180;
    if (soundButtonSfx && soundButtonSfx.isLoaded()) {
      ms = Math.min(Math.max(soundButtonSfx.duration() * 1000, 120), 2000);
    }
    setTimeout(() => {
      if (isMuted && typeof masterVolume === "function") masterVolume(0);
    }, ms);
  } else {
    if (typeof masterVolume === "function") masterVolume(1);
  }
}

function stopAllSoundsExceptButtonSfx() {
  if (clickSound) clickSound.stop();
  if (bgSound) bgSound.stop();
  if (whaleSound) whaleSound.stop();
  if (deepOceanSound) deepOceanSound.stop();
  if (wavesSound) wavesSound.stop();
  if (dolphinSound) dolphinSound.stop();
  if (sandySound) sandySound.stop();
  if (dropFinalSound) dropFinalSound.stop();
}


// Line stroke color helper

function setLineStroke(alpha = 255) {
  const c = lerpColor(color(255), color(220, 30, 40), lineHeat);
  c.setAlpha(alpha);
  stroke(c);
}


// DropFinal every 5s

function updateDropFinalEvery5s() {
  if (isMuted) return;
  if (!dropFinalSound || !dropFinalSound.isLoaded()) return;

  const now = millis();
  if (now - lastDropFinalTime >= dropFinalInterval) {
    dropFinalSound.setVolume(0.10);
    if (dropFinalSound.isPlaying()) dropFinalSound.stop();
    dropFinalSound.play();
    lastDropFinalTime = now;
  }
}


// HOLD SOUND (SandyFinal) while holding mouse

function isHoldingLensActive() {
  if (!mouseIsPressed) return false;
  if (isOverSoundButton()) return false;
  return true;
}

function updateSandyHoldSound() {
  if (isMuted) {
    if (sandySound && sandySound.isPlaying()) sandySound.stop();
    return;
  }
  if (!sandySound || !sandySound.isLoaded()) return;

  const holding = isHoldingLensActive();
  if (holding) {
    if (!sandySound.isPlaying()) {
      sandySound.setVolume(0.08);
      sandySound.loop();
    }
  } else {
    if (sandySound.isPlaying()) sandySound.stop();
  }
}

// HIDDEN TRASH (spawn)

function addHiddenTrash(n) {
  for (let i = 0; i < n; i++) {
    let x = random(-width / 2 + 40, width / 2 - 40);
    let y = random(-height / 2 + 40, height / 2 - 40);

    // avoid center
    if (x * x + y * y < (coreRadius * 2.0) * (coreRadius * 2.0)) {
      i--;
      continue;
    }

    hiddenTrash.push({
      x, y,
      r: random(6, 16),
      a: random(90, 200),
      vx: 0,
      vy: 0,
      attached: false
    });
  }
}


// MAGNET LENS

function drawTrashLensMagnet() {
  if (!mouseIsPressed) return;
  if (isOverSoundButton()) return;

  const lx = mouseX - centerX;
  const ly = mouseY - centerY;

  noStroke();
  for (let p of hiddenTrash) {
    let d = dist(p.x, p.y, lx, ly);

    if (d <= lensRadius) {
      let mag = map(d, 0, lensRadius, 1.35, 0.9, true);

      if (!p.attached) {
        let fx = (lx - p.x) * magnetStrength;
        let fy = (ly - p.y) * magnetStrength;

        p.vx = (p.vx + fx) * magnetDamping;
        p.vy = (p.vy + fy) * magnetDamping;

        p.vx = constrain(p.vx, -maxMagnetVel, maxMagnetVel);
        p.vy = constrain(p.vy, -maxMagnetVel, maxMagnetVel);

        p.x += p.vx;
        p.y += p.vy;

        if (d < magnetSnapDist) {
          p.attached = true;
        }
      } else {
        p.x = lerp(p.x, lx, attachedLerp);
        p.y = lerp(p.y, ly, attachedLerp);
      }

      fill(220, 30, 40, p.a);
      ellipse(p.x, p.y, p.r * mag);

      if (p.attached) {
        noFill();
        stroke(255, 140);
        strokeWeight(1.5);
        ellipse(p.x, p.y, p.r * mag + 10);
        noStroke();
      }
    }
  }

  // lens ring
  noFill();
  stroke(255, 230);
  strokeWeight(lensStroke);
  ellipse(lx, ly, lensRadius * 2);

  stroke(255, 70);
  strokeWeight(lensStroke + 3);
  ellipse(lx, ly, lensRadius * 2);
}

// RELEASE = collect all attached trash + fade lines back
function mouseReleased() {
  if (isOverSoundButton()) return;

  let collected = 0;
  for (let i = hiddenTrash.length - 1; i >= 0; i--) {
    if (hiddenTrash[i].attached) {
      hiddenTrash.splice(i, 1);
      collected++;
    }
  }

  if (collected > 0) {
    const heatPerTrash = heatStep / hiddenTrashPerDrop;
    targetLineHeat = max(0, targetLineHeat - collected * heatPerTrash);
  }

  if (hiddenTrash.length === 0) {
    targetLineHeat = 0;
    lineHeat = 0;
  }
}


// RAYS / CORE / INNER

function buildRays() {
  let shortLen = 150;
  let longLen = 330;
  for (let i = 0; i < rayCount; i++) {
    rays.push(i % 2 === 0 ? shortLen : longLen);
  }
}

function drawRays() {
  setLineStroke(255);
  strokeWeight(1.5);
  noFill();

  let gap = 55;
  let innerR = coreRadius + gap;

  for (let i = 0; i < rayCount; i++) {
    let angle = TWO_PI * (i / rayCount) + rotationAngle;
    let r2 = innerR + rays[i];
    line(
      cos(angle) * innerR,
      sin(angle) * innerR,
      cos(angle) * r2,
      sin(angle) * r2
    );
  }

  rotationAngle += 0.004;
}

function drawCoreCircle() {
  noFill();
  setLineStroke(255);
  strokeWeight(4);
  ellipse(0, 0, coreRadius * 2.5);
}

function buildInnerLines() {
  innerLines = [];
  let count = 8;
  let startR = coreRadius * 1.25;

  for (let i = 0; i < count; i++) {
    let angle = TWO_PI * (i / count);
    innerLines.push({
      x1: cos(angle) * startR,
      y1: sin(angle) * startR,
      x2: 0,
      y2: 0
    });
  }
}

function drawInnerLines() {
  setLineStroke(255);
  strokeWeight(2);
  for (let L of innerLines) {
    line(L.x1, L.y1, L.x2, L.y2);
  }
}

function drawRedCenter() {
  noStroke();
  fill(220, 30, 40);
  ellipse(0, 0, coreRadius * 0.3);
}


// RIPPLE WAVES

function updateRipples() {
  if (frameCount % rippleDelay === 0) {
    ripples.push({ radius: 0, alpha: 180 });

    if (!isMuted && deepOceanSound && deepOceanSound.isLoaded()) {
      deepOceanSound.setVolume(0.01);
      deepOceanSound.play();
    }
  }

  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    r.radius += 5;
    r.alpha -= 2;

    noFill();
    stroke(220, 30, 40, r.alpha);
    strokeWeight(4);
    ellipse(0, 0, r.radius * 2);

    if (r.alpha <= 0) ripples.splice(i, 1);
  }
}

// TRASH (visible burst)

class Trash {
  constructor(angle) {
    this.x = 0;
    this.y = 0;
    this.angle = angle;
    this.speed = 3 + random(1, 3);
    this.size = random(18, 32);
    this.alpha = 255;
  }

  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
    this.alpha -= 4;
  }

  draw() {
    noFill();
    stroke(220, 30, 40, this.alpha);
    strokeWeight(2);
    ellipse(this.x, this.y, this.size);
  }

  isGone() {
    return (
      this.alpha <= 0 ||
      this.x < -width / 2 || this.x > width / 2 ||
      this.y < -height / 2 || this.y > height / 2
    );
  }
}

function updateTrash() {
  for (let i = trash.length - 1; i >= 0; i--) {
    trash[i].update();
    trash[i].draw();
    if (trash[i].isGone()) trash.splice(i, 1);
  }
}

// ==============================
// CLICK
// ==============================
function mousePressed() {
  // click sound button -> toggle
  if (isOverSoundButton()) {
    toggleSound();
    return;
  }

  if (typeof userStartAudio === "function") userStartAudio();

  // bg music
  if (!isMuted && bgSound && bgSound.isLoaded() && !bgSound.isPlaying()) {
    bgSound.setVolume(0.10);
    bgSound.loop();
  }

  let dx = mouseX - centerX;
  let dy = mouseY - centerY;

  if (dx * dx + dy * dy <= coreRadius * coreRadius) {
    if (!isMuted && clickSound && clickSound.isLoaded()) {
      clickSound.setVolume(0.2);
      clickSound.stop();
      clickSound.play();
    }
    spawnTrash();
  }
}

// SPAWN TRASH
function spawnTrash() {
  trash = [];
  for (let i = 0; i < 14; i++) {
    trash.push(new Trash((TWO_PI / 14) * i));
  }

  addHiddenTrash(hiddenTrashPerDrop);

  targetLineHeat = constrain(targetLineHeat + heatStep, 0, 1);
}
