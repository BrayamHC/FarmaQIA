<template>
  <canvas ref="canvasRef" class="farma-canvas-bg" aria-hidden="true" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref(null);
let animationId = null;
let resizeHandler = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let tick = 0;

  function resize() {
    width = canvas.width = canvas.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.offsetHeight || window.innerHeight;
    createParticles();
  }

  function createParticles() {
    const total = Math.max(28, Math.floor(width / 70));
    particles = Array.from({ length: total }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.4 + 1.2,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: (Math.random() - 0.5) * 0.16,
      alpha: Math.random() * 0.16 + 0.08,
    }));
  }

  function drawBackgroundWash() {
    const g1 = ctx.createRadialGradient(width * 0.18, height * 0.24, 0, width * 0.18, height * 0.24, width * 0.34);
    g1.addColorStop(0, 'rgba(59,130,246,0.18)');
    g1.addColorStop(1, 'rgba(59,130,246,0)');

    const g2 = ctx.createRadialGradient(width * 0.82, height * 0.7, 0, width * 0.82, height * 0.7, width * 0.28);
    g2.addColorStop(0, 'rgba(96,165,250,0.16)');
    g2.addColorStop(1, 'rgba(96,165,250,0)');

    const g3 = ctx.createRadialGradient(width * 0.55, height * 0.16, 0, width * 0.55, height * 0.16, width * 0.2);
    g3.addColorStop(0, 'rgba(16,185,129,0.10)');
    g3.addColorStop(1, 'rgba(16,185,129,0)');

    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, width, height);
  }

  function getEcgY(x, offsetX, baseY, scale = 1) {
    const p = (x + offsetX) % 360;

    let y = 0;

    if (p < 60) {
      y = 0;
    } else if (p < 78) {
      y = -8 * Math.sin(((p - 60) / 18) * Math.PI);
    } else if (p < 92) {
      y = 10 * Math.sin(((p - 78) / 14) * Math.PI);
    } else if (p < 106) {
      y = -56 * Math.sin(((p - 92) / 14) * Math.PI);
    } else if (p < 120) {
      y = 22 * Math.sin(((p - 106) / 14) * Math.PI);
    } else if (p < 165) {
      y = 0;
    } else if (p < 198) {
      y = -12 * Math.sin(((p - 165) / 33) * Math.PI);
    } else {
      y = 0;
    }

    return baseY + y * scale;
  }

  function drawPulseLine() {
    const baseY = height * 0.88;
    const offset = tick * 220;

    ctx.save();

    ctx.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const y = getEcgY(x, offset, baseY, 1);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = 'rgba(59,130,246,0.14)';
    ctx.lineWidth = 10;
    ctx.shadowColor = 'rgba(59,130,246,0.10)';
    ctx.shadowBlur = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const y = getEcgY(x, offset, baseY, 1);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = 'rgba(59,130,246,0.24)';
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.restore();
  }

  function drawSoftGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(59,130,246,0.035)';
    ctx.lineWidth = 1;

    const gap = 48;

    for (let x = 0; x <= width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59,130,246,${(1 - dist / 120) * 0.08})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.beginPath();
      ctx.fillStyle = `rgba(59,130,246,${p.alpha})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawMedicalCrosses() {
    const crosses = [
      { x: width * 0.78, y: height * 0.2, size: 16, alpha: 0.05 },
      { x: width * 0.16, y: height * 0.74, size: 11, alpha: 0.04 },
    ];

    crosses.forEach((cross, index) => {
      ctx.save();
      ctx.translate(cross.x, cross.y);
      ctx.rotate(Math.sin(tick * 0.8 + index) * 0.04);
      ctx.fillStyle = `rgba(16,185,129,${cross.alpha})`;

      ctx.beginPath();
      ctx.roundRect(-cross.size * 0.3, -cross.size, cross.size * 0.6, cross.size * 2, 8);
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(-cross.size, -cross.size * 0.3, cross.size * 2, cross.size * 0.6, 8);
      ctx.fill();

      ctx.restore();
    });
  }

  function animate() {
    tick += 0.008;
    ctx.clearRect(0, 0, width, height);
    drawBackgroundWash();
    drawSoftGrid();
    drawPulseLine();
    drawConnections();
    drawParticles();
    drawMedicalCrosses();
    animationId = requestAnimationFrame(animate);
  }

  resizeHandler = () => resize();
  window.addEventListener('resize', resizeHandler);
  resize();
  animate();
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
});
</script>

<style scoped>
.farma-canvas-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
