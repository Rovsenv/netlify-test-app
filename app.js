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
    nav.classList.remove("open");
  });
});

// Burger menu
const burgerBtn = document.getElementById("burgerBtn");
if (burgerBtn) {
  burgerBtn.addEventListener("click", () => {
    const nav = document.querySelector(".nav");
    nav.classList.toggle("open");
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
    statusEl.textContent = "Müraciətin göndərildi! Tezliklə əlaqə saxlayacağıq ✅";
    form.reset();
    setTimeout(() => {
      statusEl.textContent = "";
    }, 4000);
  });
}

// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Theme toggle (dark / light)
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle.textContent = theme === "light" ? "🌙 Dark mode" : "☀️ Light mode";
}

const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});
