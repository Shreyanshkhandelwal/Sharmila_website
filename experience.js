/* ==========================================================================
   Mocha Story Lab: Experience Section Interactive Controller
   Handles scroll reveals, 3D card interactions, lightbox modal,
   event tabs, and mobile swipe.
   ========================================================================== */

(function () {
  'use strict';

  function initExperienceSection() {
    // 1. Manifesto Scroll-Triggered Reveal
    var manifestoSentences = document.querySelectorAll('.exp-manifesto-sentence');
    if (manifestoSentences.length > 0 && 'IntersectionObserver' in window) {
      var sentenceObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, {
        threshold: 0.25,
        rootMargin: '0px 0px -50px 0px'
      });

      manifestoSentences.forEach(function (sentence) {
        sentenceObserver.observe(sentence);
      });
    } else {
      manifestoSentences.forEach(function (sentence) {
        sentence.classList.add('is-visible');
      });
    }

    // 2. Beyond Visibility Section & Sliding Parrot
    var beyondBlock = document.querySelector('.exp-beyond-block');
    if (beyondBlock && 'IntersectionObserver' in window) {
      var beyondObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            beyondBlock.classList.add('parrot-active');
          }
        });
      }, {
        threshold: 0.3
      });
      beyondObserver.observe(beyondBlock);
    } else if (beyondBlock) {
      beyondBlock.classList.add('parrot-active');
    }

    // 3. Gallery Lightbox Modal
    var galleryItems = document.querySelectorAll('.exp-gallery-item');
    var lightboxOverlay = document.getElementById('exp-lightbox-overlay');
    var lightboxImg = document.getElementById('exp-lightbox-img');
    var lightboxTag = document.getElementById('exp-lightbox-tag');
    var lightboxTitle = document.getElementById('exp-lightbox-title');
    var lightboxDesc = document.getElementById('exp-lightbox-desc');
    var lightboxCloseBtn = document.getElementById('exp-lightbox-close');

    if (galleryItems.length > 0 && lightboxOverlay) {
      galleryItems.forEach(function (item) {
        item.addEventListener('click', function () {
          var img = item.querySelector('img');
          var tag = item.getAttribute('data-tag') || (item.querySelector('.exp-gallery-tag') ? item.querySelector('.exp-gallery-tag').textContent : '');
          var title = item.getAttribute('data-title') || (item.querySelector('.exp-gallery-title') ? item.querySelector('.exp-gallery-title').textContent : '');
          var desc = item.getAttribute('data-desc') || 'A signature Mocha Story Lab experiential convening where physical nuance and narrative depth converge.';

          if (lightboxImg && img) lightboxImg.src = img.src;
          if (lightboxTag) lightboxTag.textContent = tag;
          if (lightboxTitle) lightboxTitle.textContent = title;
          if (lightboxDesc) lightboxDesc.textContent = desc;

          lightboxOverlay.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        });
      });

      function closeLightbox() {
        lightboxOverlay.classList.remove('is-open');
        document.body.style.overflow = '';
      }

      if (lightboxCloseBtn) {
        lightboxCloseBtn.addEventListener('click', closeLightbox);
      }

      lightboxOverlay.addEventListener('click', function (e) {
        if (e.target === lightboxOverlay) {
          closeLightbox();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightboxOverlay.classList.contains('is-open')) {
          closeLightbox();
        }
      });
    }

    // 4. Upcoming & Past Events Tabs
    var tabBtns = document.querySelectorAll('.exp-tab-btn');
    var tabPanels = document.querySelectorAll('.exp-tab-panel');

    if (tabBtns.length > 0) {
      tabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetTab = btn.getAttribute('data-tab');

          tabBtns.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-selected', 'false');
          });
          tabPanels.forEach(function (p) {
            p.classList.remove('is-active');
          });

          btn.classList.add('is-active');
          btn.setAttribute('aria-selected', 'true');

          var activePanel = document.getElementById('exp-panel-' + targetTab);
          if (activePanel) {
            activePanel.classList.add('is-active');
          }
        });
      });
    }

    // 5. Mobile Drag Scroll for Types of Experience Cards
    var cardsWrap = document.querySelector('.exp-cards-slider-wrap');
    if (cardsWrap) {
      var isDown = false;
      var startX;
      var scrollLeft;

      cardsWrap.addEventListener('mousedown', function (e) {
        isDown = true;
        startX = e.pageX - cardsWrap.offsetLeft;
        scrollLeft = cardsWrap.scrollLeft;
      });

      cardsWrap.addEventListener('mouseleave', function () {
        isDown = false;
      });

      cardsWrap.addEventListener('mouseup', function () {
        isDown = false;
      });

      cardsWrap.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        e.preventDefault();
        var x = e.pageX - cardsWrap.offsetLeft;
        var walk = (x - startX) * 1.5;
        cardsWrap.scrollLeft = scrollLeft - walk;
      });
    }

    // 6. Sticky CTA Dynamic Switcher (When scrolling through Experience section)
    var expSection = document.getElementById('experience');
    var stickyCtaText = document.querySelector('.mocha-sticky-cta__text');

    if (expSection && stickyCtaText && 'IntersectionObserver' in window) {
      var ctaObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            stickyCtaText.textContent = 'Create an Experience →';
          } else {
            stickyCtaText.textContent = 'Clarity Begins Here.';
          }
        });
      }, {
        threshold: 0.15
      });
      ctaObserver.observe(expSection);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExperienceSection);
  } else {
    initExperienceSection();
  }
})();
