const API_BASE = "http://localhost:8000";

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
