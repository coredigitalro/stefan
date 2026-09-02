(function () {
  "use strict";

  /* ============ loading screen ============ */
  var loader = document.getElementById("loader");
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("done");
    setTimeout(function () {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 700);
  }
  window.addEventListener("load", function () {
    setTimeout(hideLoader, 1500);
  });
  // plasă de siguranță: dacă load nu se declanșează, ascunde oricum
  setTimeout(hideLoader, 5000);

  /* ============ header la scroll ============ */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============ meniu mobil ============ */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");

  function closeMenu() {
    menu.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
  });

  /* ============ reveal la scroll ============ */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ============ video: buton play custom ============ */
  document.querySelectorAll(".vid").forEach(function (wrap) {
    var video = wrap.querySelector("video");
    var btn = wrap.querySelector(".vid-play");
    if (!video || !btn) return;

    btn.addEventListener("click", function () {
      // oprește celelalte videouri
      document.querySelectorAll(".vid video").forEach(function (v) {
        if (v !== video && !v.paused) {
          v.pause();
          var otherBtn = v.parentNode.querySelector(".vid-play");
          if (otherBtn) otherBtn.classList.remove("hidden");
        }
      });
      video.play();
      btn.classList.add("hidden");
    });

    video.addEventListener("pause", function () { btn.classList.remove("hidden"); });
    video.addEventListener("ended", function () { btn.classList.remove("hidden"); });
    video.addEventListener("play", function () { btn.classList.add("hidden"); });
  });

  /* ============ lightbox galerie ============ */
  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var items = Array.prototype.slice.call(document.querySelectorAll(".gal-item"));
  var current = 0;

  function openLb(i) {
    current = (i + items.length) % items.length;
    var img = items[current].querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { openLb(i); });
  });

  lbClose.addEventListener("click", closeLb);
  lbPrev.addEventListener("click", function () { openLb(current - 1); });
  lbNext.addEventListener("click", function () { openLb(current + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") openLb(current - 1);
    if (e.key === "ArrowRight") openLb(current + 1);
  });

  /* ============ formular ============ */
  var form = document.getElementById("form");
  var msg = document.getElementById("formMsg");

  if (form && msg) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nume = form.querySelector("#nume");
      var tel = form.querySelector("#tel");

      if (!nume.value.trim()) {
        msg.textContent = "Completează numele ca să te putem contacta.";
        msg.className = "form-msg err";
        nume.focus();
        return;
      }
      if (!tel.value.trim() || tel.value.replace(/\D/g, "").length < 9) {
        msg.textContent = "Completează un număr de telefon valid.";
        msg.className = "form-msg err";
        tel.focus();
        return;
      }

      var btn = form.querySelector("button[type='submit']");
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = "Se trimite...";
      msg.textContent = "";
      msg.className = "form-msg";

      // Simulare trimitere. Înlocuiește cu integrarea reală (email / webhook / CRM).
      setTimeout(function () {
        msg.textContent = "Cererea a fost trimisă. Te sunăm în cel mai scurt timp.";
        msg.className = "form-msg ok";
        form.reset();
        btn.disabled = false;
        btn.innerHTML = original;

        setTimeout(function () {
          msg.textContent = "";
          msg.className = "form-msg";
        }, 6000);
      }, 900);
    });
  }

  /* ============ an footer ============ */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

})();
