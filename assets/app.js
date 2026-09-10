(function () {
  "use strict";

  // ---------- PWA / service worker ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function (err) {
        console.warn("Service worker registration failed:", err);
      });
    });
  }

  // ---------- 多语言切换（Google 翻译整页翻译，主要服务海外访客） ----------
  var LANGS = [
    { code: "zh-CN", label: "简体中文" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "ru", label: "Русский" },
    { code: "pt", label: "Português" },
    { code: "ar", label: "العربية" }
  ];

  function currentLang() {
    try {
      var saved = localStorage.getItem("pdg-lang");
      if (saved) return saved;
    } catch (e) {}
    var m = document.cookie.match(/googtrans=\/zh-CN\/([^;]+)/);
    return m ? decodeURIComponent(m[1]) : "zh-CN";
  }

  function setLang(code) {
    var host = location.hostname;
    try { localStorage.setItem("pdg-lang", code); } catch (e) {}
    if (code === "zh-CN") {
      var kill = "expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = "googtrans=; " + kill;
    } else {
      var v = "googtrans=/zh-CN/" + code + ";path=/";
      document.cookie = v;
    }
    location.reload();
  }

  (function mountLangSwitcher() {
    var wrap = document.createElement("div");
    wrap.className = "lang-switch";
    var sel = document.createElement("select");
    sel.className = "lang-select";
    sel.setAttribute("aria-label", "语言 / Language");
    sel.title = "语言 / Language";
    LANGS.forEach(function (l) {
      var opt = document.createElement("option");
      opt.value = l.code;
      opt.textContent = l.label;
      if (l.code === currentLang()) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", function () { setLang(sel.value); });
    wrap.appendChild(sel);
    var nav = document.querySelector(".nav-links");
    if (nav) {
      nav.appendChild(wrap);
    } else {
      wrap.classList.add("floating");
      document.body.appendChild(wrap);
    }
  })();

  var gt = document.createElement("div");
  gt.id = "google_translate_element";
  gt.style.cssText = "position:fixed;left:-9999px;top:-9999px;";
  document.body.appendChild(gt);
  window.googleTranslateElementInit = function () {
    /* global google */
    new google.translate.TranslateElement({
      pageLanguage: "zh-CN",
      includedLanguages: "en,zh-CN,es,ja,ko,de,fr,ru,pt,ar",
      autoDisplay: false
    }, "google_translate_element");
  };
  var gts = document.createElement("script");
  gts.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  gts.async = true;
  (document.head || document.documentElement).appendChild(gts);

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
