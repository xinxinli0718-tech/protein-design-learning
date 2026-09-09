/* 会员系统（邮箱注册/登录 + 兑换码绑定课程） */
(function () {
  var CFG = window.MEMBER_CONFIG || {};
  var SESSION_KEY = "pdg-session";
  var COURSES = [
    { id: "binder", name: "RFdiffusion binder 设计实战" },
    { id: "denovo", name: "从头设计（de novo）实战" },
    { id: "enzyme", name: "酶设计入门" }
  ];

  function ready() {
    return !!(CFG.ready && CFG.url && CFG.anonKey);
  }

  function api(path, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers["apikey"] = CFG.anonKey;
    if (!options.headers["Content-Type"]) options.headers["Content-Type"] = "application/json";
    if (!options.headers["Accept"]) options.headers["Accept"] = "application/json";
    var session = getSession();
    if (session && session.access_token) {
      options.headers["Authorization"] = "Bearer " + session.access_token;
    }
    return fetch(CFG.url.replace(/\/$/, "") + path, options).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!res.ok) {
          var msg = (data && (data.error_description || data.msg || data.message)) ||
                    (data && data.error && data.error.message) || ("请求失败 (" + res.status + ")");
          if (res.status === 401) clearSession();
          throw new Error(msg);
        }
        return data;
      });
    });
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { return null; }
  }

  function setSession(s) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function showMsg(msg, type) {
    var box = document.getElementById("member-msg");
    if (!box) return;
    box.textContent = msg;
    box.className = "note " + (type === "ok" ? "tip" : "warn");
    box.style.display = "block";
  }

  function signUp(email, password) {
    return api("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password })
    });
  }

  function signIn(email, password) {
    return api("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password })
    });
  }

  function signOut() {
    return api("/auth/v1/logout", { method: "POST" }).catch(function () {});
  }

  function fetchMe() {
    return api("/auth/v1/user", { method: "GET" });
  }

  function fetchEntitlements() {
    return api("/rest/v1/entitlements?select=course,created_at&order=created_at.desc", { method: "GET" });
  }

  function redeem(pCourse, pCode) {
    return api("/rest/v1/rpc/redeem_code", {
      method: "POST",
      body: JSON.stringify({ p_course: pCourse, p_code: pCode })
    });
  }

  function applyUnlocks(entitlements) {
    var owned = {};
    (entitlements || []).forEach(function (e) { if (e && e.course) owned[e.course] = true; });
    COURSES.forEach(function (c) {
      try {
        if (owned[c.id]) localStorage.setItem("pdg-unlocked-" + c.id, "1");
        else localStorage.removeItem("pdg-unlocked-" + c.id);
      } catch (e) {}
    });
  }

  function setViews(loggedIn) {
    var authView = document.getElementById("auth-view");
    var memberView = document.getElementById("member-view");
    if (authView) authView.style.display = loggedIn ? "none" : "";
    if (memberView) memberView.style.display = loggedIn ? "" : "none";
  }

  function renderDashboard(user, entitlements) {
    var email = document.getElementById("member-email");
    var list = document.getElementById("entitlement-list");
    var emailText = (user && user.email) || "";
    if (email) email.textContent = emailText;
    if (list) {
      var owned = {};
      (entitlements || []).forEach(function (e) { if (e) owned[e.course] = true; });
      list.innerHTML = COURSES.map(function (c) {
        var ok = !!owned[c.id];
        return '<div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0;">' +
          '<div><h4 style="margin:0 0 2px;">' + c.name + '</h4>' +
          '<span class="badge ' + (ok ? "teal" : "gray") + '">' + (ok ? "✅ 已解锁" : "未购买") + '</span></div>' +
          (ok
            ? '<a class="btn small" href="course-' + c.id + '.html">去学习 →</a>'
            : '<a class="btn small" href="courses.html">去购买 →</a>') +
          '</div>';
      }).join("");
    }
  }

  function enterMember() {
    var session = getSession();
    if (!session) { setViews(false); return; }
    fetchMe().then(function (user) {
      setViews(true);
      return fetchEntitlements().then(function (ents) {
        renderDashboard(user, ents || []);
        applyUnlocks(ents || []);
      });
    }).catch(function () {
      clearSession();
      setViews(false);
    });
  }

  function bindUI() {
    var loginForm = document.getElementById("login-form");
    var regForm = document.getElementById("register-form");
    var redeemForm = document.getElementById("redeem-form");
    var logoutBtn = document.getElementById("logout-btn");
    var showReg = document.getElementById("show-register");
    var showLogin = document.getElementById("show-login");

    if (loginForm) loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("login-email").value.trim();
      var pass = document.getElementById("login-password").value;
      showMsg("登录中…", "info");
      signIn(email, pass).then(function (data) {
        setSession(data);
        enterMember();
        showMsg("登录成功", "ok");
      }).catch(function (err) { showMsg(err.message, "err"); });
    });

    if (regForm) regForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("reg-email").value.trim();
      var pass = document.getElementById("reg-password").value;
      var pass2 = document.getElementById("reg-password2").value;
      if (pass.length < 6) { showMsg("密码至少 6 位", "err"); return; }
      if (pass !== pass2) { showMsg("两次密码不一致", "err"); return; }
      showMsg("注册中…", "info");
      signUp(email, pass).then(function (data) {
        if (data && data.access_token) {
          setSession(data);
          enterMember();
          showMsg("注册成功", "ok");
        } else {
          showMsg("注册成功，请到邮箱点击确认链接后再登录", "ok");
        }
      }).catch(function (err) { showMsg(err.message, "err"); });
    });

    if (redeemForm) redeemForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var course = document.getElementById("redeem-course").value;
      var code = document.getElementById("redeem-code").value.trim();
      if (!code) { showMsg("请输入兑换码", "err"); return; }
      showMsg("兑换中…", "info");
      redeem(course, code).then(function () {
        return fetchEntitlements();
      }).then(function (ents) {
        renderDashboard(getSession() && getSession().user ? getSession().user : null, ents || []);
        applyUnlocks(ents || []);
        showMsg("✅ 兑换成功，课程已绑定到你的会员账号", "ok");
      }).catch(function (err) { showMsg(err.message, "err"); });
    });

    if (logoutBtn) logoutBtn.addEventListener("click", function () {
      signOut().finally(function () {
        clearSession();
        COURSES.forEach(function (c) {
          try { localStorage.removeItem("pdg-unlocked-" + c.id); } catch (e) {}
        });
        setViews(false);
        showMsg("已退出登录", "ok");
      });
    });

    if (showReg) showReg.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("login-box").style.display = "none";
      document.getElementById("register-box").style.display = "";
    });
    if (showLogin) showLogin.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("register-box").style.display = "none";
      document.getElementById("login-box").style.display = "";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!ready()) {
      var authView = document.getElementById("auth-view");
      var memberView = document.getElementById("member-view");
      if (authView) authView.innerHTML = '<div class="note warn"><strong>会员系统尚未启用</strong>网站后台配置完成后即可注册登录。</div>';
      if (memberView) memberView.style.display = "none";
      return;
    }
    bindUI();
    enterMember();
  });
})();
