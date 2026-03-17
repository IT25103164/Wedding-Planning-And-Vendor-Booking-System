// FAQ Tab Switcher
function switchFaqTab(tab, btn) {
  // Close any open accordion items in ALL panels before switching
  document.querySelectorAll('.faq-panel .accordion-collapse.show').forEach(openItem => {
    const bsCollapse = bootstrap.Collapse.getInstance(openItem);
    if (bsCollapse) {
      bsCollapse.hide();
    } else {
      openItem.classList.remove('show');
    }
    // Also reset the button arrow state
    const toggleBtn = openItem.previousElementSibling?.querySelector('.accordion-button');
    if (toggleBtn) toggleBtn.classList.add('collapsed');
  });

  // Hide all panels
  document.querySelectorAll('.faq-panel').forEach(p => p.classList.add('d-none'));
  // Show selected panel
  const panel = document.getElementById('faq-' + tab);
  if (panel) panel.classList.remove('d-none');

  // Reset all tab buttons
  document.querySelectorAll('.faq-tab').forEach(b => {
    b.style.backgroundColor = 'transparent';
    b.style.color = '#f0ebe1';
    b.style.border = '2px solid rgba(255,255,255,0.3)';
  });
  // Highlight active tab
  btn.style.backgroundColor = 'var(--primary-color)';
  btn.style.color = 'white';
  btn.style.border = 'none';
}

// Auto-close FAQ on Scroll Away
window.addEventListener('scroll', () => {
  const faqSection = document.querySelector('section[style*="background: linear-gradient"]'); // Finding FAQ by unique style
  if (!faqSection) return;

  const rect = faqSection.getBoundingClientRect();
  // If the FAQ section is far enough out of view, close open items
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    document.querySelectorAll('.faq-panel .accordion-collapse.show').forEach(openItem => {
      const bsCollapse = bootstrap.Collapse.getInstance(openItem);
      if (bsCollapse) bsCollapse.hide();
    });
  }
}, { passive: true });

document.addEventListener("DOMContentLoaded", () => {
  // Form Validation Logic
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })

  // Smooth Scrolling for anchor links (if any)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetElement = document.querySelector(this.getAttribute('href'));
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Example: simple password match validation on Registration form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    const pwd = document.getElementById("password");
    const confirmPwd = document.getElementById("confirmPassword");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (pwd.value !== confirmPwd.value) {
        confirmPwd.setCustomValidity("Passwords do not match");
        confirmPwd.reportValidity();
        return;
      } else {
        confirmPwd.setCustomValidity("");
      }

      if (!registerForm.checkValidity()) {
        e.stopPropagation();
        registerForm.classList.add('was-validated');
        return;
      }

      const userData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        role: document.getElementById("role").value,
        password: pwd.value
      };

      const btn = document.getElementById("createAccountBtn");
      const alertBox = document.getElementById("alertMessage");
      btn.disabled = true;
      btn.innerText = "Creating Account...";
      alertBox.classList.add("d-none");
      alertBox.classList.remove("alert-danger", "alert-success");

      try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
          alertBox.classList.remove("d-none");
          alertBox.classList.add("alert-success");
          alertBox.innerText = "Account created successfully! Redirecting to login...";

          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        } else {
          alertBox.classList.remove("d-none");
          alertBox.classList.add("alert-danger");
          alertBox.innerText = data.message || "Registration failed. Please try again.";
          btn.disabled = false;
          btn.innerText = "Create Account";
        }
      } catch (error) {
        alertBox.classList.remove("d-none");
        alertBox.classList.add("alert-danger");
        alertBox.innerText = "Cannot connect to server. Please make sure the backend is running.";
        btn.disabled = false;
        btn.innerText = "Create Account";
      }
    });

    confirmPwd.addEventListener('input', () => {
      if (pwd.value === confirmPwd.value) {
        confirmPwd.setCustomValidity("");
      } else {
        confirmPwd.setCustomValidity("Passwords do not match");
      }
    });
  }

  // ── LOGIN FORM ────────────────────────────────────────────────
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!loginForm.checkValidity()) {
        e.stopPropagation();
        loginForm.classList.add('was-validated');
        return;
      }

      const credentials = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
      };

      const btn = document.getElementById("loginBtn");
      const alertBox = document.getElementById("alertMessage");
      btn.disabled = true;
      btn.innerText = "Logging in...";
      alertBox.classList.add("d-none");
      alertBox.classList.remove("alert-danger", "alert-success", "alert-warning");

      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
          // ✅ Save session data
          sessionStorage.setItem("userId", data.id);
          sessionStorage.setItem("userEmail", data.email);
          sessionStorage.setItem("userRole", data.role);
          sessionStorage.setItem("firstName", data.firstName);
          sessionStorage.setItem("lastName", data.lastName);

          alertBox.classList.remove("d-none");
          alertBox.classList.add("alert-success");
          alertBox.innerText = `Welcome back, ${data.firstName}! Redirecting...`;

          // ── Role-based redirect (ADMIN / VENDOR / CUSTOMER) ──
          setTimeout(() => {
            const role = data.role;
            if (role === "ADMIN") {
              window.location.href = "admin-dashboard.html";
            } else if (role === "VENDOR") {
              window.location.href = "vendor-list.html";
            } else {
              window.location.href = "dashboard.html";   // CUSTOMER
            }
          }, 1200);

        } else if (data.errorCode === "USER_NOT_FOUND") {
          // ❌ No account found → show popup
          btn.disabled = false;
          btn.innerText = "Login";
          showSignUpPopup();

        } else if (data.errorCode === "WRONG_PASSWORD") {
          // ❌ Wrong password → inline alert
          alertBox.classList.remove("d-none");
          alertBox.classList.add("alert-danger");
          alertBox.innerText = "Incorrect password. Please try again.";
          btn.disabled = false;
          btn.innerText = "Login";

        } else {
          // ❌ Generic server error
          alertBox.classList.remove("d-none");
          alertBox.classList.add("alert-danger");
          alertBox.innerText = data.message || "Login failed. Please try again.";
          btn.disabled = false;
          btn.innerText = "Login";
        }

      } catch (error) {
        alertBox.classList.remove("d-none");
        alertBox.classList.add("alert-danger");
        alertBox.innerText = "Cannot connect to server. Please make sure the backend is running.";
        btn.disabled = false;
        btn.innerText = "Login";
      }
    });
  }

  // ── SIGN-UP POPUP (called when user not found) ─────────────
  function showSignUpPopup() {
    // Remove any existing popup first
    const existing = document.getElementById("signUpPopup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.id = "signUpPopup";
    popup.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; animation: fadeIn 0.2s ease;
    `;
    popup.innerHTML = `
      <div style="
        background: #fff; border-radius: 16px; padding: 2.5rem 2rem;
        max-width: 420px; width: 90%; text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        animation: slideUp 0.3s ease;
      ">
        <div style="font-size:3rem; margin-bottom:1rem;">🔍</div>
        <h4 style="font-weight:700; margin-bottom:0.5rem; color:#1a1714;">Account Not Found</h4>
        <p style="color:#6c757d; margin-bottom:1.5rem;">
          No account exists with that email address.<br>
          Please <strong>sign up</strong> to create one.
        </p>
        <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
          <a href="register.html" style="
            background: linear-gradient(135deg, #c9a84c, #a0702a);
            color: #fff; border: none; border-radius: 8px;
            padding: 0.6rem 1.6rem; font-weight:600; font-size:0.95rem;
            text-decoration:none; display:inline-block;
          ">Sign Up Now</a>
          <button onclick="document.getElementById('signUpPopup').remove()" style="
            background: transparent; color: #6c757d; border: 1.5px solid #dee2e6;
            border-radius: 8px; padding: 0.6rem 1.4rem; font-weight:600;
            font-size:0.95rem; cursor:pointer;
          ">Try Again</button>
        </div>
      </div>
      <style>
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(30px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      </style>
    `;
    // Close on backdrop click
    popup.addEventListener("click", (e) => {
      if (e.target === popup) popup.remove();
    });
    document.body.appendChild(popup);
  }

  const ratingStars = document.querySelectorAll('.star-rating i');
  let currentRating = 0;

  ratingStars.forEach((star, index) => {
    star.addEventListener('mouseover', () => {
      highlightStars(index + 1);
    });

    star.addEventListener('mouseout', () => {
      highlightStars(currentRating);
    });

    star.addEventListener('click', () => {
      currentRating = index + 1;
      const ratingInput = document.getElementById('ratingValue');
      if (ratingInput) ratingInput.value = currentRating;
    });
  });

  function highlightStars(count) {
    ratingStars.forEach((star, i) => {
      if (i < count) {
        star.classList.remove('far');
        star.classList.add('fas');
      } else {
        star.classList.remove('fas');
        star.classList.add('far');
      }
    });
  }

  // Horizontal Category Slider Logic
  const slider = document.getElementById('categorySlider');
  if (slider) {
    // Triple clones for infinite visual continuity
    const itemsHTML = slider.innerHTML;
    slider.innerHTML = itemsHTML + itemsHTML + itemsHTML;

    let targetScroll = 0;
    let currentScroll = 0;
    const scrollSpeed = 0.4; // Faster response (was 0.15)

    // Initial jump to center
    setTimeout(() => {
      const item = slider.firstElementChild;
      const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
      const totalWidth = (slider.children.length / 3) * (item.offsetWidth + gap);
      currentScroll = targetScroll = totalWidth;
      slider.scrollLeft = totalWidth;
    }, 100);

    const animate = () => {
      const item = slider.firstElementChild;
      if (!item) return;
      const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
      const totalWidth = (slider.children.length / 3) * (item.offsetWidth + gap);

      // 1. Auto-drift
      targetScroll += 1;

      // 2. Wrap boundaries
      if (targetScroll >= totalWidth * 2) {
        targetScroll -= totalWidth;
        currentScroll -= totalWidth;
      } else if (targetScroll <= 0) {
        targetScroll += totalWidth;
        currentScroll += totalWidth;
      }

      // 3. Smooth Lerp
      currentScroll += (targetScroll - currentScroll) * scrollSpeed;
      slider.scrollLeft = currentScroll;

      requestAnimationFrame(animate);
    };

    // Inverted: Mouse/Touch on Right (delta > 0) -> targetScroll decreases -> Cards move Right
    slider.addEventListener('mousemove', (e) => {
      const mouseX = e.pageX - slider.offsetLeft;
      const midX = slider.clientWidth / 2;
      const delta = (mouseX - midX) / midX;
      targetScroll -= delta * 15;
    });

    slider.addEventListener('touchmove', (e) => {
      const touchX = e.touches[0].pageX - slider.offsetLeft;
      const midX = slider.clientWidth / 2;
      const delta = (touchX - midX) / midX;
      targetScroll -= delta * 15;
    }, { passive: true });

    requestAnimationFrame(animate);

  }

  // ============================================================
  //  HERO SECTION — SCROLL ANIMATIONS
  // ============================================================
  const heroSection = document.querySelector('.hero-section');
  const heroContent = document.querySelector('.hero-content');
  const navbar = document.querySelector('.navbar');
  const scrollArrow = document.getElementById('heroScrollArrow');

  if (heroSection && heroContent) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      const progress = Math.min(scrollY / heroHeight, 1); // 0 → 1 as hero scrolls out

      // 1. Parallax — move background upward at half scroll speed
      heroSection.style.backgroundPositionY = `calc(50% + ${scrollY * 0.35}px)`;

      // 2. Hero content — fade out + slide up as user scrolls
      const contentOpacity = 1 - progress * 1.8;       // fully gone before 60% scroll
      const contentTranslate = scrollY * 0.25;            // moves up gently
      heroContent.style.opacity = Math.max(0, contentOpacity);
      heroContent.style.transform = `translateY(-${contentTranslate}px)`;

      // 3. Scroll Arrow — fade out early
      if (scrollArrow) {
        scrollArrow.style.opacity = Math.max(0, 1 - progress * 4);
      }

      // 4. Navbar — deepen shadow + add slight tint when scrolled
      if (scrollY > 60) {
        navbar.style.backgroundColor = 'rgba(250, 247, 241, 0.98)';
        navbar.style.boxShadow = '0 4px 24px rgba(26,23,20,0.12)';
      } else {
        navbar.style.backgroundColor = 'rgba(250, 247, 241, 0.96)';
        navbar.style.boxShadow = '0 2px 20px rgba(26,23,20,0.08)';
      }
    }, { passive: true });
  }

  // Scroll-down arrow click — smooth scroll to next section
  if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
      const nextSection = heroSection.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ============================================================
  //  TESTIMONIALS — SEAMLESS INFINITE TRACKING
  // ============================================================

  const setupExploreStyleMarquee = (marqueeId, autoSpeed = 1) => {
    const slider = document.getElementById(marqueeId);
    if (!slider) return;
    const wrapper = slider.parentElement;

    // Triple content for infinity
    const itemsHTML = slider.innerHTML;
    slider.innerHTML = itemsHTML + itemsHTML + itemsHTML;

    let targetScroll = 0;
    let currentScroll = 0;
    const lerp = 0.45; // Faster response (was 0.12)

    setTimeout(() => {
      const item = slider.firstElementChild;
      const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
      const totalWidth = (slider.children.length / 3) * (item.offsetWidth + gap);
      currentScroll = targetScroll = totalWidth;
      wrapper.scrollLeft = totalWidth;
    }, 100);

    const animate = () => {
      const item = slider.firstElementChild;
      if (!item) return;
      const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
      const totalWidth = (slider.children.length / 3) * (item.offsetWidth + gap);

      // 1. Auto movement
      targetScroll += autoSpeed;

      // 2. Wrap boundaries
      if (targetScroll >= totalWidth * 2) {
        targetScroll -= totalWidth;
        currentScroll -= totalWidth;
      } else if (targetScroll <= 0) {
        targetScroll += totalWidth;
        currentScroll += totalWidth;
      }

      // 3. Smooth follow
      currentScroll += (targetScroll - currentScroll) * lerp;
      wrapper.scrollLeft = currentScroll;

      requestAnimationFrame(animate);
    };

    wrapper.addEventListener('mousemove', (e) => {
      const mouseX = e.pageX - wrapper.offsetLeft;
      const midX = wrapper.clientWidth / 2;
      const delta = (mouseX - midX) / midX;
      // Inverted: Mouse on Right -> targetScroll decreases -> Cards move Right
      targetScroll -= delta * 20;
    });

    wrapper.addEventListener('touchmove', (e) => {
      const touchX = e.touches[0].pageX - wrapper.offsetLeft;
      const midX = wrapper.clientWidth / 2;
      const delta = (touchX - midX) / midX;
      targetScroll -= delta * 20;
    }, { passive: true });

    requestAnimationFrame(animate);
  };

  // Row 1 drifts Right, Row 2 drifts Left
  setupExploreStyleMarquee('feedbackMarqueeLTR', 0.5);
  setupExploreStyleMarquee('feedbackMarqueeRTL', -0.5);


  // Star Rating Selection (Reusable for any container)
  const setupStarRating = (containerId, hiddenInputId = null) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stars = container.querySelectorAll('i');
    stars.forEach(star => {
      star.addEventListener('click', function () {
        const rating = parseInt(this.getAttribute('data-rating'));

        // Remove active from all stars in this container
        stars.forEach(s => s.classList.remove('active'));

        // Add active to the clicked star specifically
        // CSS will handle highlighting this star and everything to its RIGHT (~ i)
        this.classList.add('active');

        // Update Hidden Input (if provided)
        if (hiddenInputId) {
          document.getElementById(hiddenInputId).value = rating;
        }
      });
    });
  };

  setupStarRating('quickStarRating');
  setupStarRating('formStarRating', 'modalRatingValue');

  // Handle Feedback Form Submission
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = feedbackForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;

      submitBtn.disabled = true;
      submitBtn.innerText = 'Sharing Your Story...';

      // Simulate a small delay for premium feel
      setTimeout(() => {
        alert('Thank you for sharing your beautiful wedding story with us! 💍✨');

        // Close modal (Bootstrap 5 way)
        const modalEl = document.getElementById('feedbackModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();

        // Reset form
        feedbackForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;

        // Reset stars in form to empty/gray state
        const stars = document.getElementById('formStarRating').querySelectorAll('i');
        stars.forEach(s => {
          s.classList.remove('active');
          s.style.color = '#ddd';
        });
        const ratingInput = document.getElementById('modalRatingValue');
        if (ratingInput) ratingInput.value = "0";
      }, 1500);
    });
  }
});

// Global function for quick rating button
function submitQuickRating() {
  const starsContainer = document.getElementById('quickStarRating');
  const activeStars = starsContainer.querySelectorAll('i.active').length;

  if (activeStars === 0) {
    alert('Please pick a star rating first! ⭐');
    return;
  }

  alert(`Thank you for your ${activeStars}-star quick rating! We appreciate it. 🌟`);

  // Reset quick stars
  starsContainer.querySelectorAll('i').forEach(s => {
    s.classList.remove('active');
    s.style.color = '#ddd';
  });
}

// ── ADMIN QUICK LOGIN ──────────────────────────────────────────
// Called by the "Login as Admin" button on login.html.
function loginAsAdmin() {
  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value;
  const alertBox = document.getElementById("alertMessage");

  if (!emailInput || !passwordInput) {
    alertBox.classList.remove("d-none", "alert-success", "alert-warning");
    alertBox.classList.add("alert-danger");
    alertBox.innerText = "Please enter both email and password to login.";
    return;
  }

  const adminBtn = document.getElementById("adminLoginBtn");
  if (adminBtn) {
    adminBtn.disabled = true;
    adminBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color:#c9a84c;"></i>&nbsp;Signing in as Admin...';
  }

  alertBox.classList.add("d-none"); // Hide existing alerts

  const adminData = {
    email: emailInput,
    password: passwordInput
  };

  fetch("http://localhost:8080/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(adminData)
  })
    // Parse as text first because backend might return a plain string error
    .then(async res => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return { errorMsg: text };
      }
    })
    .then(data => {
      // If it returned the admin object (has email property)
      if (data && data.email) {
        sessionStorage.setItem("userEmail", data.email);
        sessionStorage.setItem("userRole", "ADMIN");

        alertBox.classList.remove("d-none", "alert-danger");
        alertBox.classList.add("alert-success");
        alertBox.innerText = "Admin login successful! Redirecting...";

        setTimeout(() => {
          window.location.href = "admin-dashboard.html";
        }, 1200);
      } else {
        // Backend returned a string error message or didn't return an admin object
        const msg = data.errorMsg || "Admin login failed.";
        alertBox.classList.remove("d-none", "alert-success");
        alertBox.classList.add("alert-danger");
        alertBox.innerText = msg;

        if (adminBtn) {
          adminBtn.disabled = false;
          adminBtn.innerHTML = '<i class="fa-solid fa-shield-halved" style="color:#c9a84c;"></i>&nbsp;Login as Admin';
        }
      }
    })
    .catch(err => {
      alertBox.classList.remove("d-none", "alert-success");
      alertBox.classList.add("alert-danger");
      alertBox.innerText = "Admin login failed due to a server error.";

      if (adminBtn) {
        adminBtn.disabled = false;
        adminBtn.innerHTML = '<i class="fa-solid fa-shield-halved" style="color:#c9a84c;"></i>&nbsp;Login as Admin';
      }
    });
}
