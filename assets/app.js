(function () {
  "use strict";

  // ---------- Mobile nav ----------
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  // ---------- Back to top ----------
  var backTop = document.querySelector(".back-top");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 500);
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Generic filter: chips + search ----------
  // buttons have data-filter; items have data-category (space separated);
  // search input (data-search-target) filters by data-search text.
  document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
    var targetSel = bar.getAttribute("data-filter-bar");
    var items = document.querySelectorAll(targetSel);
    var buttons = bar.querySelectorAll(".chip");
    var search = document.querySelector(bar.getAttribute("data-search"));

    function apply() {
      var active = bar.querySelector(".chip.active");
      var cat = active ? active.getAttribute("data-filter") : "all";
      var q = search ? search.value.trim().toLowerCase() : "";
      items.forEach(function (item) {
        var cats = (item.getAttribute("data-category") || "").split(" ");
        var matchCat = cat === "all" || cats.indexOf(cat) !== -1;
        var text = (item.getAttribute("data-search") || "").toLowerCase();
        var matchQ = !q || text.indexOf(q) !== -1;
        item.classList.toggle("hidden", !(matchCat && matchQ));
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);
  });

  // ---------- Glossary search ----------
  var glossSearch = document.querySelector("#glossary-search");
  if (glossSearch) {
    var terms = document.querySelectorAll(".glossary-list .term");
    glossSearch.addEventListener("input", function () {
      var q = glossSearch.value.trim().toLowerCase();
      terms.forEach(function (t) {
        var text = (t.getAttribute("data-search") || "").toLowerCase();
        t.classList.toggle("hidden", q.length > 0 && text.indexOf(q) === -1);
      });
    });
  }

  // ---------- Roadmap checkboxes with localStorage ----------
  var roadmap = document.querySelector("#roadmap");
  if (roadmap) {
    var KEY = "protein-design-roadmap-v1";
    var boxes = roadmap.querySelectorAll('input[type="checkbox"]');
    var fill = document.querySelector("#roadmap-progress-fill");
    var label = document.querySelector("#roadmap-progress-label");

    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }

    function save() {
      var done = {};
      boxes.forEach(function (b, i) { done[b.dataset.key || String(i)] = b.checked; });
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      var count = 0;
      boxes.forEach(function (b) { if (b.checked) count++; });
      if (fill) fill.style.width = (count / boxes.length * 100) + "%";
      if (label) label.textContent = "已完成 " + count + " / " + boxes.length + " 项";
    }

    boxes.forEach(function (b) {
      var k = b.dataset.key || "";
      if (k && saved[k]) b.checked = true;
      b.addEventListener("change", function () {
        var task = b.closest(".task");
        if (task) task.classList.toggle("done", b.checked);
        save();
      });
      if (b.checked) {
        var task = b.closest(".task");
        if (task) task.classList.add("done");
      }
    });
    save();
  }
})();
