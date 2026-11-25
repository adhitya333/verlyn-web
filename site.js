// Light / dark theme switch. The first paint is set by the inline script in <head>; this keeps the
// kit's derived attributes (data-tone, data-mode, ground strengths) in step when the visitor switches.
const html = document.documentElement;
const meta = document.querySelector('meta[name="theme-color"]');

function apply(theme, save) {
  html.dataset.theme = theme;
  html.dataset.tone = theme;           // system.js sets this from --p-bg on load; mirror it on a switch
  html.removeAttribute('data-mode');   // backgrounds.js recomputes it below
  window.tasteBackgrounds?.detect();
  if (meta) meta.content = theme === 'dark' ? '#0f0f0f' : '#fdfdfc';
  for (const b of document.querySelectorAll('[data-theme-toggle]')) {
    b.setAttribute('aria-pressed', String(theme === 'dark'));
    b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (save) { try { localStorage.setItem('vt-theme', theme); } catch { /* private mode: the switch still works for this page */ } }
}

apply(html.dataset.theme === 'dark' ? 'dark' : 'light', false);
document.addEventListener('click', e => {
  if (!e.target.closest('[data-theme-toggle]')) return;
  apply(html.dataset.theme === 'dark' ? 'light' : 'dark', true);
});

document.querySelectorAll('[data-picker]').forEach(picker);

// Old shared links continue to reach the page that now owns the comparison.
if (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')) {
  if (location.hash === '#why-us' || location.hash === '#compare') location.replace('why-us.html');
}

document.querySelectorAll('.service-gallery article').forEach(card => {
  const destination = card.querySelector('.service-gallery__link');
  if (!destination) return;
  card.addEventListener('click', event => {
    if (event.target.closest('a, button, input, select, textarea, [role="switch"]')) return;
    if (window.getSelection()?.toString()) return;
    destination.click();
  });
});

const demo = document.querySelector('[data-lead-demo]');
if (demo) {
  const leads = {
    fatima: {
      message: 'Do you have an appointment this week?',
      reply: 'Thursday at 16:30 is available. Shall I book it?',
      action: 'Book Thursday',
      booked: 'Thursday at 16:30 booked in the demo calendar.'
    },
    omar: {
      message: 'Can I view the Al Reem apartment on Saturday?',
      reply: 'Yes, there’s a viewing slot at 11:00. Shall I confirm it?',
      action: 'Book viewing',
      booked: 'Viewing booked for Saturday at 11:00.'
    },
    rahul: {
      message: 'هل يمكنني حجز استشارة لتبييض الأسنان؟',
      reply: 'نعم، يوجد موعد للاستشارة يوم الأحد الساعة 4:00 مساءً. هل ترغب في حجزه؟',
      action: 'Book Sunday',
      booked: 'Sunday at 16:00 booked in the demo calendar.',
      lang: 'ar'
    }
  };
  const buttons = [...demo.querySelectorAll('[data-lead]')];
  const message = demo.querySelector('[data-demo-message]');
  const reply = demo.querySelector('[data-demo-reply]');
  const book = demo.querySelector('[data-demo-book]');
  const handoff = demo.querySelector('[data-demo-handoff]');
  const status = demo.querySelector('[data-demo-status]');
  let active = leads.fatima;
  buttons.forEach(button => button.addEventListener('click', () => {
    active = leads[button.dataset.lead];
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    for (const bubble of [message, reply]) {
      bubble.lang = active.lang || 'en';
      bubble.dir = active.lang ? 'rtl' : 'ltr';
    }
    message.textContent = active.message;
    reply.textContent = active.reply;
    book.textContent = active.action;
    status.textContent = '';
  }));
  book.addEventListener('click', () => { status.textContent = active.booked; });
  handoff.addEventListener('click', () => { status.textContent = 'Conversation handed to staff.'; });

}

const route = document.querySelector('[data-demo-route]');
if (route) {
  const owner = document.querySelector('[data-demo-owner]');
  route.addEventListener('click', () => {
    const assigned = owner.classList.toggle('is-assigned');
    owner.value = assigned ? 'Assigned to Karim' : 'New';
    route.textContent = assigned ? 'Reset example' : 'Assign new lead';
  });
}

document.querySelectorAll('[data-report-demo]').forEach(report => {
  const toggle = report.querySelector('[data-report-toggle]');
  const list = report.querySelector('.report-demo__bars');
  let bookings = false;
  toggle.addEventListener('click', () => {
    bookings = !bookings;
    const metric = bookings ? 'bookings' : 'leads';
    for (const row of list.children) {
      const value = Number(row.dataset[metric]);
      row.querySelector('i').style.setProperty('--bar', `${value / 30 * 100}%`);
      row.querySelector('output').value = value;
    }
    list.setAttribute('aria-label', `${bookings ? 'Bookings' : 'Leads'} by campaign`);
    toggle.textContent = bookings ? 'Show leads' : 'Show bookings';
  });
});

document.querySelectorAll('[data-scene]').forEach(scene => {
  const button = scene.querySelector('[data-scene-action]');
  if (!button) return;
  const label = button.textContent;
  button.addEventListener('click', () => {
    const active = scene.classList.toggle('is-complete');
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? button.dataset.reset : label;
    scene.querySelectorAll('[data-scene-before], [data-scene-after]').forEach(part => {
      part.hidden = active === part.hasAttribute('data-scene-before');
    });
  });
});

// Keep the visitor's selected demo-switch state until they change it again.
document.addEventListener('click', event => {
  const toggle = event.target.closest('.ui-switch');
  if (!toggle) return;
  const root = toggle.closest('[data-ui="toggles"]');
  if (!root) return;
  const next = toggle.getAttribute('aria-checked') !== 'true';
  root.__ui?.pause();
  toggle.classList.toggle('is-on', next);
  toggle.setAttribute('aria-checked', String(next));
  const count = root.querySelector('[data-tg-count]');
  if (count) {
    const switches = [...root.querySelectorAll('.ui-switch')];
    count.textContent = `${switches.filter(item => item.getAttribute('aria-checked') === 'true').length} of ${switches.length} on`;
  }
});

document.querySelectorAll('[data-demo-track]').forEach(button => {
  button.addEventListener('click', () => {
    button.parentElement.querySelector('[role="status"]').textContent = button.dataset.demoTrack;
  });
});

function picker(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
  if (!tabs.length || panels.some(p => !p)) return;
  let i = Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'));
  root.style.setProperty('--pick-n', tabs.length);

  function show(n, focus) {
    i = (n + tabs.length) % tabs.length;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle('is-active', on);
      panels[k].hidden = !on;
      panels[k].toggleAttribute('inert', !on);
      panels[k].setAttribute('aria-hidden', String(!on));
    });
    root.style.setProperty('--pick-i', i);
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => { show(k); });
    t.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); show(i + d, true); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); show(e.key === 'Home' ? 0 : tabs.length - 1, true); }
    });
  });
  const jumpToIndustry = () => {
    if (!root.classList.contains('ind')) return false;
    const key = location.hash.slice(1);
    const index = panels.findIndex(panel => panel.id === `p-${key}`);
    if (index === -1) return false;
    show(index);
    requestAnimationFrame(() => root.closest('section')?.scrollIntoView());
    return true;
  };
  if (root.classList.contains('ind')) window.addEventListener('hashchange', jumpToIndustry);
  if (!jumpToIndustry()) show(i);
}
// A short entrance, once per section. Demo loops remain independent.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const entrances = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      target.classList.add('is-revealed');
      entrances.unobserve(target);
    }
  }, { threshold: .03, rootMargin: '0px 0px 24px 0px' });
  document.querySelectorAll('body:not(.home-page) main > section:not(.hero) > .wrap').forEach(section => {
    if (section.getBoundingClientRect().top < innerHeight) return;
    section.classList.add('reveal-ready');
    entrances.observe(section);
  });
}

document.querySelectorAll('[data-workflow-page]').forEach(preview => {
  const languages = [...preview.querySelectorAll('[data-workflow-language]')];
  languages.forEach(button => button.addEventListener('click', () => {
    const arabic = button.dataset.workflowLanguage === 'ar';
    languages.forEach(language => language.setAttribute('aria-pressed', String(language === button)));
    preview.querySelector('[data-page-en]').hidden = arabic;
    preview.querySelector('[data-page-ar]').hidden = !arabic;
    preview.querySelector('[data-workflow-enquiry]').firstChild.textContent = arabic ? 'استفسر ' : 'Enquire ';
  }));
  preview.querySelector('[data-workflow-enquiry]').addEventListener('click', () => {
    preview.closest('.workflow-demo').querySelector('[data-workflow-result]').textContent = 'Enquiry saved · Google Search';
  });
});

// Only the demonstrations loop. Page content keeps its opening entrance.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const demos = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      target.classList.add('demo-looping');
      target.classList.toggle('is-offscreen', !isIntersecting);
    }
  }, { threshold: 0, rootMargin: '0px' });
  document.querySelectorAll('.industry-example, .overview-demo, .flow, .workflow-demo, .journey-visual, [data-motion-preview]').forEach(demo => demos.observe(demo));
}

document.querySelectorAll('[data-preview-pause]').forEach(button => {
  button.addEventListener('click', () => {
    const paused = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Play animation' : 'Pause animation';
    button.closest('[data-motion-preview]').classList.toggle('is-preview-paused', paused);
  });
});

// Preserve loop progress at viewport boundaries and pause in background tabs.
const syncMotionVisibility = () => html.classList.toggle('motion-paused', document.hidden);
document.addEventListener('visibilitychange', syncMotionVisibility);
syncMotionVisibility();

// ---------------------------------------------------------------- Abu Dhabi clock (contact page)
const clock = document.querySelector('[data-ad-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'long', hour: '2-digit', minute: '2-digit' });
  const set = () => { clock.textContent = `${fmt.format(new Date())} in Abu Dhabi`; };
  set(); setInterval(set, 30000);
}
