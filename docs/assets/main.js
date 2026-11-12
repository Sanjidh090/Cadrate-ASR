(function () {
"use strict";
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var NS = "http://www.w3.org/2000/svg";
var INK = "#222", MUTED = "#6a6f76", FAINT = "#9aa1a9", TEAL = "#00897B";

/* ---------- tooltip ---------- */
var tip = document.getElementById("tip");
function showTip(html, x, y) {
  tip.innerHTML = html; tip.style.opacity = 1;
  var w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, x + 14)) + "px";
  var top = y - h - 12; if (top < 8) top = y + 16;
  tip.style.top = top + "px";
}
function hideTip() { tip.style.opacity = 0; }
function el(name, attrs, parent) {
  var e = document.createElementNS(NS, name);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

/* ---------- teaser: chunk strip ---------- */
var strip = document.getElementById("tz-chunks");
if (strip) {
  var amps = [0.1,0.15,0.5,0.8,0.6,0.3,0.1,0.55,0.9,0.7,0.85,0.4,0.15,0.6,0.75,0.5,0.2,0.65,0.95,0.8,0.55,0.3,0.12,0.1];
  var cells = amps.map(function (a) { var s = document.createElement("span"); s.style.height = Math.round(14 + a * 50) + "px"; strip.appendChild(s); return s; });
  var ci = 0;
  var tick = function () {
    cells.forEach(function (c, i) { c.className = i < ci ? "on" : (i === ci ? "cur" : ""); });
    ci = (ci + 1) % (cells.length + 6);
  };
  if (reduce) { ci = cells.length; tick(); } else { tick(); setInterval(tick, 160); }
}

/* ---------- Figure 1: streaming timeline ---------- */
var svg = document.getElementById("wave");
if (svg) (function () {
  var T = 4.0, AUDIO_END = 3.2, FINAL_T = 3.317;
  var W = 1000, LANE_TOP = 6, LANE_BOT = 112, AXIS_Y = 132;
  var x = function (t) { return t / T * W; };
  var seed = 7; var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  var words = [[0.32,0.62],[0.70,0.82],[0.95,1.45],[1.58,1.86],[2.00,2.36],[2.50,3.10]];
  var env = function (t) {
    var a = 0;
    for (var i = 0; i < words.length; i++) {
      var s = words[i][0], e = words[i][1];
      if (t >= s && t <= e) { var p = (t - s) / (e - s); a = Math.max(a, Math.pow(Math.sin(Math.PI * p), 0.7) * (0.65 + 0.35 * Math.sin(p * 9 + i))); }
    }
    return a;
  };
  var mid = (LANE_TOP + LANE_BOT) / 2;
  for (var c = 0; c <= 40; c++) {
    el("line", {x1:x(c*0.1), x2:x(c*0.1), y1:LANE_TOP, y2:LANE_BOT, stroke: c % 10 === 0 ? "#cfd4da" : "#eef0f2", "stroke-width":1}, svg);
  }
  el("rect", {x:x(AUDIO_END), y:LANE_TOP, width:x(T)-x(AUDIO_END), height:LANE_BOT-LANE_TOP, fill:"#f4f6f7"}, svg);
  el("text", {x:x(T)-8, y:LANE_BOT-10, "text-anchor":"end", "font-size":12, fill:FAINT, "font-family":"Source Sans 3, sans-serif"}, svg).textContent = "tail padding";
  var chunkHi = el("rect", {x:0, y:LANE_TOP, width:x(0.1), height:LANE_BOT-LANE_TOP, fill:"#E2F1EE"}, svg);
  var bars = [];
  for (var i = 0; i < 320; i++) {
    var t = i * 0.01 + 0.005;
    var a = env(t) * (0.55 + 0.45 * rnd()) + 0.035 * rnd();
    var h = Math.max(1.5, a * (LANE_BOT - LANE_TOP - 14));
    bars.push({t:t, r: el("rect", {x:x(i*0.01)+0.4, y:mid-h/2, width:x(0.01)-0.8, height:h, rx:0.8, fill:"#cfd4da"}, svg)});
  }
  el("line", {x1:0, x2:W, y1:AXIS_Y-12, y2:AXIS_Y-12, stroke:"#e0e3e6"}, svg);
  for (var s = 0; s <= 8; s++) {
    el("text", {x: x(s*0.5) + (s===0?1:(s===8?-1:0)), y:AXIS_Y+8, "font-size":12, fill:MUTED, "text-anchor": s===0?"start":(s===8?"end":"middle"), "font-family":"Source Sans 3, sans-serif"}, svg).textContent = (s*0.5).toFixed(1) + " s";
  }
  var vline = function (t, color, dash) { return el("line", {x1:x(t), x2:x(t), y1:0, y2:LANE_BOT, stroke:color, "stroke-width":1.5, "stroke-dasharray":dash || "none"}, svg); };
  var vFirst = vline(0.70, FAINT, "3 3"), vStable = vline(1.38, TEAL), vEnd = vline(AUDIO_END, INK), vFinal = vline(FINAL_T, INK);
  var bracket = el("rect", {x:x(AUDIO_END), y:0, width:x(FINAL_T)-x(AUDIO_END), height:6, fill:INK}, svg);
  var head = el("line", {x1:0, x2:0, y1:0, y2:LANE_BOT, stroke:INK, "stroke-width":2}, svg);
  var headDot = el("circle", {cx:0, cy:LANE_BOT, r:4, fill:INK}, svg);

  var pos = function (id, t) { document.getElementById(id).style.left = (t / T * 100) + "%"; };
  pos("m-first", 0.70); pos("m-stable", 1.38); pos("m-ttlt", FINAL_T);

  var hyps = [
    [0.70, ["sad"]],
    [1.00, ["said","a"]],
    [1.38, ["set","a"]],
    [1.80, ["set","a","time"]],
    [2.20, ["set","a","timer","four"]],
    [2.60, ["set","a","timer","for","10"]],
    [3.00, ["set","a","timer","for","10","minute"]],
    [FINAL_T, ["set","a","timer","for","10","minutes"]]
  ];
  var fin = hyps[hyps.length-1][1];
  var settleAt = fin.map(function (w, idx) {
    var ts = null;
    for (var k = hyps.length - 1; k >= 0; k--) { if (hyps[k][1][idx] === w) ts = hyps[k][0]; else break; }
    return ts;
  });
  var hypEl = document.getElementById("hyp"), timeEl = document.getElementById("hyp-time"), logEl = document.getElementById("log");
  var lastIdx = -2;
  var vis = function (node, on) { node.style.opacity = on ? 1 : 0; };

  function render(t) {
    for (var i = 0; i < bars.length; i++) bars[i].r.setAttribute("fill", bars[i].t <= t ? INK : "#cfd4da");
    var ci = Math.min(39, Math.floor(Math.min(t, T - 0.0001) / 0.1));
    chunkHi.setAttribute("x", x(ci * 0.1)); chunkHi.style.opacity = t > 0 && t < T ? 1 : 0;
    head.setAttribute("x1", x(t)); head.setAttribute("x2", x(t)); headDot.setAttribute("cx", x(t));
    vis(vFirst, t >= 0.70); vis(vStable, t >= 1.38); vis(vEnd, t >= AUDIO_END); vis(vFinal, t >= FINAL_T); vis(bracket, t >= FINAL_T);
    document.getElementById("m-first").classList.toggle("off", t < 0.70);
    document.getElementById("m-stable").classList.toggle("off", t < 1.38);
    document.getElementById("m-ttlt").classList.toggle("off", t < FINAL_T);
    timeEl.textContent = "Transcript at " + t.toFixed(2) + " s";
    var idx = -1; for (var k = 0; k < hyps.length; k++) if (hyps[k][0] <= t) idx = k;
    if (idx === lastIdx) return;
    lastIdx = idx;
    hypEl.innerHTML = "";
    if (idx >= 0) hyps[idx][1].forEach(function (w, j) {
      var sp = document.createElement("span");
      var settled = settleAt[j] !== null && settleAt[j] <= hyps[idx][0] && fin[j] === w;
      sp.className = "w " + (settled ? "done" : "tent"); sp.textContent = w; hypEl.appendChild(sp);
    });
    if (idx < hyps.length - 1) { var cr = document.createElement("span"); cr.className = "caret"; hypEl.appendChild(cr); }
    logEl.innerHTML = "";
    for (var m = 0; m <= idx; m++) {
      var li = document.createElement("li");
      li.className = m === hyps.length - 1 ? "fin" : "rev";
      var a = document.createElement("span"); a.className = "t"; a.textContent = hyps[m][0].toFixed(2) + " s";
      var b = document.createElement("span"); b.className = "h"; b.textContent = hyps[m][1].join(" ") + (m === hyps.length - 1 ? "  (final)" : "");
      li.appendChild(a); li.appendChild(b); logEl.appendChild(li);
    }
  }

  var raf = null, cur = 0;
  function play(from) {
    cancelAnimationFrame(raf); var start = null, t0 = from || 0;
    function step(ts) {
      if (start === null) start = ts;
      cur = Math.min(T, t0 + (ts - start) / 1000);
      render(cur);
      if (cur < T) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
  }
  document.getElementById("replay").addEventListener("click", function () { if (reduce) render(T); else play(0); });
  var tFrom = function (e) { var r = svg.getBoundingClientRect(); return Math.max(0, Math.min(T, (e.clientX - r.left) / r.width * T)); };
  var dragging = false;
  svg.addEventListener("pointerdown", function (e) { dragging = true; cancelAnimationFrame(raf); svg.setPointerCapture(e.pointerId); cur = tFrom(e); render(cur); });
  svg.addEventListener("pointermove", function (e) { if (dragging) { cur = tFrom(e); render(cur); } });
  svg.addEventListener("pointerup", function () { dragging = false; });
  svg.setAttribute("tabindex", "0");
  svg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); cancelAnimationFrame(raf);
      cur = Math.max(0, Math.min(T, cur + (e.key === "ArrowRight" ? 0.1 : -0.1))); render(cur);
    }
  });
  render(0);
  if (reduce) render(T);
  else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(function () { play(0); }, 300); } }, {threshold: 0.35});
    io.observe(document.getElementById("stream"));
  } else play(0);
})();

/* ---------- tabs ---------- */
document.querySelectorAll("[data-tabs]").forEach(function (box) {
  var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
  function select(t) {
    tabs.forEach(function (o) {
      var on = o === t;
      o.setAttribute("aria-selected", on ? "true" : "false");
      o.tabIndex = on ? 0 : -1;
      document.getElementById(o.getAttribute("aria-controls")).hidden = !on;
    });
    if (t.id === "t-perc") drawPerc();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n); }
    });
  });
});

/* ---------- decoding sweep ---------- */
var abl = [
  ["INT8, beam 4, pad 1.28 s",19.44,12.58,277,1],
  ["INT8, beam 4",19.47,12.59,157,1],
  ["INT8, beam 4, blank 0.5",19.53,12.64,183],
  ["INT8, beam 6",19.53,12.72,1086],
  ["INT8, beam 4, blank 0.25",19.54,12.65,180],
  ["FP32, beam 4",19.64,12.82,457],
  ["FP32, beam 8",19.67,12.81,553],
  ["INT8, beam 12",19.73,12.88,1496],
  ["INT8, beam 4, pad 0.64 s",19.96,12.84,214],
  ["INT8, beam 4, blank 0.75",20.27,13.43,204],
  ["FP32, greedy",21.83,14.53,269],
  ["FP32, greedy, blank 0.5",21.92,14.60,409],
  ["INT8, greedy (baseline)",22.02,14.70,140],
  ["FP32, greedy, blank 1.0",22.55,15.44,2799],
  ["FP32, greedy, blank 2.0",24.83,17.72,513]
];
var ab = document.getElementById("ablation");
if (ab) abl.forEach(function (r) {
  var tr = document.createElement("tr"); if (r[4]) tr.className = "pick";
  var pct = Math.max(1.5, r[3] / 2799 * 100);
  tr.innerHTML = "<td>" + r[0] + "</td><td class=\"n\">" + r[1].toFixed(2) + "</td><td class=\"n\">" + r[2].toFixed(2) +
    "</td><td><div class=\"dbar\"><div class=\"track\"><span style=\"width:" + pct.toFixed(1) + "%\"></span></div><em>" + r[3].toLocaleString("en-US") + " s</em></div></td>";
  ab.appendChild(tr);
});

/* ---------- etiology heatmap ---------- */
var etio = ["ALS","Cerebral palsy","Down syndrome","Parkinson's","Stroke"], etioN = [107,120,81,152,41];
var heat = {
  wer: {"Zipformer E19 (ours)":[23.1,36.0,40.5,26.0,29.4], "FastConformer":[56.1,69.6,74.5,42.8,65.7], "Nemotron INT4":[48.5,66.2,68.6,35.8,54.7]},
  cer: {"Zipformer E19 (ours)":[16.6,28.9,31.1,18.7,20.2], "FastConformer":[35.7,50.2,51.7,27.7,41.6], "Nemotron INT4":[39.4,59.2,60.3,27.2,44.1]}
};
var lo = [234,245,242], hi = [9,74,80];
function ramp(v) {
  var p = Math.pow(Math.max(0, Math.min(1, v / 75)), 0.9);
  var c = lo.map(function (l, i) { return Math.round(l + (hi[i] - l) * p); });
  return {bg: "rgb(" + c.join(",") + ")", fg: p > 0.48 ? "#fff" : INK};
}
var heatEl = document.getElementById("heat");
if (heatEl) {
  document.getElementById("ramp-bar").style.background = "linear-gradient(90deg," + ramp(0).bg + "," + ramp(37.5).bg + "," + ramp(75).bg + ")";
  var drawHeat = function (m) {
    var h = "<thead><tr><th>Model</th>" + etio.map(function (e, i) { return "<th>" + e + "<br><span style=\"font-weight:400;color:#6a6f76\">n = " + etioN[i] + "</span></th>"; }).join("") + "</tr></thead><tbody>";
    Object.keys(heat[m]).forEach(function (model, r) {
      h += "<tr><th scope=\"row\"" + (r === 0 ? " style=\"font-weight:600\"" : "") + ">" + model + "</th>";
      heat[m][model].forEach(function (v, i) {
        var c = ramp(v);
        h += "<td class=\"v\" style=\"background:" + c.bg + ";color:" + c.fg + "\" data-tip=\"<b>" + model + "</b><br>" + etio[i] + " (n = " + etioN[i] + ")<br>" + m.toUpperCase() + " " + v.toFixed(1) + "%\">" + v.toFixed(1) + "</td>";
      });
      h += "</tr>";
    });
    heatEl.innerHTML = h + "</tbody>";
  };
  drawHeat("wer");
  document.querySelectorAll(".seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".seg button").forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      drawHeat(b.dataset.m);
    });
  });
  heatEl.addEventListener("mousemove", function (e) { var td = e.target.closest("td.v"); if (td) showTip(td.dataset.tip, e.clientX, e.clientY); else hideTip(); });
  heatEl.addEventListener("mouseleave", hideTip);
}

/* ---------- perceptual chart ---------- */
var perc = [
  ["Clear",152,19.30,13.78,40.15,25.32,33.03,24.70],
  ["Slow",21,21.02,14.36,42.05,25.83,28.30,23.46],
  ["Muffled",30,23.08,14.64,40.00,24.77,38.46,26.56],
  ["Drowsy",25,28.68,21.18,67.55,45.43,49.81,39.61],
  ["Imprecise articulation",19,33.56,25.98,77.18,51.08,77.85,68.69],
  ["Stammered",16,33.95,26.18,72.84,49.34,70.37,60.13],
  ["Slurred",48,35.30,26.77,68.05,47.24,62.30,54.15],
  ["Unclear",46,57.28,44.52,89.74,65.93,90.40,81.01]
];
var rare = [
  ["Low volume",7,38.24,34.77,55.88,40.80,47.06,43.10],
  ["Shaky",7,48.05,33.14,75.32,49.86,75.32,67.99],
  ["Mumbled",4,40.30,29.70,79.10,52.73,79.10,71.21],
  ["Unintelligible",3,66.67,55.89,87.04,63.88,96.30,94.68]
];
var models = [["Zipformer E19 (ours)","#00897B",2],["FastConformer","#6B7FD7",4],["Nemotron INT4","#C27C0E",6]];
var tb = document.getElementById("perc-table");
if (tb) perc.concat(rare).forEach(function (r, i) {
  var tr = document.createElement("tr");
  tr.innerHTML = "<td>" + r[0] + (i >= perc.length ? " <span class=\"dim\">(rare)</span>" : "") + "</td><td class=\"n\">" + r[1] + "</td>" +
    r.slice(2).map(function (v, j) { return "<td class=\"n\"" + (j < 2 ? " style=\"font-weight:600\"" : "") + ">" + v.toFixed(2) + "</td>"; }).join("");
  tb.appendChild(tr);
});
var ps = document.getElementById("perc");
function drawPerc() {
  if (!ps) return;
  var width = ps.parentNode.clientWidth;
  if (!width) return;
  var narrow = width < 560;
  var LBL = narrow ? 112 : 200, RPAD = 36, BH = 7, GAP = 2, GROUP = 3 * BH + 2 * GAP, ROWGAP = 16, TOP = 4;
  var height = TOP + perc.length * (GROUP + ROWGAP) + 22;
  ps.setAttribute("viewBox", "0 0 " + width + " " + height);
  ps.setAttribute("height", height);
  ps.innerHTML = "";
  var plotW = width - LBL - RPAD;
  var sx = function (v) { return LBL + v / 100 * plotW; };
  [0,20,40,60,80,100].forEach(function (g) {
    el("line", {x1:sx(g), x2:sx(g), y1:0, y2:height-20, stroke: g === 0 ? "#b9c0c8" : "#eef0f2"}, ps);
    el("text", {x:sx(g), y:height-4, "text-anchor":"middle", "font-size":12, fill:MUTED}, ps).textContent = g + (g === 100 ? "% WER" : "");
  });
  perc.forEach(function (r, i) {
    var y0 = TOP + i * (GROUP + ROWGAP);
    var lt = el("text", {x:LBL-12, y:y0+GROUP/2+4.5, "text-anchor":"end", "font-size": narrow ? 12.5 : 14.5, fill:INK}, ps);
    lt.textContent = narrow && r[0].length > 14 ? "Imprecise artic." : r[0];
    if (!narrow) { var nt = el("tspan", {fill:FAINT, "font-size":12}, lt); nt.textContent = "  n=" + r[1]; }
    models.forEach(function (m, k) {
      var v = r[m[2]], y = y0 + k * (BH + GAP), w = sx(v) - sx(0), rr = 3.5;
      el("path", {d: "M" + sx(0) + "," + y + " h" + (w - rr) + " a" + rr + "," + rr + " 0 0 1 " + rr + "," + rr + " v" + (BH - 2 * rr) + " a" + rr + "," + rr + " 0 0 1 -" + rr + "," + rr + " h-" + (w - rr) + " z", fill: m[1]}, ps);
      if (k === 0) el("text", {x:sx(v)+6, y:y+BH-0.5, "font-size":12, "font-weight":600, fill:"#0B7A6D"}, ps).textContent = v.toFixed(1);
    });
    var hit = el("rect", {x:0, y:y0-ROWGAP/2, width:width, height:GROUP+ROWGAP, fill:"transparent"}, ps);
    hit.dataset.tip = "<b>" + r[0] + "</b> (n = " + r[1] + ")<br>" + models.map(function (m) {
      return "<span style=\"display:inline-block;width:8px;height:8px;border-radius:2px;background:" + m[1] + ";margin-right:6px\"></span>" + m[0] + ": " + r[m[2]].toFixed(2) + "%";
    }).join("<br>");
  });
}
drawPerc();
var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawPerc, 120); });
if (ps) {
  ps.addEventListener("mousemove", function (e) { var t = e.target; if (t.dataset && t.dataset.tip) showTip(t.dataset.tip, e.clientX, e.clientY); else hideTip(); });
  ps.addEventListener("mouseleave", hideTip);
}

/* ---------- nav highlight ---------- */
var links = Array.prototype.slice.call(document.querySelectorAll(".masthead nav a"));
var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
function onScroll() {
  var y = window.scrollY + 140, on = -1;
  secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top + window.scrollY <= y) on = i; });
  links.forEach(function (a, i) { a.classList.toggle("on", i === on); });
}
window.addEventListener("scroll", onScroll, {passive: true}); onScroll();

/* ---------- copy buttons ---------- */
document.querySelectorAll("[data-copy]").forEach(function (b) {
  b.addEventListener("click", function () {
    var node = document.getElementById(b.dataset.copy), txt = node.textContent.trim();
    var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1600); };
    var sel = function () { var r = document.createRange(); r.selectNodeContents(node); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Press Ctrl+C"; };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, sel); else sel();
  });
});
})();
