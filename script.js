(function () {
  "use strict";

  var siteData = null; // completat mai jos, după ce se încarcă content/site.json

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

  /* ============ formular ============ */
  var form = document.getElementById("form");
  var msg = document.getElementById("formMsg");

  if (form && msg) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nume = form.querySelector("#nume");
      var tel = form.querySelector("#tel");
      var mesaj = form.querySelector("#mesaj");

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
      var phoneFallback = (siteData && siteData.phone_display) || "telefonul afișat pe site";

      function finish(ok, text) {
        msg.textContent = text;
        msg.className = "form-msg " + (ok ? "ok" : "err");
        btn.disabled = false;
        btn.innerHTML = original;
        if (ok) form.reset();
        setTimeout(function () {
          msg.textContent = "";
          msg.className = "form-msg";
        }, 7000);
      }

      btn.disabled = true;
      btn.textContent = "Se trimite...";
      msg.textContent = "";
      msg.className = "form-msg";

      /* ---- Trimitere reală prin Web3Forms (gratuit, gratuit mereu pana la 250 cereri/lună) ----
         Cheia se ia gratuit de pe https://web3forms.com și se completează în
         content/site.json (câmpul "web3forms_access_key") — editabil și din CMS. */
      var accessKey = siteData && siteData.web3forms_access_key;

      if (!accessKey) {
        finish(false, "Formularul nu e conectat încă la email. Sună-ne la " + phoneFallback + ".");
        return;
      }

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: "Cerere ofertă de pe site — " + nume.value.trim(),
          nume: nume.value.trim(),
          telefon: tel.value.trim(),
          mesaj: mesaj && mesaj.value.trim() ? mesaj.value.trim() : "(fără detalii suplimentare)"
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (result) {
          if (result && result.success) {
            finish(true, "Cererea a fost trimisă. Te sunăm în cel mai scurt timp.");
          } else {
            finish(false, "Nu am putut trimite cererea. Sună-ne la " + phoneFallback + ".");
          }
        })
        .catch(function () {
          finish(false, "Nu am putut trimite cererea. Sună-ne la " + phoneFallback + ".");
        });
    });
  }

  /* ============ an footer ============ */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ============================================================
     CONȚINUT DIN CMS (Decap CMS -> content/site.json)
     Site-ul rămâne complet funcțional și corect chiar dacă acest
     fișier lipsește sau CMS-ul nu a fost încă configurat — pagina
     păstrează pur și simplu conținutul static din index.html.
     ============================================================ */

  var SVG_NS = "http://www.w3.org/2000/svg";

  function makeIcon(pathD, size, strokeWidth, fillColor) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", fillColor || "none");
    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathD);
    if (!fillColor) {
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", strokeWidth || "2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
    }
    svg.appendChild(path);
    return svg;
  }

  function withYears(template, years) {
    if (template == null) return template;
    return String(template).split("{years}").join(years);
  }

  function applyText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  function applyBrand(fullName) {
    if (!fullName) return;
    var parts = fullName.trim().split(/\s+/);
    var last = parts.pop();
    var rest = parts.join(" ");
    document.querySelectorAll('[data-cms="brand"]').forEach(function (el) {
      el.innerHTML = "";
      if (rest) el.appendChild(document.createTextNode(rest + " "));
      var em = document.createElement("em");
      em.textContent = last;
      el.appendChild(em);
    });
    document.querySelectorAll('[data-cms="brand-plain"]').forEach(function (el) {
      el.textContent = fullName;
    });
  }

  function applyPhone(display, tel) {
    if (tel) {
      document.querySelectorAll('[data-cms="phone-tel"]').forEach(function (el) {
        el.setAttribute("href", "tel:" + tel);
      });
    }
    if (display) {
      document.querySelectorAll('[data-cms="phone-display"]').forEach(function (el) {
        el.textContent = display;
      });
    }
  }

  function applyWhatsapp(number) {
    if (!number) return;
    document.querySelectorAll('[data-cms="whatsapp-link"]').forEach(function (el) {
      el.href = el.href.replace(/wa\.me\/\d+/, "wa.me/" + number);
    });
  }

  function renderServices(container, list) {
    container.innerHTML = "";
    list.forEach(function (s, i) {
      var art = document.createElement("article");
      art.className = "svc reveal";
      art.style.setProperty("--i", i);

      var imgWrap = document.createElement("div");
      imgWrap.className = "svc-img";
      var img = document.createElement("img");
      img.src = s.image;
      img.alt = s.alt || s.title || "";
      img.loading = "lazy";
      imgWrap.appendChild(img);

      var body = document.createElement("div");
      body.className = "svc-body";

      var top = document.createElement("div");
      top.className = "svc-top";
      var h3 = document.createElement("h3");
      h3.textContent = s.title || "";
      top.appendChild(h3);
      top.appendChild(makeIcon("M9 18l6-6-6-6", "18", "2"));

      var p = document.createElement("p");
      p.textContent = s.description || "";

      body.appendChild(top);
      body.appendChild(p);
      art.appendChild(imgWrap);
      art.appendChild(body);
      container.appendChild(art);
    });
  }

  function renderBeforeAfter(container, list) {
    container.innerHTML = "";
    list.forEach(function (item, i) {
      var fig = document.createElement("figure");
      fig.className = "ba-item reveal";
      fig.style.setProperty("--i", i);

      var img = document.createElement("img");
      img.src = item.image;
      img.alt = item.alt || "";
      img.loading = "lazy";

      var cap = document.createElement("figcaption");
      cap.className = "ba-cap";
      cap.appendChild(makeIcon("M5 12h14M13 6l6 6-6 6", "15", "2"));

      var span = document.createElement("span");
      var b = document.createElement("b");
      b.textContent = item.label_bold || "";
      span.appendChild(b);
      if (item.label_rest) span.appendChild(document.createTextNode(" — " + item.label_rest));
      cap.appendChild(span);

      fig.appendChild(img);
      fig.appendChild(cap);
      container.appendChild(fig);
    });
  }

  function renderGallery(container, list) {
    container.innerHTML = "";
    list.forEach(function (item, i) {
      var fig = document.createElement("figure");
      fig.className = "gal-item reveal";
      fig.style.setProperty("--i", i);

      var img = document.createElement("img");
      img.src = item.image;
      img.alt = item.alt || "";
      img.loading = "lazy";

      var tag = document.createElement("span");
      tag.className = "gal-tag";
      tag.textContent = item.tag || "";

      fig.appendChild(img);
      fig.appendChild(tag);
      container.appendChild(fig);
    });
  }

  function renderVideos(container, list) {
    container.innerHTML = "";
    list.forEach(function (item, i) {
      var wrap = document.createElement("div");
      wrap.className = "vid reveal";
      wrap.style.setProperty("--i", i);

      var video = document.createElement("video");
      video.src = item.video;
      if (item.poster) video.poster = item.poster;
      video.preload = "none";
      video.playsInline = true;
      video.controls = true;

      var btn = document.createElement("button");
      btn.className = "vid-play";
      btn.setAttribute("aria-label", "Redă filmarea " + (i + 1));
      var iEl = document.createElement("i");
      iEl.appendChild(makeIcon("M8 5v14l11-7z", "21", null, "#fff"));
      btn.appendChild(iEl);

      wrap.appendChild(video);
      wrap.appendChild(btn);
      container.appendChild(wrap);
    });
  }

  function applyContent(data) {
    if (!data) return;
    siteData = data;
    try {
      var years = data.years_experience;

      applyBrand(data.brand);
      applyPhone(data.phone_display, data.phone_tel);
      applyWhatsapp(data.whatsapp_number);

      var loaderWord = document.getElementById("loaderWord");
      if (loaderWord && data.brand) loaderWord.textContent = data.brand;

      if (data.hero) {
        applyText("heroEyebrow", data.hero.eyebrow);
        applyText("heroTitleMain", data.hero.title_main);
        applyText("heroTitleEm", data.hero.title_emphasis);
        applyText("heroLede", withYears(data.hero.lede, years));
      }
      applyText("footerAbout", withYears(data.footer_about, years));

      if (data.seo_title) document.title = withYears(data.seo_title, years);

      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && data.seo_description) metaDesc.setAttribute("content", withYears(data.seo_description, years));

      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && data.seo_title) ogTitle.setAttribute("content", withYears(data.seo_title, years));

      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && data.seo_description) ogDesc.setAttribute("content", withYears(data.seo_description, years));

      var ogSiteName = document.querySelector('meta[property="og:site_name"]');
      if (ogSiteName && data.brand) ogSiteName.setAttribute("content", data.brand);

      var authorMeta = document.querySelector('meta[name="author"]');
      if (authorMeta && data.brand) authorMeta.setAttribute("content", data.brand);

      var ldScript = document.querySelector('script[type="application/ld+json"]');
      if (ldScript) {
        try {
          var ld = JSON.parse(ldScript.textContent);
          if (data.brand) ld.name = data.brand;
          if (data.hero && data.hero.lede) ld.description = withYears(data.hero.lede, years);
          if (data.whatsapp_number) ld.telephone = "+" + data.whatsapp_number;
          ldScript.textContent = JSON.stringify(ld);
        } catch (e) { /* JSON-LD invalid — îl lăsăm neatins */ }
      }

      var svcGrid = document.getElementById("svcGrid");
      if (svcGrid && Array.isArray(data.services) && data.services.length) renderServices(svcGrid, data.services);

      var baGrid = document.getElementById("baGrid");
      if (baGrid && Array.isArray(data.before_after) && data.before_after.length) renderBeforeAfter(baGrid, data.before_after);

      var gallery = document.getElementById("gallery");
      if (gallery && Array.isArray(data.gallery) && data.gallery.length) renderGallery(gallery, data.gallery);

      var vidGrid = document.getElementById("vidGrid");
      if (vidGrid && Array.isArray(data.videos) && data.videos.length) renderVideos(vidGrid, data.videos);
    } catch (e) {
      if (window.console) console.error("Eroare la aplicarea conținutului din CMS:", e);
    }
  }

  /* ============ interacțiuni care depind de conținutul (re)randat ============ */
  function initDynamicInteractions() {

    /* ---- reveal la scroll ---- */
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

    /* ---- video: buton play custom ---- */
    document.querySelectorAll(".vid").forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var btn = wrap.querySelector(".vid-play");
      if (!video || !btn) return;

      btn.addEventListener("click", function () {
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

    /* ---- lightbox galerie ---- */
    var lb = document.getElementById("lb");
    var lbImg = document.getElementById("lbImg");
    var lbClose = document.getElementById("lbClose");
    var lbPrev = document.getElementById("lbPrev");
    var lbNext = document.getElementById("lbNext");
    var items = Array.prototype.slice.call(document.querySelectorAll(".gal-item"));
    var current = 0;

    function openLb(i) {
      if (!items.length) return;
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
  }

  /* ---- pornire: ia conținutul din CMS, apoi leagă interacțiunile ---- */
  if (window.fetch) {
    fetch("content/site.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("content/site.json indisponibil")); })
      .then(applyContent)
      .catch(function () { /* fără CMS încă / offline — rămâne conținutul static din HTML */ })
      .then(initDynamicInteractions);
  } else {
    initDynamicInteractions();
  }

})();
