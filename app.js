const btn = document.getElementById("btn");
const result = document.getElementById("result");

btn.addEventListener("click", () => {
  const now = new Date().toLocaleTimeString();
  result.textContent = `🎉 Klik olundu! Saat: ${now}`;
});
