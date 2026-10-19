'use strict';
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreLabel = document.querySelector('#score');
const statusLabel = document.querySelector('#status');
const action = document.querySelector('#action');
const ground = 260;
let best = 0;
try { best = Number(localStorage.getItem('tiny-dino-best')) || 0; } catch {}
let state = 'ready', score = 0, speed = 330, spawn = 1, obstacles = [], previous = null;
const dino = { x: 80, y: ground - 48, w: 40, h: 48, vy: 0 };
function jump() {
  if (state !== 'running') {
    state = 'running'; score = 0; speed = 330; spawn = 1.1; obstacles = [];
    dino.y = ground - dino.h; dino.vy = 0; previous = null;
    statusLabel.textContent = '달리는 중! 선인장을 뛰어넘으세요.';
    action.textContent = '점프';
  }
  if (dino.y >= ground - dino.h) dino.vy = -650;
}
function finish() {
  state = 'over'; best = Math.max(best, Math.floor(score));
  try { localStorage.setItem('tiny-dino-best', String(best)); } catch {}
  statusLabel.textContent = `게임 오버! 점수 ${Math.floor(score)} · 최고 기록 ${best}. 다시 도전하세요.`;
  action.textContent = '다시 시작';
}
function update(dt) {
  score += dt * 10; speed = Math.min(620, 330 + score * 1.3);
  dino.vy += 1900 * dt; dino.y += dino.vy * dt;
  if (dino.y > ground - dino.h) { dino.y = ground - dino.h; dino.vy = 0; }
  spawn -= dt;
  if (spawn <= 0) {
    const h = 36 + Math.random() * 22;
    obstacles.push({ x: canvas.width + 20, y: ground - h, w: 22, h });
    spawn = 1.15 + Math.random() * 0.65;
  }
  for (const o of obstacles) {
    o.x -= speed * dt;
    if (dino.x + 6 < o.x + o.w && dino.x + dino.w - 6 > o.x &&
        dino.y + 5 < o.y + o.h && dino.y + dino.h - 3 > o.y) { finish(); break; }
  }
  obstacles = obstacles.filter(o => o.x + o.w > 0);
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e9e4d6';
  for (let i = 0; i < 4; i++) {
    const x = ((i * 270 - score * 5) % 1080 + 1080) % 1080;
    ctx.fillRect(x, 65 + i % 2 * 30, 65, 8);
  }
  ctx.fillStyle = '#283b31'; ctx.fillRect(0, ground, canvas.width, 2);
  // Pixel dinosaur: head, body, tail, snout and animated feet.
  const x = dino.x, y = dino.y;
  ctx.fillRect(x + 17, y, 23, 23); ctx.fillRect(x + 8, y + 18, 24, 23);
  ctx.fillRect(x, y + 16, 12, 10); ctx.fillRect(x + 29, y + 16, 17, 6);
  const step = state === 'running' && dino.y >= ground - dino.h ? Math.floor(score * 3) % 2 * 5 : 0;
  ctx.fillRect(x + 10, y + 38, 7, 10 - step); ctx.fillRect(x + 26, y + 38, 7, 5 + step);
  ctx.fillStyle = '#fffdf6'; ctx.fillRect(x + 31, y + 5, 4, 4);
  ctx.fillStyle = '#49735b';
  for (const o of obstacles) {
    ctx.fillRect(o.x + 7, o.y, 10, o.h);
    ctx.fillRect(o.x, o.y + 12, 7, 7); ctx.fillRect(o.x, o.y + 5, 5, 12);
    ctx.fillRect(o.x + 17, o.y + 19, 7, 7); ctx.fillRect(o.x + 20, o.y + 10, 5, 16);
  }
  scoreLabel.textContent = String(Math.floor(score)).padStart(5, '0');
  ctx.fillStyle = '#607067'; ctx.font = '16px system-ui'; ctx.fillText(`BEST ${best}`, 760, 30);
  if (state !== 'running') {
    ctx.textAlign = 'center'; ctx.font = 'bold 24px system-ui';
    ctx.fillText(state === 'over' ? 'GAME OVER' : 'READY TO RUN?', 450, 150); ctx.textAlign = 'left';
  }
}
function frame(time) {
  const dt = previous === null ? 0 : Math.min((time - previous) / 1000, 0.035);
  previous = time;
  if (state === 'running' && !document.hidden) update(dt);
  draw(); requestAnimationFrame(frame);
}
document.addEventListener('keydown', event => {
  if ((event.code === 'Space' || event.code === 'ArrowUp') && event.target !== action) {
    event.preventDefault(); if (!event.repeat) jump();
  }
});
canvas.addEventListener('pointerdown', jump);
action.addEventListener('click', jump);
document.addEventListener('visibilitychange', () => { previous = null; });
requestAnimationFrame(frame);
