/* =============================================
   APEX FITNESS — script.js
   ============================================= */

'use strict';

/* --- LOADER --- */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initReveal();
    }
  }, 2000);
});
document.body.style.overflow = 'hidden';

/* --- CUSTOM CURSOR --- */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0, follX = 0, follY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateCursor() {
  follX += (mouseX - follX) * 0.12;
  follY += (mouseY - follY) * 0.12;
  follower.style.left = follX + 'px';
  follower.style.top  = follY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .faq-question, .filter-btn, .goal-btn').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1.6)';
    cursor.style.background = '#ffffff';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.background = 'var(--blue)';
  });
});

/* --- NAVBAR SCROLL --- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* --- MOBILE MENU --- */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* --- HERO CANVAS PARTICLES --- */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NUM = 80;
  for (let i = 0; i < NUM; i++) {
    particles.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.1
    });
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,102,255,${0.12 * (1 - dist / 160)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,102,255,${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
})();

/* --- SCROLL REVEAL --- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
}

/* --- COUNTER ANIMATION --- */
function animateCounter(el, target) {
  const isLarge = target >= 1000;
  let start = 0;
  const dur = 1800;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / dur, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    if (isLarge) {
      el.textContent = current >= 1000
        ? (current / 1000).toFixed(current >= 100000 ? 0 : 1) + 'K+'
        : current;
    } else if (target <= 100) {
      el.textContent = current + (target <= 100 ? '' : '');
    } else {
      el.textContent = current + '+';
    }

    if (progress < 1) requestAnimationFrame(update);
    else {
      if (isLarge) el.textContent = (target / 1000).toFixed(0) + 'K+';
      else el.textContent = target + (target <= 100 ? (target < 100 ? '+' : '%') : '+');
    }
  }
  requestAnimationFrame(update);
}

// Observe stat cards
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = 'true';
      const numEl = e.target.querySelector('.stat-num');
      if (numEl) animateCounter(numEl, +numEl.dataset.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stat-card').forEach(c => statObserver.observe(c));

/* --- ROUTINE FILTER --- */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    document.querySelectorAll('.routine-card').forEach(card => {
      if (filter === 'all' || card.dataset.cat === filter) {
        card.classList.remove('hidden');
        // Trigger progress bar re-animation
        setTimeout(() => {
          const fill = card.querySelector('.prog-fill');
          if (fill) {
            fill.style.width = '0';
            setTimeout(() => {
              fill.style.width = getComputedStyle(fill).getPropertyValue('--w') || fill.style.getPropertyValue('--w');
              card.classList.add('visible');
            }, 50);
          }
        }, 50);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* --- CALORIE CALCULATOR --- */
let activeGoal = 0.8;

document.querySelectorAll('.goal-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeGoal = +this.dataset.goal;
  });
});

document.getElementById('calcBtn').addEventListener('click', function () {
  const age    = +document.getElementById('calc-age').value;
  const gender = document.getElementById('calc-gender').value;
  const weight = +document.getElementById('calc-weight').value;
  const height = +document.getElementById('calc-height').value;
  const act    = +document.getElementById('calc-activity').value;

  if (!age || !weight || !height || age < 15 || weight < 30 || height < 100) {
    shakeBtn(this);
    return;
  }

  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  const tdee     = bmr * act;
  const target   = Math.round(tdee * activeGoal);
  const protein  = Math.round(weight * 2.2);
  const fat      = Math.round(target * 0.25 / 9);
  const carbs    = Math.round((target - protein * 4 - fat * 9) / 4);

  const goalLabels = { 0.8: 'FAT LOSS', 1: 'MAINTENANCE', 1.1: 'MUSCLE GAIN' };
  const circumference = 2 * Math.PI * 80;

  const resultEl = document.getElementById('calcResult');
  resultEl.innerHTML = `
    <div class="calc-output">
      <h3>${target.toLocaleString()} kcal</h3>
      <span class="calc-goal-label">DAILY TARGET · ${goalLabels[activeGoal] || 'CUSTOM'}</span>
      <div class="calorie-ring">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0066FF"/>
              <stop offset="100%" stop-color="#3385FF"/>
            </linearGradient>
          </defs>
          <circle class="ring-bg" cx="90" cy="90" r="80"/>
          <circle class="ring-fill" cx="90" cy="90" r="80"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            style="stroke-dashoffset:${circumference}"/>
        </svg>
        <div class="ring-text">
          <div class="ring-num">${target >= 1000 ? (target/1000).toFixed(1)+'k' : target}</div>
          <div class="ring-unit">KCAL</div>
        </div>
      </div>
      <div class="macro-grid">
        <div class="macro-item prot">
          <div class="macro-val">${protein}g</div>
          <div class="macro-label">Protein</div>
        </div>
        <div class="macro-item carb">
          <div class="macro-val">${carbs}g</div>
          <div class="macro-label">Carbs</div>
        </div>
        <div class="macro-item fat">
          <div class="macro-val">${fat}g</div>
          <div class="macro-label">Fats</div>
        </div>
      </div>
      <p class="calc-note">
        Based on Mifflin-St Jeor equation.<br/>
        Adjust by ±100 kcal based on weekly progress.
      </p>
    </div>
  `;

  // Animate ring
  requestAnimationFrame(() => {
    const ring = resultEl.querySelector('.ring-fill');
    if (ring) {
      const maxCalories = 4000;
      const ratio = Math.min(target / maxCalories, 1);
      const offset = circumference * (1 - ratio);
      setTimeout(() => {
        ring.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)';
        ring.style.strokeDashoffset = offset;
      }, 100);
    }
  });
});

function shakeBtn(btn) {
  btn.style.animation = 'none';
  btn.style.transition = 'none';
  let shakes = 0;
  const dir = ['-6px','6px','-4px','4px','-2px','0'];
  function shake() {
    if (shakes < dir.length) {
      btn.style.transform = `translateX(${dir[shakes]})`;
      shakes++;
      setTimeout(shake, 60);
    } else {
      btn.style.transform = '';
    }
  }
  shake();
}

/* --- FAQ ACCORDION --- */
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', function () {
    const item = this.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* --- TESTIMONIALS CAROUSEL --- */
(function initCarousel() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('testimonialsDotsContainer');
  let current = 0;
  let perView = getPerView();
  let total = Math.ceil(cards.length / perView);
  let autoInterval;

  function getPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    perView = getPerView();
    total = Math.ceil(cards.length / perView);
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 't-dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(d);
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * perView * cardWidth}px)`;
    document.querySelectorAll('.t-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function nextSlide() {
    goTo(current + 1 >= total ? 0 : current + 1);
  }

  buildDots();
  autoInterval = setInterval(nextSlide, 4500);

  window.addEventListener('resize', () => {
    const prev = perView;
    perView = getPerView();
    if (prev !== perView) {
      current = 0;
      buildDots();
      goTo(0);
    }
  });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
      clearInterval(autoInterval);
      autoInterval = setInterval(nextSlide, 4500);
    }
  });
})();

/* --- PROGRESS BARS ON SCROLL --- */
const progObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.routine-card').forEach(c => progObserver.observe(c));

/* --- SMOOTH ANCHOR SCROLL --- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* --- HERO PARALLAX SUBTLE --- */
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    const heroContent = hero.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
      heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.9);
    }
  }
});

/* --- INIT REVEALS MANUALLY FOR ABOVE-FOLD --- */
window.addEventListener('DOMContentLoaded', () => {
  // Force hero reveals after loader
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 150);
    });
  }, 2200);
});
