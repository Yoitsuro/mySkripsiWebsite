const API_BASE = "http://localhost:8000";

// Theme toggle logic
function initTheme() {
  const root = document.getElementById("theme-root");
  const toggleBtn = document.getElementById("theme-toggle");
  const icon = toggleBtn.querySelector(".theme-icon");

  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", savedTheme);
  icon.textContent = savedTheme === "dark" ? "🌙" : "🌞";

  // Toggle theme
  toggleBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    icon.textContent = newTheme === "dark" ? "🌙" : "🌞";
  });
}

function updateLocalTime() {
  const now = new Date();

  // Format tanggal: dd/mm/yyyy
  const dateOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  };
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  };

  const formattedDate = now.toLocaleDateString("id-ID", dateOptions);
  const formattedTime = now.toLocaleTimeString("id-ID", timeOptions);

  document.getElementById("localTimeDate").textContent = formattedDate;
  document.getElementById("localTimeTime").textContent = formattedTime;
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme FIRST
  initTheme();

  // Start real-time clock AFTER DOM is ready
  setInterval(updateLocalTime, 1000); // Update setiap detik
  updateLocalTime(); // Update segera

  // Setup halaman
  setupNavigation();
  setupHomePage();
  setupMetricsPage();
  setupForecastPage();

  // Load data awal
  loadHistory(1);
  loadMetrics();
  loadEvalSeries();
});

function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      pages.forEach((p) => {
        p.classList.toggle("active", p.id === `page-${btn.dataset.page}`);
      });
    });
  });
}
