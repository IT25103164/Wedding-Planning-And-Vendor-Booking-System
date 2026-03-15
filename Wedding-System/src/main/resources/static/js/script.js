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

    registerForm.addEventListener("submit", (e) => {
      if (pwd.value !== confirmPwd.value) {
        e.preventDefault();
        confirmPwd.setCustomValidity("Passwords do not match");
        confirmPwd.reportValidity();
      } else {
        confirmPwd.setCustomValidity("");
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

  // Example: Display selected rating on Review pages
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
  const heroSection  = document.querySelector('.hero-section');
  const heroContent  = document.querySelector('.hero-content');
  const navbar       = document.querySelector('.navbar');
  const scrollArrow  = document.getElementById('heroScrollArrow');

  if (heroSection && heroContent) {
    window.addEventListener('scroll', () => {
      const scrollY      = window.scrollY;
      const heroHeight   = heroSection.offsetHeight;
      const progress     = Math.min(scrollY / heroHeight, 1); // 0 → 1 as hero scrolls out

      // 1. Parallax — move background upward at half scroll speed
      heroSection.style.backgroundPositionY = `calc(50% + ${scrollY * 0.35}px)`;

      // 2. Hero content — fade out + slide up as user scrolls
      const contentOpacity   = 1 - progress * 1.8;       // fully gone before 60% scroll
      const contentTranslate = scrollY * 0.25;            // moves up gently
      heroContent.style.opacity   = Math.max(0, contentOpacity);
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
      star.addEventListener('click', function() {
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

