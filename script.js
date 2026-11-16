const preloader = document.getElementById('preloader');
const hidePreloader = () => {
  if (preloader) preloader.classList.add('done');
};
window.addEventListener('load', () => setTimeout(hidePreloader, 350), { once: true });
setTimeout(hidePreloader, 2500);

document.getElementById('year').textContent = new Date().getFullYear();

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Scroll progress
const progress = document.getElementById('scrollProgress');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Reveal-on-scroll animation
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Project filters
const filterButtons = document.querySelectorAll('.filter');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  projectCards.forEach(card => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('hidden', !show);
    if (show) {
      card.classList.remove('visible');
      requestAnimationFrame(() => card.classList.add('visible'));
    }
  });
}));

// Subtle pointer movement on hero glow and magnetic CTA (desktop only)
if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const hero = document.querySelector('.hero');
  hero.addEventListener('pointermove', e => {
    const x = (e.clientX / window.innerWidth - .5) * 22;
    const y = (e.clientY / window.innerHeight - .5) * 22;
    document.querySelector('.orb-one').style.transform = `translate(${x}px, ${y}px)`;
    document.querySelector('.orb-two').style.transform = `translate(${-x * .5}px, ${-y * .5}px)`;
  });
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .08;
      const y = (e.clientY - r.top - r.height / 2) * .12;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => el.style.transform = '');
  });
}

// Smooth anchor navigation for browsers that don't honor CSS smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  });
});


// Custom cursor + soft ambient pointer glow (desktop pointer devices only).
const finePointer = window.matchMedia('(pointer:fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const ambientPointer = document.getElementById('ambientPointer');

if (finePointer && !reduceMotion && cursorDot && cursorRing) {
  let pointerX = window.innerWidth / 2, pointerY = window.innerHeight / 2;
  let ringX = pointerX, ringY = pointerY;
  document.addEventListener('pointermove', e => {
    pointerX = e.clientX; pointerY = e.clientY;
    cursorDot.style.opacity = cursorRing.style.opacity = '1';
    cursorDot.style.left = pointerX + 'px';
    cursorDot.style.top = pointerY + 'px';
    if (ambientPointer) {
      ambientPointer.style.opacity = '.8';
      ambientPointer.style.left = pointerX + 'px';
      ambientPointer.style.top = pointerY + 'px';
    }
  }, { passive: true });
  const animateRing = () => {
    ringX += (pointerX - ringX) * .18;
    ringY += (pointerY - ringY) * .18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  };
  animateRing();
  document.querySelectorAll('a,button,.filter,.project-visual').forEach(el => {
    el.addEventListener('pointerenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('pointerleave', () => cursorRing.classList.remove('hover'));
  });
}

// Animate the headline as a whole without rewriting its nested HTML.
const heroTitle = document.querySelector('.hero-title');
if (heroTitle && !reduceMotion) heroTitle.classList.add('headline-ready');

// Soft 3D project-card tilt on pointer devices.
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5-py)*3}deg) rotateY(${(px-0.5)*4}deg)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX-r.left}px`);
      card.style.setProperty('--my', `${e.clientY-r.top}px`);
    });
  });
}

// Local Pakistan time display, refreshed once per minute.
const clock = document.getElementById('localClock');
function updateClock() {
  if (!clock) return;
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(new Date());
  clock.textContent = `PKT · ${time}`;
}
updateClock();
setInterval(updateClock, 60000);

// Floating back-to-top action.
const backToTop = document.getElementById('backToTop');
function toggleBackToTop() {
  if (backToTop) backToTop.classList.toggle('show', window.scrollY > 650);
}
window.addEventListener('scroll', toggleBackToTop, { passive: true });
toggleBackToTop();
if (backToTop) backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

// Respect reduced-motion preference and avoid animation work when the tab is hidden.
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('tab-hidden', document.hidden);
});
