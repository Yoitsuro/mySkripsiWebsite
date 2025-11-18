const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
  // Tampilkan waktu lokal
  document.getElementById("localTime").textContent = new Date().toLocaleString(
    "id-ID",
    {
      timeZone: "Asia/Jakarta",
    }
  );

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
