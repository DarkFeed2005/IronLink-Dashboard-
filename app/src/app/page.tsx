"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function Dashboard() {
  useEffect(() => {
    // Ensure this runs only once on mount or when chart.js loads
    if (typeof window !== "undefined" && (window as any).Chart) {
      initDashboard();
    }
  }, []);

  const initDashboard = () => {
    // Sparklines
    function makeSpark(id: string, data: number[]) {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = ""; // Clear existing for hot reloads
      const mx = Math.max(...data);
      data.forEach((v, i) => {
        const b = document.createElement("div");
        b.className = "spark-bar" + (i === data.length - 1 ? " active" : "");
        b.style.height = Math.round((v / mx) * 100) + "%";
        el.appendChild(b);
      });
    }
    makeSpark("spark1", [40, 55, 45, 60, 52, 70, 84]);
    makeSpark("spark2", [80, 95, 88, 102, 91, 108, 124]);
    makeSpark("spark3", [210, 195, 230, 218, 240, 225, 264]);
    makeSpark("spark4", [350, 340, 345, 338, 342, 335, 335]);

    // Counters
    function animCount(id: string, target: number, isDollar: boolean, dur = 1100) {
      const el = document.getElementById(id);
      if (!el) return;
      const s = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - s) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        const v = Math.round(e * target);
        el.textContent = isDollar ? "$" + v.toLocaleString() : v.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    setTimeout(() => {
      animCount("rev-val", 84200, true);
      animCount("ord-val", 124, false);
      animCount("cust-val", 264, false);
      animCount("aov-val", 335, true);
    }, 200);

    // Revenue chart
    const chartEl = document.getElementById("revenueChart") as HTMLCanvasElement;
    const rCtx = chartEl?.getContext("2d");
    let revChart: any;
    const ds: any = {
      "7d": {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        rev: [8200, 9500, 7800, 11200, 9800, 13400, 12800],
        ord: [22, 28, 19, 31, 26, 38, 35],
      },
      "1m": {
        labels: ["W1", "W2", "W3", "W4"],
        rev: [18000, 22000, 19500, 24700],
        ord: [52, 64, 58, 72],
      },
      "3m": {
        labels: ["Jan", "Feb", "Mar"],
        rev: [62000, 71000, 84000],
        ord: [182, 208, 246],
      },
      "1y": {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        rev: [52000, 48000, 61000, 57000, 64000, 72000, 69000, 78000, 82000, 79000, 88000, 84000],
        ord: [151, 140, 178, 166, 187, 210, 201, 228, 240, 231, 257, 246],
      },
    };
    (window as any).buildChart = function(k: string) {
      if (revChart) revChart.destroy();
      const d = ds[k];
      if (!rCtx) return;
      revChart = new (window as any).Chart(rCtx, {
        type: "line",
        data: {
          labels: d.labels,
          datasets: [
            {
              label: "Revenue",
              data: d.rev,
              borderColor: "#00e676",
              backgroundColor: "rgba(0,230,118,.07)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#00e676",
              pointRadius: 3,
              pointHoverRadius: 5,
              yAxisID: "y",
            },
            {
              label: "Orders",
              data: d.ord,
              borderColor: "#2979ff",
              backgroundColor: "rgba(41,121,255,.07)",
              borderWidth: 2,
              tension: 0.4,
              fill: false,
              borderDash: [4, 3],
              pointBackgroundColor: "#2979ff",
              pointRadius: 2,
              pointHoverRadius: 4,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: "#1c1c1c", borderColor: "#333", borderWidth: 1, titleColor: "#f0f0f0", bodyColor: "#888", padding: 10 },
          },
          scales: {
            x: { grid: { color: "#1a1a1a" }, ticks: { color: "#555", font: { size: 10 }, maxTicksLimit: 7 } },
            y: { grid: { color: "#1a1a1a" }, ticks: { color: "#555", font: { size: 10 }, callback: (v:any) => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "K" : v) }, position: "left" },
            y1: { grid: { display: false }, ticks: { color: "#555", font: { size: 10 } }, position: "right" },
          },
        },
      });
    };
    (window as any).buildChart("7d");

    // Donut
    const donutEl = document.getElementById("donutChart") as HTMLCanvasElement;
    if (donutEl) {
      new (window as any).Chart(donutEl, {
        type: "doughnut",
        data: {
          labels: ["Exhaust", "Brakes", "Suspension", "ECU", "Other"],
          datasets: [{ data: [34, 22, 19, 15, 10], backgroundColor: ["#00e676", "#2979ff", "#ffab00", "#aa00ff", "#444"], borderWidth: 0, hoverOffset: 4 }],
        },
        options: { responsive: false, cutout: "70%", plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1c1c1c", bodyColor: "#f0f0f0", padding: 8 } } },
      });
    }

    // Inventory
    const invList = document.getElementById("inv-list");
    if (invList) {
      invList.innerHTML = "";
      [
        { name: "Akrapovic Exhaust", pct: 78, count: "78/100" },
        { name: "Brembo Z04 Pads", pct: 45, count: "45/100", low: true },
        { name: "Öhlins FGR 300", pct: 92, count: "23/25" },
        { name: "STM Slipper Clutch", pct: 30, count: "6/20", low: true },
        { name: "Ducati Corse ECU", pct: 65, count: "13/20" },
      ].forEach((i) => {
        const c = i.low ? "var(--red)" : i.pct > 70 ? "var(--green)" : "var(--amber)";
        invList.innerHTML += `<div class="inv-item"><div class="inv-row"><span class="inv-name">${i.name}</span><span class="inv-count" style="color:${c}">${i.count}</span></div><div class="inv-bar-track"><div class="inv-bar-fill" style="width:0%;background:${c}" data-pct="${i.pct}"></div></div></div>`;
      });
      setTimeout(() => document.querySelectorAll(".inv-bar-fill").forEach((b: any) => (b.style.width = b.dataset.pct + "%")), 400);
    }

    // Activity
    const acts = [
      { icon: "ti-shopping-cart", cls: "green", text: "<strong>New order</strong> #7F2B91 — Akrapovic Exhaust", time: "2 min ago" },
      { icon: "ti-user-plus", cls: "blue", text: "<strong>New customer</strong> Marco R. registered", time: "8 min ago" },
      { icon: "ti-truck", cls: "purple", text: "<strong>Order #58E7EB</strong> shipped via DHL", time: "15 min ago" },
      { icon: "ti-alert-triangle", cls: "amber", text: "<strong>Low stock</strong> STM Clutch — 6 left", time: "22 min ago" },
      { icon: "ti-star", cls: "green", text: "<strong>5-star review</strong> on Öhlins FGR 300", time: "41 min ago" },
    ];
    const aEl = document.getElementById("activity-list");
    if (aEl) {
      aEl.innerHTML = "";
      acts.forEach((a, i) => {
        aEl.innerHTML += `<div class="activity-item" style="animation-delay:${0.3 + i * 0.05}s"><div class="activity-icon ${a.cls}"><i class="ti ${a.icon}"></i></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></div>`;
      });
    }

    // Geo
    const geoList = document.getElementById("geo-list");
    if (geoList) {
      geoList.innerHTML = "";
      [
        { flag: "🇺🇸", country: "United States", pct: 45, val: "$37.9K" },
        { flag: "🇬🇧", country: "United Kingdom", pct: 22, val: "$18.5K" },
        { flag: "🇩🇪", country: "Germany", pct: 14, val: "$11.8K" },
        { flag: "🇦🇺", country: "Australia", pct: 11, val: "$9.3K" },
        { flag: "🇯🇵", country: "Japan", pct: 8, val: "$6.7K" },
      ].forEach((g) => {
        geoList.innerHTML += `<div class="geo-item"><div class="geo-flag">${g.flag}</div><div class="geo-info"><div class="geo-country">${g.country}</div><div class="geo-bar-wrap"><div class="geo-bar" style="width:0%" data-pct="${g.pct}"></div></div></div><div class="geo-val">${g.val}</div></div>`;
      });
      setTimeout(() => document.querySelectorAll(".geo-bar").forEach((b: any) => (b.style.width = b.dataset.pct + "%")), 500);
    }

    // Orders table
    const oBody = document.getElementById("orders-body");
    if (oBody) {
      oBody.innerHTML = "";
      [
        { id: "#7F2B91", product: "Akrapovic Exhaust", customer: "Marco R.", amount: "$1,420", status: "processing" },
        { id: "#58E7EB", product: "STM Slipper Clutch", customer: "Kalana D.", amount: "$680", status: "paid" },
        { id: "#A1C3D9", product: "Öhlins FGR 300", customer: "Lena S.", amount: "$2,100", status: "shipped" },
        { id: "#3E9F12", product: "Brembo Z04 Pads", customer: "James T.", amount: "$340", status: "paid" },
        { id: "#88BC44", product: "Ducati Corse ECU", customer: "Ana M.", amount: "$890", status: "pending" },
      ].forEach((o) => {
        oBody.innerHTML += `<tr><td><span class="order-id">${o.id}</span></td><td style="font-weight:600">${o.product}</td><td style="color:var(--muted)">${o.customer}</td><td style="font-weight:700">${o.amount}</td><td><span class="status-pill ${o.status}">${o.status.toUpperCase()}</span></td></tr>`;
      });
    }

    // Products
    const pList = document.getElementById("product-list");
    if (pList) {
      pList.innerHTML = "";
      [
        { name: "Akrapovic Full System Exhaust", cat: "Exhaust", rev: "$28,400", units: "20 units" },
        { name: "Öhlins FGR 300 Fork Kit", cat: "Suspension", rev: "$18,900", units: "9 units" },
        { name: "Ducati Corse ECU Flash", cat: "Electronics", rev: "$14,200", units: "16 units" },
        { name: "Brembo Z04 Front Pads", cat: "Brakes", rev: "$9,800", units: "29 units" },
        { name: "STM Slipper Clutch Kit", cat: "Drivetrain", rev: "$7,600", units: "11 units" },
      ].forEach((p, i) => {
        pList.innerHTML += `<div class="product-item"><div class="product-rank ${i === 0 ? "top" : ""}">${i + 1}</div><div class="product-info"><div class="product-name">${p.name}</div><div class="product-cat">${p.cat}</div></div><div><div class="product-revenue">${p.rev}</div><div class="product-units">${p.units}</div></div></div>`;
      });
    }

    // Live activity ticker
    let aIdx = 0;
    const newActs = [
      { icon: "ti-shopping-cart", cls: "green", text: "<strong>Flash sale</strong> triggered — 15% off Exhaust" },
      { icon: "ti-user", cls: "blue", text: "<strong>New visitor</strong> from Tokyo viewing ECU kits" },
      { icon: "ti-check", cls: "green", text: "<strong>Payment confirmed</strong> #9A1F33 — $1,850" },
    ];
    (window as any).tickerInterval = setInterval(() => {
      const a = newActs[aIdx++ % newActs.length];
      const item = document.createElement("div");
      item.className = "activity-item";
      item.style.cssText = "opacity:0;transform:translateX(-8px);transition:all .3s";
      item.innerHTML = `<div class="activity-icon ${a.cls}"><i class="ti ${a.icon}"></i></div><div><div class="activity-text">${a.text}</div><div class="activity-time">Just now</div></div>`;
      const list = document.getElementById("activity-list");
      if (list) {
        list.insertBefore(item, list.firstChild);
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateX(0)";
        }, 50);
        if (list.children.length > 6) list.removeChild(list.lastChild!);
      }
    }, 6000);
  };

  useEffect(() => {
    return () => {
      if ((window as any).tickerInterval) {
        clearInterval((window as any).tickerInterval);
      }
    };
  }, []);

  const switchPeriod = (el: any, k: string) => {
    document.querySelectorAll(".tab-pill").forEach((p) => p.classList.remove("active"));
    el.classList.add("active");
    if ((window as any).buildChart) {
      (window as any).buildChart(k);
    }
  };

  const openSidebar = () => {
    document.getElementById("sidebar")?.classList.add("open");
    document.getElementById("overlay")?.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeSidebar = () => {
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("overlay")?.classList.remove("open");
    document.body.style.overflow = "";
  };

  const handleMobileNavClick = (e: any) => {
    document.querySelectorAll(".mobile-nav-item").forEach((i) => i.classList.remove("active"));
    e.currentTarget.classList.add("active");
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" onLoad={() => initDashboard()} />

      <h2 style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        IronLink e-commerce dashboard
      </h2>

      <div className="overlay" id="overlay" onClick={closeSidebar}></div>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">IL</div>
            <div className="logo-text">
              Iron<span>Link</span>
            </div>
            <button className="close-sidebar" onClick={closeSidebar} aria-label="Close menu">
              <i className="ti ti-x"></i>
            </button>
          </div>
          <div className="nav-section">Overview</div>
          <div className="nav-item active" onClick={closeSidebar}>
            <i className="ti ti-layout-dashboard"></i>Dashboard<span className="nav-badge">New</span>
          </div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-chart-line"></i>Analytics
          </div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-report"></i>Reports
          </div>
          <div className="nav-section">Commerce</div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-shopping-bag"></i>Orders<span className="nav-badge red">3</span>
          </div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-package"></i>Products
          </div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-category"></i>Inventory
          </div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-tag"></i>Promotions
          </div>
          <div className="nav-section">Customers</div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-users"></i>Customers
          </div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-star"></i>Reviews
          </div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-ticket"></i>Support<span className="nav-badge red">1</span>
          </div>
          <div className="nav-section">Settings</div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-settings"></i>Settings
          </div>
          <div className="nav-item" onClick={closeSidebar}>
            <i className="ti ti-plug"></i>Integrations
          </div>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="avatar">K</div>
              <div className="user-info">
                <div className="user-name">Kalana</div>
                <div className="user-role">Administrator</div>
              </div>
              <span className="plan-badge">PRO</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <button className="menu-btn" onClick={openSidebar} aria-label="Open menu">
              <i className="ti ti-menu-2"></i>
            </button>
            <div className="page-title">Dashboard</div>
            <div className="live-badge">
              <div className="live-dot"></div>Live
            </div>
            <div className="search-box">
              <i className="ti ti-search" style={{ fontSize: "14px" }}></i>Search…
              <span style={{ marginLeft: "auto", fontSize: "10px", background: "#222", padding: "2px 6px", borderRadius: "4px" }}>
                ⌘K
              </span>
            </div>
            <div className="icon-btn">
              <i className="ti ti-bell"></i>
              <div className="notif-dot"></div>
            </div>
            <div className="icon-btn" style={{ display: "none" }} id="filter-btn">
              <i className="ti ti-adjustments-horizontal"></i>
            </div>
            <div className="icon-btn">
              <i className="ti ti-download"></i>
            </div>
          </div>

          <div className="content">
            {/* Welcome */}
            <div className="welcome-bar">
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      background: "var(--green)",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "pulse 1.4s infinite",
                    }}
                  ></span>
                  RIDER PLAN · ADMIN
                </div>
                <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-.5px" }}>Welcome back, Kalana</h1>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>IronLink store overview</p>
              </div>
              <div className="welcome-actions">
                <button
                  className="btn-outline"
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    btn.textContent = "Exported!";
                    setTimeout(() => {
                      btn.innerHTML = '<i class="ti ti-download" style="font-size:15px"></i>Export';
                    }, 1500);
                  }}
                >
                  <i className="ti ti-download" style={{ fontSize: "15px" }}></i>Export
                </button>
                <button className="btn-primary">
                  <i className="ti ti-plus" style={{ fontSize: "15px" }}></i>New Order
                </button>
              </div>
            </div>

            {/* KPI */}
            <div className="kpi-grid">
              <div className="kpi-card green">
                <div className="kpi-glow"></div>
                <div className="kpi-icon">
                  <i className="ti ti-currency-dollar"></i>
                </div>
                <div className="kpi-label">Revenue</div>
                <div className="kpi-value" id="rev-val">
                  $0
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span className="kpi-delta up">
                    <i className="ti ti-trending-up" style={{ fontSize: "10px" }}></i>+18.4%
                  </span>
                  <span className="kpi-sub">vs last month</span>
                </div>
                <div className="sparkline" id="spark1"></div>
              </div>
              <div className="kpi-card blue">
                <div className="kpi-glow"></div>
                <div className="kpi-icon">
                  <i className="ti ti-shopping-cart"></i>
                </div>
                <div className="kpi-label">Orders</div>
                <div className="kpi-value" id="ord-val">
                  0
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span className="kpi-delta up">
                    <i className="ti ti-trending-up" style={{ fontSize: "10px" }}></i>+9.2%
                  </span>
                  <span className="kpi-sub">0 in progress</span>
                </div>
                <div className="sparkline" id="spark2"></div>
              </div>
              <div className="kpi-card amber">
                <div className="kpi-glow"></div>
                <div className="kpi-icon">
                  <i className="ti ti-users"></i>
                </div>
                <div className="kpi-label">Customers</div>
                <div className="kpi-value" id="cust-val">
                  0
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span className="kpi-delta up">
                    <i className="ti ti-trending-up" style={{ fontSize: "10px" }}></i>+5.7%
                  </span>
                  <span className="kpi-sub">+34 this week</span>
                </div>
                <div className="sparkline" id="spark3"></div>
              </div>
              <div className="kpi-card purple">
                <div className="kpi-glow"></div>
                <div className="kpi-icon">
                  <i className="ti ti-chart-dots"></i>
                </div>
                <div className="kpi-label">Avg. Order</div>
                <div className="kpi-value" id="aov-val">
                  $0
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span className="kpi-delta down">
                    <i className="ti ti-trending-down" style={{ fontSize: "10px" }}></i>-2.1%
                  </span>
                  <span className="kpi-sub">$342 last mo.</span>
                </div>
                <div className="sparkline" id="spark4"></div>
              </div>
            </div>

            {/* Charts row */}
            <div className="charts-row">
              <div className="chart-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Revenue & Orders</div>
                    <div className="card-sub">Monthly performance</div>
                  </div>
                  <div className="tab-pills">
                    <div className="tab-pill active" onClick={(e) => switchPeriod(e.currentTarget, "7d")}>
                      7D
                    </div>
                    <div className="tab-pill" onClick={(e) => switchPeriod(e.currentTarget, "1m")}>
                      1M
                    </div>
                    <div className="tab-pill" onClick={(e) => switchPeriod(e.currentTarget, "3m")}>
                      3M
                    </div>
                    <div className="tab-pill" onClick={(e) => switchPeriod(e.currentTarget, "1y")}>
                      1Y
                    </div>
                  </div>
                </div>
                <div style={{ position: "relative", height: "200px" }}>
                  <canvas id="revenueChart" role="img" aria-label="Line chart of revenue and orders">
                    Revenue and order trend chart
                  </canvas>
                </div>
              </div>
              <div className="chart-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Sales by category</div>
                    <div className="card-sub">This month</div>
                  </div>
                </div>
                <div className="donut-wrap">
                  <canvas id="donutChart" width="150" height="150" role="img" aria-label="Donut chart of sales categories">
                    Category breakdown
                  </canvas>
                  <div className="donut-center">
                    <div className="donut-val">$84K</div>
                    <div className="donut-label">Total</div>
                  </div>
                </div>
                <div className="legend-list">
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: "#00e676" }}></div>
                    <span className="legend-name">Exhaust</span>
                    <span className="legend-pct">34%</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: "#2979ff" }}></div>
                    <span className="legend-name">Brakes</span>
                    <span className="legend-pct">22%</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: "#ffab00" }}></div>
                    <span className="legend-name">Suspension</span>
                    <span className="legend-pct">19%</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: "#aa00ff" }}></div>
                    <span className="legend-name">ECU / Electronics</span>
                    <span className="legend-pct">15%</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: "#555" }}></div>
                    <span className="legend-name">Other</span>
                    <span className="legend-pct">10%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 3-col */}
            <div className="bottom-row">
              <div className="inv-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Inventory levels</div>
                    <div className="card-sub">Top 5 SKUs</div>
                  </div>
                </div>
                <div id="inv-list"></div>
              </div>
              <div className="activity-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Live activity</div>
                    <div className="card-sub">Real-time updates</div>
                  </div>
                  <div className="live-badge" style={{ fontSize: "10px", padding: "3px 8px" }}>
                    <div className="live-dot"></div>Now
                  </div>
                </div>
                <div id="activity-list"></div>
              </div>
              <div className="chart-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Top markets</div>
                    <div className="card-sub">Revenue by region</div>
                  </div>
                </div>
                <div id="geo-list"></div>
              </div>
            </div>

            {/* Orders + Products */}
            <div className="wide-row">
              <div className="orders-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Recent orders</div>
                    <div className="card-sub">Last 24 hours</div>
                  </div>
                  <button
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    View all <i className="ti ti-arrow-right" style={{ fontSize: "12px" }}></i>
                  </button>
                </div>
                <div className="table-wrap">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody id="orders-body"></tbody>
                  </table>
                </div>
              </div>
              <div className="chart-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Top products</div>
                    <div className="card-sub">By revenue this month</div>
                  </div>
                </div>
                <div id="product-list"></div>
              </div>
            </div>

            {/* Footer KPIs */}
            <div className="footer-row">
              <div className="footer-card">
                <div className="footer-icon" style={{ background: "var(--gdim)", color: "var(--green)" }}>
                  <i className="ti ti-heart"></i>
                </div>
                <div className="footer-val">5</div>
                <div className="footer-label">Saved parts</div>
              </div>
              <div className="footer-card">
                <div className="footer-icon" style={{ background: "var(--bdim)", color: "var(--blue2)" }}>
                  <i className="ti ti-ticket"></i>
                </div>
                <div className="footer-val">2</div>
                <div className="footer-label">Open tickets</div>
              </div>
              <div className="footer-card">
                <div className="footer-icon" style={{ background: "var(--adim)", color: "var(--amber)" }}>
                  <i className="ti ti-star"></i>
                </div>
                <div className="footer-val">4.8</div>
                <div className="footer-label">Avg. rating</div>
              </div>
              <div className="footer-card">
                <div className="footer-icon" style={{ background: "var(--pdim)", color: "var(--purple2)" }}>
                  <i className="ti ti-refresh"></i>
                </div>
                <div className="footer-val">94%</div>
                <div className="footer-label">Fulfillment</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <div className="mobile-nav-inner">
          <div className="mobile-nav-item active" onClick={handleMobileNavClick}>
            <i className="ti ti-layout-dashboard"></i>Home
          </div>
          <div className="mobile-nav-item" onClick={handleMobileNavClick}>
            <i className="ti ti-shopping-bag"></i>Orders
          </div>
          <div className="mobile-nav-item" onClick={handleMobileNavClick}>
            <i className="ti ti-package"></i>Products
          </div>
          <div className="mobile-nav-item" onClick={handleMobileNavClick}>
            <i className="ti ti-chart-bar"></i>Analytics
          </div>
          <div className="mobile-nav-item" onClick={(e) => { handleMobileNavClick(e); openSidebar(); }}>
            <i className="ti ti-menu-2"></i>More
          </div>
        </div>
      </nav>
    </>
  );
}
