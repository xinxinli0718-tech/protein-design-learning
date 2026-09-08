/* 付费解锁：课程正文/自测默认隐藏，输入兑换码后本机解锁。
   注意：这是静态站点的轻量方案（防君子不防高手）；真正的内容保护由面包多商品页承担。 */
(function () {
  window.PAID_CODES = {
    binder: "binder2026",
    denovo: "denovo2026",
    enzyme: "enzyme2026",
    bundle: "pdgall2026"
  };
  var STORE_PREFIX = "pdg-unlocked-";

  window.isCourseUnlocked = function (course) {
    try { return localStorage.getItem(STORE_PREFIX + course) === "1"; }
    catch (e) { return false; }
  };

  window.unlockCourse = function (course, code) {
    var expect = (window.PAID_CODES || {})[course];
    if (!expect) return false;
    if (String(code || "").trim().toLowerCase() !== expect.toLowerCase()) return false;
    try { localStorage.setItem(STORE_PREFIX + course, "1"); } catch (e) {}
    return true;
  };

  window.lockCourse = function (course) {
    try { localStorage.removeItem(STORE_PREFIX + course); } catch (e) {}
  };

  function guessCourseFromPath() {
    var m = location.pathname.match(/course-([a-z]+)\.html/);
    return m ? m[1] : null;
  }

  function buildGateUI(course) {
    var holder = document.querySelector(".paid-gate-holder");
    if (!holder || !course) return;
    var gate = document.createElement("div");
    gate.className = "paid-gate note warn";
    gate.innerHTML =
      '<strong>🔒 本部分为付费课程内容</strong>' +
      '<p style="margin:6px 0;">课程大纲免费公开；正文与自测在购买后解锁。<a href="courses.html">回到课程计划购买 →</a></p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">' +
      '<input class="paid-code" type="text" inputmode="latin" autocomplete="off" placeholder="输入购买后收到的兑换码" style="flex:1 1 220px;min-width:180px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;">' +
      '<button class="btn small paid-unlock">解锁</button>' +
      '<button class="btn small paid-lock" style="background:transparent;color:var(--muted);border:1px solid var(--line);display:none;">退出</button>' +
      '</div>' +
      '<p class="paid-msg" style="margin:6px 0 0;font-size:13px;color:var(--muted);"></p>';
    holder.appendChild(gate);

    var input = gate.querySelector(".paid-code");
    var unlockBtn = gate.querySelector(".paid-unlock");
    var lockBtn = gate.querySelector(".paid-lock");
    var msg = gate.querySelector(".paid-msg");

    function applyUnlocked(state) {
      document.querySelectorAll(".lesson.paid").forEach(function (el) {
        el.style.display = state ? "block" : "none";
      });
      gate.style.display = state ? "none" : "";
      if (state) lockBtn.style.display = "";
    }

    unlockBtn.addEventListener("click", function () {
      var ok = window.unlockCourse(course, input.value);
      if (ok) {
        msg.textContent = "✓ 解锁成功，内容已显示。";
        msg.style.color = "#0f4f48";
        applyUnlocked(true);
      } else {
        msg.textContent = "兑换码不正确，请核对后重试。";
        msg.style.color = "#b42318";
      }
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") unlockBtn.click();
    });
    lockBtn.addEventListener("click", function () {
      window.lockCourse(course);
      applyUnlocked(false);
    });

    applyUnlocked(window.isCourseUnlocked(course));
  }

  function run() {
    if (document.querySelector(".paid-gate-holder")) {
      buildGateUI(guessCourseFromPath());
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
