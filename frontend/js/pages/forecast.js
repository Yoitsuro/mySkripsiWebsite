// forecast.js
let forecastChart = null;

function validateCustomInput() {
  const customInput = document.getElementById("customHorizon");
  const errorEl = document.getElementById("customHorizonError");
  const btnForecast = document.getElementById("btnForecast");
  const val = customInput.value.trim();

  if (val === "") {
    errorEl.classList.remove("show");
    btnForecast.disabled = false;
    return true;
  }

  if (!/^\d+$/.test(val)) {
    errorEl.textContent = "Hanya angka diperbolehkan.";
    errorEl.classList.add("show");
    btnForecast.disabled = true;
    return false;
  }

  const num = parseInt(val, 10);
  if (num < 1 || num > 168) {
    errorEl.textContent = "Masukkan angka antara 1 dan 168.";
    errorEl.classList.add("show");
    btnForecast.disabled = true;
    return false;
  }

  errorEl.classList.remove("show");
  btnForecast.disabled = false;
  return true;
}

async function doForecast() {
  const statusEl = document.getElementById("forecastStatus");
  const chartStatusEl = document.getElementById("forecastChartStatus");
  const tbody = document.querySelector("#forecastTable tbody");
  const customInput = document.getElementById("customHorizon");
  const horizonRadios = document.querySelectorAll(".horizon-radio");

  statusEl.textContent = "";
  chartStatusEl.textContent = "";
  tbody.innerHTML = "";

  if (forecastChart) {
    forecastChart.destroy();
    forecastChart = null;
  }

  let maxHorizon = 0;
  const customVal = customInput.value.trim();

  if (customVal) {
    const n = parseInt(customVal, 10);
    if (isNaN(n) || n < 1 || n > 168) {
      statusEl.textContent = "Custom horizon harus antara 1 hingga 168 jam.";
      return;
    }
    maxHorizon = n;
  } else {
    horizonRadios.forEach((radio) => {
      if (radio.checked) {
        maxHorizon = parseInt(radio.value, 10);
      }
    });
  }

  if (maxHorizon === 0) {
    statusEl.textContent = "Pilih minimal satu horizon.";
    return;
  }

  const hoursArr = Array.from({ length: maxHorizon }, (_, i) => i + 1);
  const horizonsStr = hoursArr.join(",");

  statusEl.textContent = `Menghitung forecast untuk ${maxHorizon} jam ke depan...`;

  try {
    const url = `${API_BASE}/forecast?symbol=${encodeURIComponent(
      "ETH/USDT"
    )}&horizons=${encodeURIComponent(horizonsStr)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    const data = await res.json();

    const entries = Object.entries(data.results || {});
    entries.sort((a, b) => {
      const ha = parseInt(a[0].replace("h", ""), 10);
      const hb = parseInt(b[0].replace("h", ""), 10);
      return ha - hb;
    });

    const chartLabels = [];
    const chartData = [];

    entries.forEach(([key, info]) => {
      const targetLocal = new Date(info.target_time_local).toLocaleString(
        "id-ID",
        {
          timeZone: "Asia/Jakarta",
          hour12: false,
        }
      );

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${key} <br><small>Target: ${targetLocal}</small></td>
        <td>$${Number(info.pred_stack).toFixed(4)}</td>
      `;
      tbody.appendChild(tr);

      chartLabels.push(targetLocal);
      chartData.push(Number(info.pred_stack));
    });

    document.getElementById("forecastTimeNow").textContent =
      "Forecast dihasilkan pada: " +
      new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    statusEl.textContent = `Forecast selesai. Timeframe: ${data.timeframe}.`;

    // Reset tampilan grafik sebelumnya
    const forecastChartCanvas = document.getElementById("forecastChart");
    forecastChartCanvas.style.display = "block"; // default tampilkan
    chartStatusEl.textContent = "";

    if (chartLabels.length > 1) {
      // Buat grafik hanya jika > 1 titik
      const ctx = forecastChartCanvas.getContext("2d");
      forecastChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: `Forecast (Stacking) - ${maxHorizon} jam`,
              data: chartData,
              fill: false,
              borderWidth: 1.5,
              pointRadius: 2,
              pointHitRadius: 6,
              borderColor: "#007bff",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => ` Prediksi: ${ctx.parsed.y.toFixed(4)}`,
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
      chartStatusEl.textContent = "Grafik forecast berhasil dimuat.";
    } else {
      // Sembunyikan canvas jika hanya 1 jam
      forecastChartCanvas.style.display = "none";
      chartStatusEl.textContent =
        "Grafik tidak ditampilkan untuk horizon 1 jam.";
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Terjadi error saat memanggil API forecast. Cek log backend.";
    chartStatusEl.textContent = "Gagal memuat grafik forecast.";
  }
}

function setupForecastPage() {
  const btnForecast = document.getElementById("btnForecast");
  const customInput = document.getElementById("customHorizon");
  const errorEl = document.getElementById("customHorizonError");
  const horizonRadios = document.querySelectorAll(".horizon-radio");

  // Hanya izinkan angka
  customInput.addEventListener("keydown", (e) => {
    if ([46, 8, 9, 27, 13, 37, 38, 39, 40].includes(e.keyCode)) return;
    if ((e.ctrlKey || e.metaKey) && [67, 86, 88].includes(e.keyCode)) return;
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  });

  customInput.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    customInput.value = pasted.replace(/[^0-9]/g, "");
    validateCustomInput();
  });

  customInput.addEventListener("input", () => {
    horizonRadios.forEach((r) => (r.checked = false));
    validateCustomInput();
  });

  horizonRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        customInput.value = "";
        errorEl.classList.remove("show");
        btnForecast.disabled = false;
      }
    });
  });

  btnForecast.addEventListener("click", () => {
    if (validateCustomInput()) {
      doForecast();
    }
  });

  validateCustomInput(); // inisialisasi
}
