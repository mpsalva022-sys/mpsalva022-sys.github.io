/**
 * PAULA SALVA - PORTFOLIO INTERACTION ENGINE
 * Features:
 * 1. Mobile navigation with accessibility & focus handling
 * 2. Theme switcher (Dark/Light mode) with localStorage & OS sync
 * 3. Smooth active section scrollspy
 * 4. Interactive project category filter (All, Web & Systems, Branding)
 * 5. Lightbox modal with alternative screenshot view support
 * 6. One-click email copy with instant feedback
 * 7. Accessible contact form validation with mailto composer
 * 8. Scroll reveal animation observer with prefers-reduced-motion support
 */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ---------------------------------------------------------------------------
  // 1. THEME MANAGEMENT (Dark / Light Mode)
  // ---------------------------------------------------------------------------
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-toggle-icon") : null;
  const STORAGE_KEY = "paula_portfolio_theme";

  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark-mode");
      if (themeIcon) themeIcon.textContent = "☀";
      if (themeToggle) {
        themeToggle.setAttribute("aria-label", "Switch to light mode");
        themeToggle.setAttribute("title", "Switch to light mode");
      }
    } else {
      document.body.classList.remove("dark-mode");
      if (themeIcon) themeIcon.textContent = "☾";
      if (themeToggle) {
        themeToggle.setAttribute("aria-label", "Switch to dark mode");
        themeToggle.setAttribute("title", "Switch to dark mode");
      }
    }
  }

  // Determine initial theme: saved preference -> OS preference -> default light
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme !== null) {
    applyTheme(savedTheme === "dark");
  } else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isCurrentlyDark = document.body.classList.contains("dark-mode");
      const newDarkState = !isCurrentlyDark;
      applyTheme(newDarkState);
      localStorage.setItem(STORAGE_KEY, newDarkState ? "dark" : "light");
    });
  }

  // Listen to OS theme changes if user hasn't explicitly set preference
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        applyTheme(e.matches);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 2. MOBILE NAVIGATION
  // ---------------------------------------------------------------------------
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    function toggleMobileMenu(forceClose = false) {
      const isOpen = forceClose ? false : !navLinks.classList.contains("open");
      navLinks.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    }

    menuToggle.addEventListener("click", () => toggleMobileMenu());

    // Close when clicking nav links
    navLinks.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => toggleMobileMenu(true));
    });

    // Close on clicking outside the navbar
    document.addEventListener("click", (event) => {
      if (!navLinks.contains(event.target) && !menuToggle.contains(event.target) && navLinks.classList.contains("open")) {
        toggleMobileMenu(true);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 3. ACCURATE SCROLLSPY (ACTIVE NAVIGATION LINK & LIVING SWISS SCENE SYNC)
  // ---------------------------------------------------------------------------
  const sections = document.querySelectorAll("main section[id]");
  const navigationLinks = document.querySelectorAll(".nav-links .nav-link");

  function updateActiveNavLink() {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );

    // Check if at the bottom of the page
    if (windowHeight + scrollY >= documentHeight - 80) {
      navigationLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#contact");
      });
      if (typeof window.setActiveSwissScene === "function") {
        window.setActiveSwissScene("contact");
      }
      return;
    }

    if (scrollY < 140) {
      navigationLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#home");
      });
      if (typeof window.setActiveSwissScene === "function") {
        window.setActiveSwissScene("home");
      }
      return;
    }

    // Focal line: 38% down the viewport (where natural reading focus rests)
    const focalY = scrollY + windowHeight * 0.38;
    let currentSectionId = "";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + scrollY;
      const height = section.offsetHeight;
      if (focalY >= top && focalY < top + height) {
        currentSectionId = section.getAttribute("id");
      }
    });

    if (currentSectionId) {
      navigationLinks.forEach((link) => {
        const targetHref = link.getAttribute("href");
        link.classList.toggle("active", targetHref === `#${currentSectionId}`);
      });
      if (typeof window.setActiveSwissScene === "function") {
        window.setActiveSwissScene(currentSectionId);
      }
    }
  }

  let scrollThrottleTimer = null;
  window.addEventListener("scroll", () => {
    if (!scrollThrottleTimer) {
      scrollThrottleTimer = setTimeout(() => {
        updateActiveNavLink();
        scrollThrottleTimer = null;
      }, 40);
    }
  }, { passive: true });
  updateActiveNavLink();

  // ---------------------------------------------------------------------------
  // 4. PROJECT & SEMINAR CATEGORY FILTERING
  // ---------------------------------------------------------------------------
  // Project category filter
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        if (filterValue === "all" || cardCategory === filterValue) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });

  // Seminar category filter
  const seminarFilterButtons = document.querySelectorAll(".seminar-filter-btn");
  const seminarCards = document.querySelectorAll(".seminar-card");

  seminarFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      seminarFilterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      seminarCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        if (filterValue === "all" || cardCategory === filterValue) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 5. LIGHTBOX / PROJECT & CERTIFICATE IMAGE PREVIEW MODAL
  // ---------------------------------------------------------------------------
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalClose = document.getElementById("modalClose");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalSecondaryToggle = document.getElementById("modalSecondaryToggle");
  const btnToggleSubView = document.getElementById("btnToggleSubView");

  let activeTriggerElement = null;
  let primaryImageSrc = "";
  let secondaryImageSrc = "";
  let isViewingSecondary = false;

  function openModal(trigger) {
    const primarySrc = trigger.getAttribute("href");
    const secondarySrc = trigger.getAttribute("data-secondary-image") || "";
    const cardTitle = trigger.closest(".project-card")?.querySelector(".project-title")?.textContent
      || trigger.closest(".seminar-card")?.querySelector(".seminar-title")?.textContent
      || trigger.getAttribute("aria-label")
      || "Preview";
    const imgAlt = trigger.querySelector("img")?.alt || trigger.getAttribute("aria-label") || "Preview visual";

    activeTriggerElement = trigger;
    primaryImageSrc = primarySrc;
    secondaryImageSrc = secondarySrc;
    isViewingSecondary = false;

    modalImage.src = primarySrc;
    modalImage.alt = imgAlt;
    if (modalTitle) modalTitle.textContent = cardTitle;

    if (secondarySrc && modalSecondaryToggle && btnToggleSubView) {
      modalSecondaryToggle.style.display = "block";
      btnToggleSubView.textContent = "View Alternative Screen";
    } else if (modalSecondaryToggle) {
      modalSecondaryToggle.style.display = "none";
    }

    imageModal.classList.add("open");
    imageModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!imageModal.classList.contains("open")) return;
    imageModal.classList.remove("open");
    imageModal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
    document.body.style.overflow = "";
    if (activeTriggerElement) {
      activeTriggerElement.focus();
      activeTriggerElement = null;
    }
  }

  // Attach modal trigger listeners for project previews and certificate previews
  document.querySelectorAll(".project-preview, .certificate-preview").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !/\.(png|jpe?g|webp|gif|svg)$/i.test(href)) {
        return;
      }
      event.preventDefault();
      openModal(link);
    });
  });

  // Toggle between primary and secondary image
  if (btnToggleSubView) {
    btnToggleSubView.addEventListener("click", () => {
      if (!secondaryImageSrc) return;
      isViewingSecondary = !isViewingSecondary;
      modalImage.src = isViewingSecondary ? secondaryImageSrc : primaryImageSrc;
      btnToggleSubView.textContent = isViewingSecondary ? "Back to Main Screen" : "View Alternative Screen";
    });
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

  // Global ESC handler
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      if (navLinks && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        if (menuToggle) {
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.setAttribute("aria-label", "Open navigation menu");
        }
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 6. EMAIL COPY TO CLIPBOARD
  // ---------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const copyFeedback = document.getElementById("copyFeedback");
  const contactEmailLink = document.getElementById("contactEmailLink");

  if (copyEmailBtn && contactEmailLink) {
    copyEmailBtn.addEventListener("click", async () => {
      const emailText = contactEmailLink.textContent.trim();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(emailText);
        } else {
          // Fallback for older browsers
          const tempInput = document.createElement("input");
          tempInput.value = emailText;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
        }

        if (copyFeedback) {
          copyFeedback.textContent = "✓ Email copied to clipboard!";
          setTimeout(() => {
            copyFeedback.textContent = "";
          }, 3500);
        }
      } catch (err) {
        if (copyFeedback) copyFeedback.textContent = "Please copy: " + emailText;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 7. CONTACT FORM VALIDATION & MAILTO DRAFTER
  // ---------------------------------------------------------------------------
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");

  const nameFeedback = document.getElementById("nameFeedback");
  const emailFeedback = document.getElementById("emailFeedback");
  const messageFeedback = document.getElementById("messageFeedback");

  function clearFormFeedbacks() {
    if (nameFeedback) nameFeedback.textContent = "";
    if (emailFeedback) emailFeedback.textContent = "";
    if (messageFeedback) messageFeedback.textContent = "";
    if (formMessage) {
      formMessage.className = "form-message";
      formMessage.textContent = "";
      formMessage.style.display = "none";
    }
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFormFeedbacks();

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const subject = subjectInput ? subjectInput.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";

      let hasError = false;

      if (!name) {
        if (nameFeedback) nameFeedback.textContent = "Please provide your name.";
        hasError = true;
      }

      if (!email) {
        if (emailFeedback) emailFeedback.textContent = "Please enter your email address.";
        hasError = true;
      } else if (!isValidEmail(email)) {
        if (emailFeedback) emailFeedback.textContent = "Please enter a valid email address.";
        hasError = true;
      }

      if (!message) {
        if (messageFeedback) messageFeedback.textContent = "Please write your message.";
        hasError = true;
      }

      if (hasError) {
        if (formMessage) {
          formMessage.className = "form-message error";
          formMessage.textContent = "Please fill in all required fields.";
          formMessage.style.display = "block";
        }
        return;
      }

      // Generate mailto link
      const recipient = "yourname@email.com"; // Replace with your exact email
      const emailSubject = encodeURIComponent(
        subject ? `[Portfolio] ${subject} - from ${name}` : `Portfolio Inquiry from ${name}`
      );
      const emailBody = encodeURIComponent(
        `Hello Paula,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`
      );

      if (formMessage) {
        formMessage.className = "form-message success";
        formMessage.textContent = "Preparing your email application draft... Please send the message from your mail client.";
        formMessage.style.display = "block";
      }

      setTimeout(() => {
        window.location.href = `mailto:${recipient}?subject=${emailSubject}&body=${emailBody}`;
      }, 500);
    });
  }

  // ---------------------------------------------------------------------------
  // 8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // ---------------------------------------------------------------------------
  const revealElements = document.querySelectorAll("[data-reveal]");

  // If user prefers reduced motion or browser doesn't support IntersectionObserver, reveal immediately
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("is-revealed"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.1
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // ---------------------------------------------------------------------------
  // 9. AUTOMATIC COPYRIGHT YEAR
  // ---------------------------------------------------------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------------------------------------------------------------------------
  // 10. LIVING SWISS HOME OFFICE - CINEMATIC SCROLL & ANIMATION ENGINE
  // ---------------------------------------------------------------------------
  const swissScene = document.getElementById("swissScene");
  const sceneViewport = document.getElementById("sceneViewport");
  const sceneFrames = document.querySelectorAll(".scene-frame");
  const sceneClouds = document.getElementById("sceneClouds");
  const sceneSunlight = document.getElementById("sceneSunlight");
  const sceneFoliage = document.getElementById("sceneFoliage");
  const sceneWorkspace = document.getElementById("sceneWorkspace");
  const coffeeSteamWrap = document.getElementById("coffeeSteamWrap");
  const motesCanvas = document.getElementById("ambientMotesCanvas");
  const chapterPill = document.getElementById("swissChapterPill");
  const chapterLabel = document.getElementById("chapterLabel");
  const chapterTitle = document.getElementById("chapterTitle");
  const cinemaToggleBtn = document.getElementById("cinemaToggleBtn");

  // Scene Configuration Map (Section -> Swiss Scene Artwork & Lighting)
  const SCENE_CONFIGS = {
    home: {
      scene: "home",
      chapter: "SCENE 01 · HOME",
      title: "Morning in the Alps · Working at Desk",
      lighting: "light-morning",
      steamTop: "61%",
      steamRight: "39%",
      steamOpacity: "1"
    },
    about: {
      scene: "about",
      chapter: "SCENE 02 · ABOUT",
      title: "Mountain Reflection · Contemplation",
      lighting: "light-morning",
      steamTop: "61%",
      steamRight: "39%",
      steamOpacity: "1"
    },
    vision: {
      scene: "vision",
      chapter: "SCENE 03 · VISION",
      title: "Alpine Sunlight · Writing Goals & Mission",
      lighting: "light-noon",
      steamTop: "68%",
      steamRight: "61%",
      steamOpacity: "1"
    },
    skills: {
      scene: "skills",
      chapter: "SCENE 04 · SKILLS",
      title: "Engineering Focus · Building Systems",
      lighting: "light-noon",
      steamTop: "66%",
      steamRight: "59%",
      steamOpacity: "1"
    },
    experience: {
      scene: "experience",
      chapter: "SCENE 05 · EXPERIENCE",
      title: "Forest Valley · Reviewing & Notes",
      lighting: "light-afternoon",
      steamTop: "61%",
      steamRight: "39%",
      steamOpacity: "1"
    },
    seminars: {
      scene: "seminars",
      chapter: "SCENE 06 · LEARNING",
      title: "Swiss Academy · Reviewing Certificate",
      lighting: "light-afternoon",
      steamTop: "68%",
      steamRight: "61%",
      steamOpacity: "1"
    },
    projects: {
      scene: "projects",
      chapter: "SCENE 07 · PROJECTS",
      title: "Swiss Panorama · UI & Architecture",
      lighting: "light-afternoon",
      steamTop: "68%",
      steamRight: "61%",
      steamOpacity: "1"
    },
    contact: {
      scene: "contact",
      chapter: "SCENE 08 · CONTACT",
      title: "Golden Hour Sunset · Looking at the Alps",
      lighting: "light-goldenhour",
      steamTop: "48%",
      steamRight: "21%",
      steamOpacity: "0.85"
    }
  };

  let activeSceneKey = "home";
  let sceneTransitionTimer = null;

  // 10A. SCENE SWITCHER
  function setActiveSwissScene(targetKey) {
    if (!targetKey || !SCENE_CONFIGS[targetKey]) return;
    if (targetKey === activeSceneKey) return;

    const prevKey = activeSceneKey;
    activeSceneKey = targetKey;
    const config = SCENE_CONFIGS[targetKey];

    // Update scene frames with smooth crossfade
    sceneFrames.forEach((frame) => {
      const frameScene = frame.dataset.scene;
      if (frameScene === targetKey) {
        frame.classList.remove("prev-active");
        frame.classList.add("active");
      } else if (frameScene === prevKey) {
        frame.classList.remove("active");
        frame.classList.add("prev-active");
      } else {
        frame.classList.remove("active", "prev-active");
      }
    });

    if (sceneTransitionTimer) clearTimeout(sceneTransitionTimer);
    sceneTransitionTimer = setTimeout(() => {
      sceneFrames.forEach((frame) => {
        if (frame.dataset.scene !== activeSceneKey) {
          frame.classList.remove("prev-active");
        }
      });
      sceneTransitionTimer = null;
    }, 1250);

    // Update Stage Lighting
    if (swissScene) {
      swissScene.classList.remove("light-morning", "light-noon", "light-afternoon", "light-goldenhour");
      if (config.lighting) {
        swissScene.classList.add(config.lighting);
      }
    }

    // Update Chapter Indicator Pill
    if (chapterLabel) chapterLabel.textContent = config.chapter;
    if (chapterTitle) chapterTitle.textContent = config.title;

    // Update Coffee Steam Coordinates
    if (coffeeSteamWrap) {
      coffeeSteamWrap.style.top = config.steamTop;
      coffeeSteamWrap.style.right = config.steamRight;
      coffeeSteamWrap.style.opacity = config.steamOpacity;
    }
  }

  // Expose to window for scrollspy coordination
  window.setActiveSwissScene = setActiveSwissScene;

  // 10B. CINEMA PEEK FULL SCENERY TOGGLE
  if (cinemaToggleBtn) {
    const tooltip = cinemaToggleBtn.querySelector(".cinema-tooltip");
    cinemaToggleBtn.addEventListener("click", () => {
      const isPeekActive = document.body.classList.toggle("cinema-peek-active");
      if (tooltip) {
        tooltip.textContent = isPeekActive ? "Resume Reading" : "Peek Scene";
      }
      cinemaToggleBtn.setAttribute("aria-pressed", String(isPeekActive));
    });

    // Press Escape to exit Cinema Peek
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("cinema-peek-active")) {
        document.body.classList.remove("cinema-peek-active");
        if (tooltip) tooltip.textContent = "Peek Scene";
        cinemaToggleBtn.setAttribute("aria-pressed", "false");
      }
    });
  }

  // 10C. SCROLL-DRIVEN CONTINUOUS DEPTH & CAMERA PARALLAX
  const shouldAnimate = !prefersReducedMotion && swissScene;

  if (shouldAnimate) {
    let ticking = false;

    function onScrollParallax() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? Math.min(Math.max(window.scrollY / docHeight, 0), 1) : 0;

      // Subtle vertical camera dolly & scale
      if (sceneViewport) {
        const panY = scrollProgress * -26;
        const scaleVal = 1.01 + scrollProgress * 0.02;
        sceneViewport.style.transform = `translate3d(0, ${panY}px, 0) scale(${scaleVal})`;
      }

      if (sceneClouds) {
        sceneClouds.style.transform = `translate3d(0, ${scrollProgress * -38}px, 0)`;
      }

      if (sceneSunlight) {
        sceneSunlight.style.transform = `translate3d(0, ${scrollProgress * 18}px, 0)`;
      }

      if (sceneFoliage) {
        sceneFoliage.style.transform = `translate3d(0, ${scrollProgress * -20}px, 0)`;
      }

      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(onScrollParallax);
        ticking = true;
      }
    }, { passive: true });
    onScrollParallax();
  }

  // 10D. INTERACTIVE 60FPS MOUSE PARALLAX (DESKTOP)
  if (shouldAnimate && window.matchMedia("(min-width: 900px)").matches) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMouseActive = false;
    let mouseParallaxRafId = null;

    window.addEventListener("mousemove", (e) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      mouseX = ((e.clientX / width) - 0.5) * 2;
      mouseY = ((e.clientY / height) - 0.5) * 2;
      isMouseActive = true;

      if (!mouseParallaxRafId) {
        mouseParallaxRafId = requestAnimationFrame(renderMouseParallax);
      }
    }, { passive: true });

    window.addEventListener("mouseleave", () => {
      isMouseActive = false;
      mouseX = 0;
      mouseY = 0;
    });

    function renderMouseParallax() {
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      if (sceneViewport) {
        sceneViewport.style.transform = `translate3d(${currentX * -8}px, ${currentY * -5}px, 0)`;
      }

      if (sceneClouds) {
        sceneClouds.style.transform = `translate3d(${currentX * -18}px, ${currentY * -10}px, 0)`;
      }

      if (sceneSunlight) {
        sceneSunlight.style.transform = `translate3d(${currentX * 12}px, ${currentY * 8}px, 0)`;
      }

      if (sceneFoliage) {
        sceneFoliage.style.transform = `translate3d(${currentX * -14}px, ${currentY * -7}px, 0)`;
      }

      if (sceneWorkspace) {
        sceneWorkspace.style.transform = `translate3d(${currentX * -6}px, ${currentY * -3}px, 0)`;
      }

      if (isMouseActive || Math.abs(mouseX - currentX) > 0.001 || Math.abs(mouseY - currentY) > 0.001) {
        mouseParallaxRafId = requestAnimationFrame(renderMouseParallax);
      } else {
        mouseParallaxRafId = null;
      }
    }
  }

  // 10E. FULL-VIEWPORT AMBIENT FLOATING SUNLIGHT MOTES CANVAS
  if (shouldAnimate && motesCanvas) {
    const ctx = motesCanvas.getContext("2d");
    let motesRafId = null;
    let isPageVisible = true;
    let width = 0;
    let height = 0;

    function resizeMotesCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      motesCanvas.width = width * dpr;
      motesCanvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resizeMotesCanvas();
    window.addEventListener("resize", resizeMotesCanvas, { passive: true });

    // 26 golden/cream floating dust motes & pollen
    const particleCount = 26;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || 800),
        radius: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.45) * 0.35,
        speedY: -(Math.random() * 0.4 + 0.12),
        alpha: Math.random() * 0.5 + 0.2,
        baseAlpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2
      });
    }

    function renderMotes() {
      if (!isPageVisible) return;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.body.classList.contains("dark-mode");
      const isGolden = swissScene && swissScene.classList.contains("light-goldenhour");

      let rgb = "244, 215, 145"; // Default warm cream/sunlight
      if (isDark) {
        rgb = "220, 210, 180"; // Starlight silver/gold
      } else if (isGolden) {
        rgb = "255, 185, 110"; // Sunset amber gold
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.angle) * 0.16;
        p.x += p.speedX + Math.sin(p.angle * 0.5) * 0.22;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${Math.max(0.05, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = p.radius * 3.5;
        ctx.shadowColor = `rgba(${rgb}, 0.65)`;
        ctx.fill();
      }

      motesRafId = requestAnimationFrame(renderMotes);
    }

    // Pause rendering when tab is hidden to conserve CPU/battery
    document.addEventListener("visibilitychange", () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && !motesRafId) {
        motesRafId = requestAnimationFrame(renderMotes);
      } else if (!isPageVisible && motesRafId) {
        cancelAnimationFrame(motesRafId);
        motesRafId = null;
      }
    });

    motesRafId = requestAnimationFrame(renderMotes);
  }
});
