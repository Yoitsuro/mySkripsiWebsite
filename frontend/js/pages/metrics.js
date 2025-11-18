// metrics.js
let evalChart = null;

async function loadMetrics() {
  const statusEl = document.getElementById("metricsStatus");
  const tbody = document.querySelector("#metricsTable tbody");
  statusEl.textContent = "Mengambil metrics...";
  tbody.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    Object.entries(data).forEach(([modelName, metrics]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${modelName}</td>
        <td>${metrics.RMSE !== undefined ? metrics.RMSE.toFixed(4) : "-"}</td>
        <td>${metrics.MAPE !== undefined ? metrics.MAPE.toFixed(4) : "-"}</td>
      `;
      tbody.appendChild(tr);
    });

    statusEl.textContent = "Metrics berhasil dimuat.";
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Gagal mengambil metrics (cek backend & file metrics_eth.csv).";
  }
}

async function loadEvalSeries() {
  const statusEl = document.getElementById("evalStatus");
  const ctx = document.getElementById("evalChart").getContext("2d");
  statusEl.textContent = "Mengambil data visualisasi prediksi...";
  if (evalChart) {
    evalChart.destroy();
  }

  try {
    const res = await fetch(`${API_BASE}/eval-series?limit=200`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    const series = payload.data || [];

    const labels = series.map((d) => d.timestamp);
    const yTrue = series.map((d) => d.y_true);
    const yStack = series.map((d) => d.y_stack);
    const yLgbm = series.map((d) => d.y_lgbm);
    const yTcn = series.map((d) => d.y_tcn);

    evalChart = new Chart(ctx, {
      type: "line",
      data: {
        // ✅ Tambahkan 'data:'
        labels,
        datasets: [
          {
            label: "Actual",
            data: yTrue,
            borderWidth: 1.2,
            pointRadius: 0,
          },
          {
            label: "Stacking",
            data: yStack,
            borderWidth: 1,
            pointRadius: 0,
          },
          {
            label: "LGBM",
            data: yLgbm,
            borderWidth: 1,
            borderDash: [4, 2],
            pointRadius: 0,
          },
          {
            label: "TCN",
            data: yTcn,
            borderWidth: 1,
            borderDash: [2, 2],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.label || "",
            },
          },
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 10,
            },
          },
          y: {
            beginAtZero: false,
          },
        },
      },
    });

    statusEl.textContent = "Visualisasi prediksi berhasil dimuat.";
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Gagal memuat visualisasi prediksi (cek endpoint /eval-series).";
  }
}

function setupMetricsPage() {
  // Bisa dikosongkan atau isi logika tambahan di sini nanti
}
