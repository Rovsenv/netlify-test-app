// Smooth scroll helper
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.offsetTop - 70,
    behavior: "smooth",
  });
}

// Navbar click smooth scroll
document.querySelectorAll(".nav a[href^='#']").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    scrollToSection(targetId);
    const nav = document.querySelector(".nav");
    if (nav) nav.classList.remove("open");
  });
});

// Burger menu
const burgerBtn = document.getElementById("burgerBtn");
if (burgerBtn) {
  burgerBtn.addEventListener("click", () => {
    const nav = document.querySelector(".nav");
    if (nav) nav.classList.toggle("open");
  });
}

// Course filter
const filterButtons = document.querySelectorAll(".filter-btn");
const courseCards = document.querySelectorAll(".course-card");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;

    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    courseCards.forEach((card) => {
      const cardCat = card.dataset.category;
      if (category === "all" || cardCat === category) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// FAQ accordion
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  if (!question) return;

  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    faqItems.forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  });
});

// Contact form (fake submit)
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (statusEl) {
      statusEl.textContent = "Müraciətin göndərildi! Tezliklə əlaqə saxlayacağıq ✅";
      setTimeout(() => {
        statusEl.textContent = "";
      }, 4000);
    }
    form.reset();
  });
}

// Year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Theme toggle (dark / light)
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "light" ? "🌙 Dark mode" : "☀️ Light mode";
  }
}

const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });
}

// ====== Live chat + n8n integration ======
const chatLauncher = document.getElementById("chatLauncher");
const chatWidget = document.getElementById("chatWidget");
const chatCloseBtn = document.getElementById("chatCloseBtn");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// PROD webhook URL (n8n)
const N8N_WEBHOOK_URL = "https://n8n.datatek.tech/webhook/datatek-chat";

function appendMessage(text, sender = "bot") {
  if (!chatMessages) return;
  const div = document.createElement("div");
  div.classList.add("chat-message", sender);
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// cavabı müxtəlif formatlardan “çıxarmaq” üçün helper
function extractReply(data) {
  if (!data) return "";

  // plain text
  if (typeof data === "string") return data.trim();

  // array qaydarsa
  if (Array.isArray(data)) {
    return extractReply(data[0]);
  }

  // object qaydarsa
  if (typeof data === "object") {
    return (
      (data.reply && String(data.reply)) ||
      (data.text && String(data.text)) ||
      (data.output && String(data.output)) ||
      (data.message && String(data.message)) ||
      (data.data && extractReply(data.data)) ||
      ""
    ).trim();
  }

  return "";
}

if (chatLauncher && chatWidget) {
  chatLauncher.addEventListener("click", () => {
    chatWidget.classList.add("open");
  });
}

if (chatCloseBtn && chatWidget) {
  chatCloseBtn.addEventListener("click", () => {
    chatWidget.classList.remove("open");
  });
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    // Ekranda user mesajını göstər
    appendMessage(message, "user");
    chatInput.value = "";

    // "Yazılır..." mesajı
    appendMessage("Yazılır...", "bot");
    const typingEl = chatMessages ? chatMessages.lastElementChild : null;

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          source: "datatek-website",
          time: new Date().toISOString(),
        }),
      });

      // əvvəl text oxu, sonra JSON parse etməyə çalış
      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = raw; // JSON deyilsə plain text kimi saxla
      }

      if (typingEl) typingEl.remove();

      // HTTP xətası varsa (500, 404 və s.)
      if (!res.ok) {
        const serverMsg = extractReply(data) || `Server xətası: ${res.status} ${res.statusText}`;
        appendMessage(serverMsg, "bot");
        return;
      }

      const replyText =
        extractReply(data) ||
        "Mesajını aldıq, komandamız tezliklə səninlə əlaqə saxlayacaq ✅";

      appendMessage(replyText, "bot");
    } catch (err) {
      console.error("n8n xətası:", err);
      if (typingEl) typingEl.remove();
      appendMessage(
        "Serverə qoşulmaq alınmadı. Zəhmət olmasa bir az sonra yenidən yoxla.",
        "bot"
      );
    }
  });
}
