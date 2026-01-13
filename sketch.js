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

// ✅ hold-scan sound
let sandySound;

// ✅ DropFinal every 5s
let dropFinalSound;
let lastDropFinalTime = 0;
let dropFinalInterval = 5000; // 5s

// ✅ NEW: sound button click SFX
let soundButtonSfx;

let lastWhaleTime = 0;
let lastWaveTime = 0;
let lastDolphinTime = 0;

// ==============================
// ✅ SOUND TOGGLE (drawn icon)
// ==============================
let soundEnabled = true;
// vùng click icon sound (góc trái)
let soundBtn = { x: 16, y: 16, w: 44, h: 44 };

// ==============================
// ✅ "KÍNH SOI RÁC" (hidden trash)
// ==============================
let hiddenTrash = [];
let lensRadius = 120;
let lensStroke = 2.5;
let hiddenTrashPerDrop = 30;

function preload() {
  clickSound     = loadSound("Droptrashfinal.wav");
  bgSound        = loadSound("PianoEdited.wav");
  whaleSound     = loadSound("Whaledone.wav");
  deepOceanSound = loadSound("DeepOceanDone.wav");
  wavesSound     = loadSound("WavesEdited.wav");
  dolphinSound   = loadSound("Dolphindone.wav");

  sandySound     = loadSound("SandyFinal.wav");

  dropFinalSound = loadSound("DropFinal.wav"); // chạy mỗi 5s

  // ✅ NEW: SFX khi bấm nút loa
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = width / 2;
  centerY = height / 2;
}

// ✅ Press R to reset trash count
function keyPressed() {
  if (key === 'r' || key === 'R') resetTrash();
}

function resetTrash() {
  hiddenTrash = [];
  trash = [];

  ripples = [];
  for (let i = 0; i < 3; i++) ripples.push({ radius: 0, alpha: 180 });

  // reset timer để 5s sau mới phát lại
  lastDropFinalTime = millis();
}

// DRAW
function draw() {
  background(0, 70);

  // icon sound
  drawSoundButton();

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

  drawTrashLens();

  // hold sound
  updateSandyHoldSound();

  // DropFinal play every 5s
  updateDropFinalEvery5s();

  // whale
  if (soundEnabled && whaleSound && whaleSound.isLoaded()) {
    if (millis() - lastWhaleTime > 3000) {
      whaleSound.setVolume(0.05);
      whaleSound.play();
      lastWhaleTime = millis();
    }
  }

  // waves
  if (soundEnabled && wavesSound && wavesSound.isLoaded()) {
    if (millis() - lastWaveTime > 2000) {
      wavesSound.setVolume(0.06);
      wavesSound.play();
      lastWaveTime = millis();
    }
  }

  // dolphin
  if (soundEnabled && dolphinSound && dolphinSound.isLoaded()) {
    if (millis() - lastDolphinTime > 4000) {
      dolphinSound.setVolume(0.04);
      dolphinSound.play();
      lastDolphinTime = millis();
    }
  }
}

// ==============================
// ✅ DropFinal every 5s
// ==============================
function updateDropFinalEvery5s() {
  if (!soundEnabled) return;
  if (!dropFinalSound || !dropFinalSound.isLoaded()) return;

  const now = millis();
  if (now - lastDropFinalTime >= dropFinalInterval) {
    dropFinalSound.setVolume(0.10);
    if (dropFinalSound.isPlaying()) dropFinalSound.stop();
    dropFinalSound.play();
    lastDropFinalTime = now;
  }
}

// ==============================
// ✅ HOLD SOUND (SandyFinal) while holding mouse
// ==============================
function isHoldingLensActive() {
  if (!mouseIsPressed) return false;

  // không tính khi đang giữ trên icon sound
  if (
    mouseX >= soundBtn.x && mouseX <= soundBtn.x + soundBtn.w &&
    mouseY >= soundBtn.y && mouseY <= soundBtn.y + soundBtn.h
  ) return false;

  return true;
}

function updateSandyHoldSound() {
  if (!soundEnabled) {
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

// ==============================
// ✅ SOUND ICON (drawn)
// ==============================
function drawSoundButton() {
  const { x, y, w, h } = soundBtn;
  const hovering =
    mouseX >= x && mouseX <= x + w &&
    mouseY >= y && mouseY <= y + h;

  push();
  noStroke();
  fill(0, hovering ? 120 : 90);
  rect(x, y, w, h, 10);

  const alpha = soundEnabled ? 255 : 140;
  stroke(255, alpha);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  strokeWeight(3);
  noFill();
  beginShape();
  vertex(x + 14, y + 18);
  vertex(x + 20, y + 18);
  vertex(x + 28, y + 12);
  vertex(x + 28, y + 32);
  vertex(x + 20, y + 26);
  vertex(x + 14, y + 26);
  endShape(CLOSE);

  if (soundEnabled) {
    strokeWeight(2.5);
    arc(x + 28, y + 22, 16, 16, -0.7, 0.7);
    arc(x + 28, y + 22, 24, 24, -0.7, 0.7);
    arc(x + 28, y + 22, 32, 32, -0.7, 0.7);
  } else {
    strokeWeight(3);
    line(x + 12, y + 32, x + 34, y + 12);
  }

  pop();
}

// ✅ NEW: toggle + play SFX every click
function toggleSound() {
  if (typeof userStartAudio === "function") userStartAudio();

  const wasEnabled = soundEnabled;

  // phát SFX mỗi lần bấm
  if (soundButtonSfx && soundButtonSfx.isLoaded()) {
    // nếu đang OFF thì unmute tạm để nghe SFX
    if (!wasEnabled && typeof masterVolume === "function") masterVolume(1);

    soundButtonSfx.setVolume(0.25);
    soundButtonSfx.stop();
    soundButtonSfx.play();
  }

  // toggle state
  soundEnabled = !soundEnabled;

  if (!soundEnabled) {
    // stop hết các sound khác để "tắt toàn bộ"
    stopAllSoundsExceptButtonSfx();

    // mute sau 1 chút để SFX kịp kêu
    let ms = 180;
    if (soundButtonSfx && soundButtonSfx.isLoaded()) {
      ms = Math.min(Math.max(soundButtonSfx.duration() * 1000, 120), 2000);
    }
    setTimeout(() => {
      if (!soundEnabled && typeof masterVolume === "function") masterVolume(0);
    }, ms);
  } else {
    // bật lại
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

function stopAllSounds() {
  stopAllSoundsExceptButtonSfx();
  if (soundButtonSfx) soundButtonSfx.stop();
}

// ==============================
// KÍNH SOI RÁC
// ==============================
function addHiddenTrash(n) {
  for (let i = 0; i < n; i++) {
    let x = random(-width / 2 + 40, width / 2 - 40);
    let y = random(-height / 2 + 40, height / 2 - 40);

    if (x * x + y * y < (coreRadius * 2.0) * (coreRadius * 2.0)) {
      i--;
      continue;
    }

    hiddenTrash.push({
      x, y,
      r: random(6, 16),
      a: random(90, 200)
    });
  }
}

function drawTrashLens() {
  if (!mouseIsPressed) return;

  // tránh hiện kính khi đang bấm icon sound
  if (
    mouseX >= soundBtn.x && mouseX <= soundBtn.x + soundBtn.w &&
    mouseY >= soundBtn.y && mouseY <= soundBtn.y + soundBtn.h
  ) return;

  const lx = mouseX - centerX;
  const ly = mouseY - centerY;

  noStroke();
  for (let p of hiddenTrash) {
    let d = dist(p.x, p.y, lx, ly);
    if (d <= lensRadius) {
      let mag = map(d, 0, lensRadius, 1.35, 0.9, true);
      fill(220, 30, 40, p.a);
      ellipse(p.x, p.y, p.r * mag);
    }
  }

  noFill();
  stroke(255, 230);
  strokeWeight(lensStroke);
  ellipse(lx, ly, lensRadius * 2);

  stroke(255, 70);
  strokeWeight(lensStroke + 3);
  ellipse(lx, ly, lensRadius * 2);
}

// ==============================
// RAYS / CORE / INNER / RIPPLE / TRASH
// ==============================
function buildRays() {
  let shortLen = 150;
  let longLen = 330;
  for (let i = 0; i < rayCount; i++) {
    rays.push(i % 2 === 0 ? shortLen : longLen);
  }
}

function drawRays() {
  stroke(255);
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
  stroke(255);
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
  stroke(255);
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

function updateRipples() {
  if (frameCount % rippleDelay === 0) {
    ripples.push({ radius: 0, alpha: 180 });

    if (soundEnabled && deepOceanSound && deepOceanSound.isLoaded()) {
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

function mousePressed() {
  // click icon sound -> toggle
  if (
    mouseX >= soundBtn.x && mouseX <= soundBtn.x + soundBtn.w &&
    mouseY >= soundBtn.y && mouseY <= soundBtn.y + soundBtn.h
  ) {
    toggleSound();
    return;
  }

  if (typeof userStartAudio === "function") userStartAudio();

  // bg music
  if (soundEnabled && bgSound && bgSound.isLoaded() && !bgSound.isPlaying()) {
    bgSound.setVolume(0.10);
    bgSound.loop();
  }

  let dx = mouseX - centerX;
  let dy = mouseY - centerY;

  if (dx * dx + dy * dy <= coreRadius * coreRadius) {
    if (soundEnabled && clickSound && clickSound.isLoaded()) {
      clickSound.setVolume(0.2);
      clickSound.stop();
      clickSound.play();
    }
    spawnTrash();
  }
}

function spawnTrash() {
  trash = [];
  for (let i = 0; i < 14; i++) {
    trash.push(new Trash((TWO_PI / 14) * i));
  }
  addHiddenTrash(hiddenTrashPerDrop);
}
