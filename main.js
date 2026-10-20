const roles = [
  "Full-Stack Developer",
  "Python Developer",
  "Aspiring Data Scientist"
];

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initNav();
  initCopy();
  initScrollSpy();
  initHeader();
  initSnake();
  initSkills();
  initChrome();
  initStageLight();
  initMobileView();
  initCursor();

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    initTypewriter();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  setupMotion();
})();

function initChrome() {
  if (!window.gsap) return;

  const mm = gsap.matchMedia();
  mm.add("(hover: hover) and (pointer: fine) and (min-width: 981px) and (prefers-reduced-motion: no-preference)", () => {
    const nav = document.querySelector(".nav__links");
    const indicator = nav && nav.querySelector(".nav__indicator");
    const links = nav ? [...nav.querySelectorAll("a")] : [];
    if (!nav || !indicator || !links.length) return;

    const place = (link) => {
      if (!link) {
        gsap.to(indicator, { autoAlpha: 0, duration: 0.25, overwrite: "auto" });
        return;
      }
      const navBox = nav.getBoundingClientRect();
      const box = link.getBoundingClientRect();
      gsap.to(indicator, {
        x: box.left - navBox.left,
        width: box.width,
        autoAlpha: 1,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto"
      });
    };

    const current = () => links.find((link) => link.getAttribute("aria-current") === "true");
    const onEnter = (event) => place(event.currentTarget);
    links.forEach((link) => link.addEventListener("pointerenter", onEnter));
    const onLeave = () => place(current());
    nav.addEventListener("pointerleave", onLeave);

    const observer = new MutationObserver(() => {
      if (!nav.matches(":hover")) place(current());
    });
    links.forEach((link) => observer.observe(link, { attributes: true, attributeFilter: ["aria-current"] }));
    place(current());

    const onResize = () => place(nav.matches(":hover") ? links.find((link) => link.matches(":hover")) || current() : current());
    window.addEventListener("resize", onResize);

    return () => {
      links.forEach((link) => link.removeEventListener("pointerenter", onEnter));
      nav.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      gsap.set(indicator, { clearProps: "all" });
    };
  });

  mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    const panel = document.querySelector(".footer__panel");
    if (!panel) return;
    const onMove = (event) => {
      const rect = panel.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      panel.style.setProperty("--mx", x.toFixed(1) + "%");
      panel.style.setProperty("--my", y.toFixed(1) + "%");
    };
    panel.addEventListener("pointermove", onMove);
    return () => panel.removeEventListener("pointermove", onMove);
  });
}

function initSkills() {
  if (!window.gsap) return;

  const mm = gsap.matchMedia();
  mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    const cards = gsap.utils.toArray("#skills .skill-card");
    const moves = cards.map((card) => {
      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", x.toFixed(1) + "%");
        card.style.setProperty("--my", y.toFixed(1) + "%");
      };
      card.addEventListener("pointermove", onMove);
      return () => card.removeEventListener("pointermove", onMove);
    });

    return () => moves.forEach((remove) => remove());
  });
}

function initSnake() {
  if (!window.gsap) return;

  const mm = gsap.matchMedia();
  mm.add("(hover: hover) and (pointer: fine) and (min-width: 981px) and (prefers-reduced-motion: no-preference)", () => {
    const snake = document.querySelector(".snake");
    if (!snake) return;

    const flows = [...snake.querySelectorAll(".snake__flow")];
    const cards = [...snake.querySelectorAll(".timeline__body")];
    const restBorder = [
      "rgba(62, 240, 255, 0.28)",
      "rgba(231, 238, 245, 0.1)",
      "rgba(231, 238, 245, 0.1)"
    ];
    const litBorder = "rgba(62, 240, 255, 0.78)";
    const litShadow = "inset 0 0 0 1px rgba(62, 240, 255, 0.34), inset 0 0 28px rgba(62, 240, 255, 0.1)";
    let playing = null;

    const trace = () => {
      flows.forEach((svg) => {
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        if (width < 8 || height < 8) return;

        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        const path = svg.querySelector("path");
        const radius = Math.min(21, width / 2 - 1, height / 2 - 1);
        const turningRight = svg.closest(".snake__joint--right");
        path.setAttribute("d", turningRight
          ? `M 0 1 H ${width - radius} A ${radius} ${radius} 0 0 1 ${width - 1} ${radius + 1} V ${height}`
          : `M ${width} 1 H ${radius} A ${radius} ${radius} 0 0 0 1 ${radius + 1} V ${height}`);

        const length = path.getTotalLength();
        const head = Math.max(28, Math.min(64, length * 0.24));
        path.style.strokeDasharray = `${head} ${length}`;
        path.dataset.len = String(length);
        path.dataset.head = String(head);
        if (!playing) gsap.set(path, { strokeDashoffset: length });
      });
    };

    const pass = (path) => ({
      strokeDashoffset: () => -Number(path.dataset.head),
      duration: 1.05,
      ease: "power2.inOut",
      immediateRender: false
    });

    const play = () => {
      if (playing) return;
      trace();
      const paths = flows.map((svg) => svg.querySelector("path"));
      if (paths.length < 2 || !paths[0].dataset.len) return;

      snake.classList.add("is-flowing");
      playing = gsap.timeline({ repeat: -1, repeatRefresh: true });
      playing.fromTo(paths[0], { strokeDashoffset: () => Number(paths[0].dataset.len) }, pass(paths[0]), 0);
      playing.to(cards[0], { borderColor: litBorder, boxShadow: litShadow, duration: 0.4, ease: "power1.out" }, 0);
      playing.to(cards[0], { borderColor: restBorder[0], boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)", duration: 0.5, ease: "power1.inOut" }, 0.6);
      playing.to(cards[1], { borderColor: litBorder, boxShadow: litShadow, duration: 0.4, ease: "power1.out" }, 0.72);
      playing.fromTo(paths[1], { strokeDashoffset: () => Number(paths[1].dataset.len) }, pass(paths[1]), 0.82);
      playing.to(cards[1], { borderColor: restBorder[1], boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)", duration: 0.5, ease: "power1.inOut" }, 1.28);
      playing.to(cards[2], { borderColor: litBorder, boxShadow: litShadow, duration: 0.4, ease: "power1.out" }, 1.48);
      playing.to(cards[2], { borderColor: restBorder[2], boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)", duration: 0.55, ease: "power1.inOut" }, 1.95);
    };

    const stop = () => {
      playing?.kill();
      playing = null;
      snake.classList.remove("is-flowing");
      flows.forEach((svg) => {
        const path = svg.querySelector("path");
        gsap.to(path, {
          strokeDashoffset: Number(path.dataset.len) || 0,
          duration: 0.35,
          ease: "power1.out",
          overwrite: "auto"
        });
      });
      gsap.to(cards, {
        duration: 0.4,
        ease: "power1.out",
        overwrite: "auto",
        clearProps: "borderColor,boxShadow"
      });
    };

    trace();
    window.addEventListener("resize", trace);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(trace);
    snake.addEventListener("pointerenter", play);
    snake.addEventListener("pointerleave", stop);

    return () => {
      stop();
      window.removeEventListener("resize", trace);
      snake.removeEventListener("pointerenter", play);
      snake.removeEventListener("pointerleave", stop);
    };
  });
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav__links");
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    links.classList.toggle("is-open", !open);
    document.body.classList.toggle("menu-open", !open);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      const behavior = reduceMotionQuery() ? "auto" : "smooth";

      if (id === "#top") {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior });
        close();
        return;
      }

      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior, block: "start" });
      close();
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}

function reduceMotionQuery() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initScrollSpy() {
  const links = Array.from(document.querySelectorAll(".nav__links a"));
  const byId = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
  const sections = document.querySelectorAll("main section[id]");
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.removeAttribute("aria-current"));
        const active = byId.get(entry.target.id);
        if (active) active.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-46% 0px -48% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initCopy() {
  const button = document.querySelector("[data-copy]");
  if (!button) return;
  const email = button.getAttribute("data-copy");
  const original = button.textContent;

  button.addEventListener("click", async () => {
    const copied = await copyText(email);
    button.textContent = copied ? "Copied" : "Copy failed";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1800);
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-999px";
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (fallbackError) {
      copied = false;
    }
    area.remove();
    return copied;
  }
}

let typingStarted = false;

function initTypewriter() {
  if (typingStarted) return;
  typingStarted = true;

  const visual = document.getElementById("role-text");
  const live = document.getElementById("role-live");
  const caret = document.querySelector(".caret");
  if (!visual || !live) return;

  if (reduceMotionQuery()) {
    const all = roles.join(" · ");
    visual.textContent = all;
    live.textContent = all;
    if (caret) caret.remove();
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let paused = false;

  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
  });

  const tick = () => {
    if (paused) {
      window.setTimeout(tick, 200);
      return;
    }

    const word = roles[roleIndex];
    if (!deleting) {
      charIndex += 1;
      visual.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        live.textContent = word;
        deleting = true;
        window.setTimeout(tick, 1500);
        return;
      }
      window.setTimeout(tick, 70);
      return;
    }

    charIndex -= 1;
    visual.textContent = word.slice(0, Math.max(charIndex, 0));
    if (charIndex <= 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      window.setTimeout(tick, 280);
      return;
    }
    window.setTimeout(tick, 34);
  };

  visual.textContent = "";
  window.setTimeout(tick, 280);
}

function initCursor() {
  if (!window.gsap) return;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!fine.matches) return;

  const root = document.querySelector(".cursor");
  const glow = root && root.querySelector(".cursor__glow");
  const ring = root && root.querySelector(".cursor__ring");
  const dot = root && root.querySelector(".cursor__dot");
  if (!root || !glow || !ring || !dot) return;

  gsap.set([glow, ring, dot], { xPercent: -50, yPercent: -50 });
  const follow = (element, duration) => ({
    x: gsap.quickTo(element, "x", { duration, ease: "power3.out" }),
    y: gsap.quickTo(element, "y", { duration, ease: "power3.out" })
  });
  const glowTo = follow(glow, 0.72);
  const ringTo = follow(ring, 0.38);
  const dotTo = follow(dot, 0.09);
  const interactive = "a, button, .kicker span, .skill-card, .facts div, .tilt, .contact-line, .hero__frame, .logo, .nav-toggle";
  const native = "input, textarea, select";

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") {
      document.body.classList.remove("has-cursor");
      root.classList.remove("is-on");
      return;
    }
    document.body.classList.add("has-cursor");
    root.classList.add("is-on");
    glowTo.x(event.clientX);
    glowTo.y(event.clientY);
    ringTo.x(event.clientX);
    ringTo.y(event.clientY);
    dotTo.x(event.clientX);
    dotTo.y(event.clientY);
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const field = target.closest(native);
    document.body.classList.toggle("is-native", Boolean(field));
    root.classList.toggle("is-hidden", Boolean(field));
    root.classList.toggle("is-hover", Boolean(target.closest(interactive)));
  });

  document.addEventListener("pointerdown", () => root.classList.add("is-down"));
  document.addEventListener("pointerup", () => root.classList.remove("is-down"));
  document.documentElement.addEventListener("pointerleave", () => root.classList.remove("is-on"));
}

function initStageLight() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
  if (!fine) return;

  document.querySelectorAll(".hero, .about__layout").forEach((panel) => {
    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      panel.style.setProperty("--mx", x.toFixed(1) + "%");
      panel.style.setProperty("--my", y.toFixed(1) + "%");
      panel.classList.add("is-lit");
    });

    panel.addEventListener("pointerleave", () => {
      panel.classList.remove("is-lit");
    });
  });
}

function initMobileView() {
  const query = window.matchMedia("(max-width: 980px) and (prefers-reduced-motion: no-preference)");
  if (!query.matches) {
    query.addEventListener("change", () => {
      if (query.matches) initMobileView();
    }, { once: true });
    return;
  }

  const sections = [...document.querySelectorAll(".hero, #about, #skills, #education, #projects, .site-footer")];
  const lights = [
    document.querySelector(".hero"),
    document.querySelector(".about__layout"),
    document.querySelector(".footer__panel")
  ].filter(Boolean);
  const cards = [...document.querySelectorAll("#skills .skill-card")];
  const track = document.querySelector(".snake__track");
  const snake = document.querySelector(".snake");

  const fitRail = () => {
    if (!track || !snake) return;
    snake.style.setProperty("--rail", Math.max(48, track.clientHeight - 36) + "px");
  };
  fitRail();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-live", entry.isIntersecting);
    });
  }, { threshold: 0.28 });
  sections.forEach((section) => observer.observe(section));

  let frame = 0;
  const started = performance.now();
  const drift = (now) => {
    if (document.hidden) {
      frame = requestAnimationFrame(drift);
      return;
    }
    const t = (now - started) / 1000;
    lights.forEach((panel, index) => {
      const host = panel.closest(".hero, #about, .site-footer");
      const on = host && host.classList.contains("is-live");
      panel.classList.toggle("is-lit", Boolean(on));
      if (!on) return;
      panel.style.setProperty("--mx", (50 + Math.sin(t * 0.45 + index) * 26).toFixed(1) + "%");
      panel.style.setProperty("--my", (40 + Math.cos(t * 0.32 + index * 1.2) * 22).toFixed(1) + "%");
    });
    if (document.querySelector("#skills.is-live")) {
      cards.forEach((card, index) => {
        card.style.setProperty("--mx", (48 + Math.sin(t * 0.5 + index) * 28).toFixed(1) + "%");
        card.style.setProperty("--my", (36 + Math.cos(t * 0.38 + index) * 22).toFixed(1) + "%");
      });
    }
    frame = requestAnimationFrame(drift);
  };
  frame = requestAnimationFrame(drift);

  const onResize = () => {
    if (!query.matches) stop();
    else fitRail();
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("resize", onResize);
    sections.forEach((section) => section.classList.remove("is-live"));
    lights.forEach((panel) => panel.classList.remove("is-lit"));
    query.addEventListener("change", () => {
      if (query.matches) initMobileView();
    }, { once: true });
  };
  window.addEventListener("resize", onResize);
}

function setupMotion() {
  gsap.defaults({ ease: "power3.out" });

  const role = document.getElementById("role-text");
  if (role) role.textContent = "";

  gsap.from(".nav", {
    y: -16,
    autoAlpha: 0,
    duration: 0.7,
    ease: "power3.out",
    clearProps: "transform,opacity,visibility"
  });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

  intro
    .from(".kicker span", { autoAlpha: 0, y: 12, duration: 0.45, stagger: 0.08, clearProps: "transform" })
    .from(".hero h1 span", { autoAlpha: 0, y: 28, duration: 0.8, stagger: 0.08, clearProps: "transform" }, "-=0.28")
    .from(".hero__frame", { autoAlpha: 0, y: 24, scale: 1.04, duration: 0.95, clearProps: "transform" }, "-=0.62")
    .from(".hero__role", { autoAlpha: 0, y: 16, duration: 0.5, clearProps: "transform", onStart: initTypewriter }, "-=0.45")
    .from(".hero__tagline", { autoAlpha: 0, y: 16, duration: 0.55, clearProps: "transform" }, "-=0.32")
    .from(".hero__actions a", { autoAlpha: 0, y: 12, duration: 0.45, stagger: 0.08, clearProps: "transform" }, "-=0.28");

  animateSections();
  initTilt();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

function animateSections() {
  const enter = (trigger, targets, vars = {}) => {
    const nodes = gsap.utils.toArray(targets);
    if (!nodes.length) return;
    const { start = "top 84%", ...rest } = vars;
    gsap.from(nodes, {
      autoAlpha: 0,
      y: 20,
      duration: 0.75,
      ease: "power3.out",
      clearProps: "transform",
      ...rest,
      scrollTrigger: {
        trigger,
        start,
        once: true
      }
    });
  };

  document.querySelectorAll("[data-animate]").forEach((section) => {
    enter(section, section.querySelector(".section__head"), { y: 16, duration: 0.6 });
    enter(section, section.querySelector(".section__rule"), {
      scaleX: 0,
      y: 0,
      transformOrigin: "left center",
      duration: 0.9,
      ease: "power2.out"
    });
  });

  enter("#about", "#about .about__copy p", { y: 22, stagger: 0.12, start: "top 80%" });
  enter("#about", "#about .facts div", { x: 28, y: 0, stagger: 0.12, start: "top 78%" });

  enter("#skills", "#skills .section__intro", { y: 16 });
  enter("#skills", "#skills .skill-card", { y: 32, stagger: 0.08, duration: 0.7, start: "top 80%" });

  enter("#education", "#education .snake", { y: 18, start: "top 78%" });

  enter("#projects", "#projects .section__intro", { y: 16 });
  enter("#projects", "#projects .tilt", {
    y: 40,
    stagger: 0.18,
    duration: 0.85,
    start: "top 80%",
    clearProps: "opacity,visibility",
    onComplete() {
      gsap.set(this.targets(), { y: 0, transformPerspective: 900 });
    }
  });

  enter("#contact", "#contact .contact-card", { y: 22, duration: 0.8, start: "top 84%" });
  enter("footer", "footer .footer__panel", { y: 22, duration: 0.75, start: "top 94%" });
}

function initTilt() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!finePointer) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.45, ease: "power3.out" });
    const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.45, ease: "power3.out" });
    gsap.set(card, { transformPerspective: 900 });

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      rotateY((px - 0.5) * 5);
      rotateX((0.5 - py) * 3.5);
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    });

    card.addEventListener("pointerleave", () => {
      rotateX(0);
      rotateY(0);
    });
  });
}
