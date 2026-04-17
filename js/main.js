(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  var prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function throttle(fn, wait) {
    var t = 0;
    return function () {
      var now = Date.now();
      if (now - t < wait) return;
      t = now;
      fn.apply(null, arguments);
    };
  }

  /* Theme toggle */
  function initThemeToggle() {
    var btn = qs("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
  initThemeToggle();

  /* Menu mobile */
  var toggle = qs("[data-nav-toggle]");
  var nav = qs("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    qsa("a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Carrossel — Loop Coverflow tipo Framer */
  function initCarousel(root) {
    if (!root) return;
    var track = qs("[data-carousel-track]", root);
    var slides = qsa("[data-carousel-slide]", root);
    var prev = qs("[data-carousel-prev]", root);
    var next = qs("[data-carousel-next]", root);
    if (!track || slides.length === 0) return;

    var index = 0;
    var timer;

    function go(i) {
      if (slides.length === 0) return;
      index = (i + slides.length) % slides.length;

      slides.forEach(function (slide, idx) {
        var offset = (idx - index + slides.length) % slides.length;
        if (offset > Math.floor(slides.length / 2)) {
          offset -= slides.length;
        }

        var translateX = offset * 90;
        var scale = offset === 0 ? 1 : 0.82;
        var opacity = offset === 0 ? 1 : (Math.abs(offset) === 1 ? 0.45 : 0);
        var zIndex = offset === 0 ? 3 : (Math.abs(offset) === 1 ? 2 : 1);

        slide.style.transform = "translate(calc(-50% + " + translateX + "%), -50%) scale(" + scale + ")";
        slide.style.opacity = opacity;
        slide.style.zIndex = zIndex;

        if (offset === 0) {
          slide.classList.add("is-active");
          slide.style.pointerEvents = "auto";
        } else {
          slide.classList.remove("is-active");
          slide.style.pointerEvents = "none";
        }
      });
      resetTimer();
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 4500);
    }

    go(0); // Initialize

    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });

    var touchStartX = 0;
    track.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      function (e) {
        var dx = e.changedTouches[0].screenX - touchStartX;
        if (dx > 50) go(index - 1);
        if (dx < -50) go(index + 1);
      },
      { passive: true }
    );
  }

  qsa("[data-carousel]").forEach(initCarousel);

  /* Scroll reveal — estilo Framer (viewport) */
  function initReveal() {
    var els = qsa("[data-reveal]");
    if (els.length === 0) return;

    if (prefersReducedMotion) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    els.forEach(function (el) {
      var d = el.getAttribute("data-reveal-delay");
      if (d != null && d !== "") {
        el.style.setProperty("--reveal-delay", parseInt(d, 10) / 1000 + "s");
      }
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* Hero — sequência inicial (título em máscara + cartão) */
  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) return;

    if (prefersReducedMotion) {
      hero.classList.add("hero--ready");
      return;
    }

    function boot() {
      hero.classList.add("hero--ready");
    }

    if (document.readyState === "complete") {
      requestAnimationFrame(function () {
        requestAnimationFrame(boot);
      });
    } else {
      window.addEventListener(
        "load",
        function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(boot);
          });
        },
        { once: true }
      );
    }
  }

  /* Parallax leve na imagem do hero (comum em sites Framer) */
  function initHeroParallax() {
    if (prefersReducedMotion) return;
    var hero = qs("[data-hero]");
    var img = hero && qs(".hero__media img", hero);
    if (!hero || !img) return;

    var onScroll = throttle(function () {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      progress = Math.max(0, Math.min(1, progress));
      var y = (progress - 0.5) * 14;
      img.style.transform = "translate3d(0," + y.toFixed(2) + "px,0) scale(1)";
    }, 32);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Header com sombra após rolagem */
  function initHeaderScroll() {
    var header = qs(".site-header");
    if (!header) return;

    var onScroll = throttle(function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle("is-scrolled", y > 12);
    }, 48);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Contadores 5+ / 20+ / 5+ */
  function initStats() {
    var root = qs("[data-stats]");
    if (!root) return;
    var nums = qsa("[data-count]", root);
    if (nums.length === 0) return;

    function runCount(el, target, suffix) {
      var start = performance.now();
      var dur = 1100;

      function easeOut(t) {
        return 1 - Math.pow(1 - t, 2.6);
      }

      function frame(now) {
        var t = Math.min(1, (now - start) / dur);
        var v = Math.round(target * easeOut(t));
        el.textContent = v + suffix;
        if (t < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

    function start() {
      nums.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        if (prefersReducedMotion) {
          el.textContent = target + suffix;
          return;
        }
        el.textContent = "0" + suffix;
        runCount(el, target, suffix);
      });
    }

    if (prefersReducedMotion) {
      nums.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        el.textContent = target + suffix;
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          start();
          observer.disconnect();
        });
      },
      { threshold: 0.25 }
    );

    io.observe(root);
  }

  /* Formulários de contato */
  function bindForm(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = qs("[data-form-status]", form);
      var nome = qs("[name=nome]", form);
      var email = qs("[name=email]", form);
      var msg = qs("[name=mensagem]", form);

      if (!nome || !email || !msg) return;

      var ok =
        nome.value.trim().length > 1 &&
        /^\S+@\S+\.\S+$/.test(email.value.trim()) &&
        msg.value.trim().length > 4;

      if (!ok) {
        if (status) {
          status.textContent = "Preencha nome, e-mail válido e mensagem.";
          status.className = "form-status form-status--err";
        }
        return;
      }

      if (status) {
        status.textContent =
          "Mensagem registrada para envio. Em produção, conecte este formulário ao seu backend ou serviço de e-mail.";
        status.className = "form-status form-status--ok";
      }
      form.reset();
    });
  }

  qsa("[data-contact-form]").forEach(bindForm);

  /* Blog Search and Filters */
  function initBlogFilters() {
    var searchInput = qs("#searchInput");
    var filterBtns = qsa(".filter-btn");
    var blogGrid = qs("#blogGrid");
    var noResults = qs("#noResults");
    if (!searchInput || !blogGrid) return;

    var cards = qsa(".blog-card", blogGrid);
    var currentFilter = "all";
    var currentSearch = "";

    function filterCards() {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var category = card.getAttribute("data-category") || "";
        var title = qs("h3", card) ? qs("h3", card).textContent.toLowerCase() : "";
        var desc = qs("p:last-of-type", card) ? qs("p:last-of-type", card).textContent.toLowerCase() : "";

        var matchesFilter = currentFilter === "all" || category === currentFilter;
        var matchesSearch = currentSearch === "" || title.indexOf(currentSearch) > -1 || desc.indexOf(currentSearch) > -1;

        if (matchesFilter && matchesSearch) {
          card.style.display = "block";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? "block" : "none";
      }
    }

    searchInput.addEventListener("input", function (e) {
      currentSearch = e.target.value.toLowerCase().trim();
      filterCards();
    });

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        currentFilter = btn.getAttribute("data-filter") || "all";
        filterCards();
      });
    });
  }

  /* Modal de Serviços Expandidos */
  function initServiceModal() {
    var modal = qs("#serviceModal");
    var title = qs("#modalTitle");
    var desc = qs("#modalDescription");
    var img = qs("#modalImage");
    var closeBtns = qsa("[data-modal-close]");
    var cards = qsa("[data-service-expand]");

    if (!modal || !title || !desc || !img) return;

    function openModal(card) {
      var sTitle = card.getAttribute("data-title");
      var sDesc = card.getAttribute("data-description");
      var sImg = card.querySelector("img").src;

      title.textContent = sTitle;
      desc.textContent = sDesc;
      img.src = sImg;
      img.alt = sTitle;

      modal.classList.add("is-active");
      document.body.style.overflow = "hidden"; // Trava o scroll
    }

    function closeModal() {
      modal.classList.remove("is-active");
      document.body.style.overflow = "";
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        openModal(card);
      });
    });

    closeBtns.forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });

    // Fechar com tecla ESC
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  initReveal();
  initHero();
  initHeroParallax();
  initHeaderScroll();
  initStats();
  initBlogFilters();
  initServiceModal();
})();
