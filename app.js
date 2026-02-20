/* ====================================================
   Datatek Academy — app.js
   ==================================================== */

// ── Smooth scroll helper ─────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 68;
  window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
}

// ── Navbar smooth scroll ─────────────────────────────
document.querySelectorAll('.nav a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    scrollToSection(targetId);
    document.getElementById('mainNav')?.classList.remove('open');
  });
});

// ── Burger menu ──────────────────────────────────────
const burgerBtn = document.getElementById('burgerBtn');
burgerBtn?.addEventListener('click', () => {
  document.getElementById('mainNav')?.classList.toggle('open');
});

// ── Course filter ─────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.category;
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.course-card').forEach((card) => {
      const show = cat === 'all' || card.dataset.category === cat;
      card.style.display = show ? '' : 'none';
      if (show) card.classList.add('visible');
    });
  });
});

// ── FAQ accordion ─────────────────────────────────────
document.querySelectorAll('.faq-item').forEach((item) => {
  item.querySelector('.faq-question')?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── Contact form ──────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (formStatus) {
    formStatus.style.color = '#6ee7b7';
    formStatus.textContent = '✅ Müraciətin göndərildi! Tezliklə əlaqə saxlayacağıq.';
    setTimeout(() => { formStatus.textContent = ''; }, 5000);
  }
  contactForm.reset();
});

// ── Footer year ────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Theme toggle ────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeToggle) {
    const icon = themeToggle.querySelector('.theme-icon');
    const label = themeToggle.querySelector('.theme-label');
    if (theme === 'light') {
      // Currently light → button offers to switch to dark (Gecə)
      if (icon) icon.textContent = '🌙';
      if (label) label.textContent = 'Gecə';
    } else {
      // Currently dark → button offers to switch to light (Gündüz)
      if (icon) icon.textContent = '☀️';
      if (label) label.textContent = 'Gündüz';
    }
  }
}

setTheme(localStorage.getItem('theme') || 'dark');
themeToggle?.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});


// ── Scroll‑reveal (Intersection Observer) ─────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

// ══════════════════════════════════════════════════════
//   CHATBOT  (fixed bottom-right, always visible)
// ══════════════════════════════════════════════════════
const N8N_WEBHOOK_URL = 'https://n8n.datatek.tech/webhook/datatek-chat';

const chatLauncher = document.getElementById('chatLauncher');
const chatWidget = document.getElementById('chatWidget');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const quickReplies = document.getElementById('quickReplies');

// ── Toggle open/close ──────────────────────────────────
function openChat() {
  chatWidget?.classList.add('open');
  chatInput?.focus();
}

function closeChat() {
  chatWidget?.classList.remove('open');
}

chatLauncher?.addEventListener('click', openChat);
chatLauncher?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); }
});
chatCloseBtn?.addEventListener('click', closeChat);

// Close on outside click
document.addEventListener('click', (e) => {
  if (
    chatWidget?.classList.contains('open') &&
    !chatWidget.contains(e.target) &&
    !chatLauncher?.contains(e.target)
  ) {
    closeChat();
  }
});

// ── Append message ──────────────────────────────────────
function appendMessage(text, sender = 'bot') {
  if (!chatMessages) return null;
  const div = document.createElement('div');
  div.classList.add('chat-message', sender);
  div.innerHTML = sender === 'bot'
    ? text.replace(/\n/g, '<br>')
    : escapeHtml(text);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Typing indicator ────────────────────────────────────
function showTyping() {
  if (!chatMessages) return null;
  const div = document.createElement('div');
  div.classList.add('chat-message', 'bot', 'typing-indicator');
  div.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

// ── Extract reply from n8n response ────────────────────
function extractReply(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.trim();
  if (Array.isArray(data)) return extractReply(data[0]);
  if (typeof data === 'object') {
    return (
      (data.reply && String(data.reply)) ||
      (data.text && String(data.text)) ||
      (data.output && String(data.output)) ||
      (data.message && String(data.message)) ||
      (data.data && extractReply(data.data)) ||
      ''
    ).trim();
  }
  return '';
}

// ── Send message to n8n ─────────────────────────────────
async function sendMessage(text) {
  if (!text) return;

  // Hide quick replies after first user message
  if (quickReplies) quickReplies.style.display = 'none';

  appendMessage(text, 'user');
  const typingEl = showTyping();

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        source: 'datatek-website',
        time: new Date().toISOString(),
      }),
    });

    const raw = await res.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = raw; }

    typingEl?.remove();

    if (!res.ok) {
      const serverMsg = extractReply(data) || `Server xətası: ${res.status}`;
      appendMessage(serverMsg, 'bot');
      return;
    }

    const reply =
      extractReply(data) ||
      'Mesajını aldıq! Komandamız tezliklə səninlə əlaqə saxlayacaq ✅';
    appendMessage(reply, 'bot');

  } catch (err) {
    console.error('n8n xətası:', err);
    typingEl?.remove();
    appendMessage(
      'Serverə qoşulmaq alınmadı. Bir az sonra yenidən yoxla 🙏',
      'bot'
    );
  }
}

// ── Form submit ─────────────────────────────────────────
chatForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput?.value.trim();
  if (!text) return;
  chatInput.value = '';
  await sendMessage(text);
});

// ── Quick reply buttons ─────────────────────────────────
document.querySelectorAll('.quick-reply-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const msg = btn.dataset.msg;
    await sendMessage(msg);
  });
});

// ── Keyboard shortcut: Escape closes chat ──────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatWidget?.classList.contains('open')) {
    closeChat();
  }
});
