// home.js — WAJIB ADA DI AWAL FILE
let priceChart = null;

async function loadHistory(days) {
  const statusEl = document.getElementById("homeStatus");
  const tbody = document.querySelector("#ohlcvTable tbody");

  // Reset UI
  statusEl.textContent = "Mengambil data harga...";
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Memuat...</td></tr>`;

  // Hancurkan chart lama
  if (priceChart) {
    priceChart.destroy();
    priceChart = null;
  }

  try {
    const res = await fetch(`${API_BASE}/history?symbol=ETH/USDT&days=${days}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const series = data.data || [];

    // === RENDER GRAFIK (SELALU DIBUAT JIKA ADA DATA) ===
    const ctx = document.getElementById("priceChart").getContext("2d");

    if (series.length > 0) {
      const labels = series.map((d) =>
        new Date(d.timestamp + "Z").toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour12: false,
        })
      );
      const prices = series.map((d) => parseFloat(d.close) || 0);

      const MIN_X_TICKS = 6;
      const PIXEL_PER_TICK = 30;

      priceChart = new Chart(ctx, {
        type: "line",
        data: {
          // ✅ `data` untuk chart
          labels: labels,
          datasets: [
            {
              label: "Close Price (1h)",
              data: prices, // ✅ `data` untuk dataset
              fill: false,
              borderWidth: 1,
              pointRadius: 2,
              pointHitRadius: 6,
            },
          ],
        },
        options: {
          maintainAspectRatio: false, // biar tinggi canvas tidak terpengaruh rasio default
          responsive: true,
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => ` Close: ${ctx.parsed.y.toFixed(2)}`,
                title: (items) => items[0]?.label || "",
              },
            },
          },
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                autoSkipPadding: PIXEL_PER_TICK, // jarak antar label minimal 30px
                maxTicksLimit: (context) => {
                  const width = context.chart?.width || ctx.canvas.clientWidth;
                  const computedLimit = Math.floor((width || 0) / PIXEL_PER_TICK);
                  return Math.max(MIN_X_TICKS, computedLimit || MIN_X_TICKS);
                },
                color: window
                  .getComputedStyle(document.body)
                  .getPropertyValue("--text-primary")
                  .trim(),
              },
            },
            y: {
              beginAtZero: false,
              ticks: {
                color: window
                  .getComputedStyle(document.body)
                  .getPropertyValue("--text-primary")
                  .trim(),
              },
            },
          },
        },
      });

      // Paksa resize sekali setelah render agar grafik tidak gepeng saat pertama dimuat
      requestAnimationFrame(() => {
        if (priceChart) {
          priceChart.resize();
        }
      });
    } else {
      // Jika tidak ada data, clear canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // === RENDER TABEL: TAMPILKAN SEMUA DATA (BUKAN HANYA 10) ===
    // === RENDER TABEL: URUT ASCENDING (lama → baru), WAKTU INDONESIA ===
    tbody.innerHTML = "";
    if (series.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Tidak ada data</td></tr>`;
    } else {
      // 🔥 TIDAK DIBALIK — biarkan urutan asli (dari API: lama → baru)
      // Jika API mengembalikan data dari lama ke baru, langsung pakai `series`
      // Jika tidak, pastikan backend mengirim ascending

      series.forEach((d) => {
        const open = parseFloat(d.open) || 0;
        const high = parseFloat(d.high) || 0;
        const low = parseFloat(d.low) || 0;
        const close = parseFloat(d.close) || 0;
        const volumeEth = parseFloat(d.volume) || 0;
        const volumeUsdt = volumeEth * close;

        // 🔥 Konversi ke waktu Indonesia (WIB = Asia/Jakarta)
        const timeId = new Date(d.timestamp + "Z").toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour12: false,
        });

        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${timeId}</td>
      <td>${open.toFixed(2)}</td>
      <td>${high.toFixed(2)}</td>
      <td>${low.toFixed(2)}</td>
      <td>${close.toFixed(2)}</td>
      <td>${volumeEth.toFixed(4)}</td>
      <td>${volumeUsdt.toFixed(2)}</td>
    `;
        tbody.appendChild(tr);
      });
    }

    statusEl.textContent = `Menampilkan ${data.symbol} untuk ${data.days} hari terakhir (interval ${data.timeframe}).`;
    statusEl.classList.remove("error");
    statusEl.classList.add("success");
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Gagal mengambil data harga (cek backend & koneksi).";
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error memuat data</td></tr>`;
    statusEl.classList.add("error");
    statusEl.classList.remove("success");
  }
}

function setupHomePage() {
  const rangeButtons = document.querySelectorAll(".range-btn");
  rangeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      rangeButtons.forEach((b) => b.classList.remove("primary"));
      btn.classList.add("primary");
      const days = parseInt(btn.dataset.days, 10);
      loadHistory(days);
    });
  });
}
