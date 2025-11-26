(function () {
  function initSlideshow(slideshow) {
    // 1) Collect images + YouTube placeholders
    const mediaNodes = Array.from(
      slideshow.querySelectorAll('img, [data-youtube-id]')
    );
    if (!mediaNodes.length) return;

    // 2) Build slideshow structure
    const inner = document.createElement('div');
    inner.className = 'slideshow-inner';

    mediaNodes.forEach((node) => {
      const slide = document.createElement('figure');
      slide.className = 'slide';

      const frame = document.createElement('div');
      frame.className = 'slide-image';

      let mediaElement;
      let mediaType;

      if (node.tagName.toLowerCase() === 'img') {
        mediaElement = node;
        mediaType = 'img';
      } else if (node.hasAttribute('data-youtube-id')) {
        const id = node.getAttribute('data-youtube-id');

        const iframe = document.createElement('iframe');
        iframe.className = 'slideshow-video';
        iframe.src =
          'https://www.youtube.com/embed/' +
          id +
          '?rel=0&controls=1&showinfo=0&vq=hd1080';
        iframe.title =
          node.getAttribute('data-title') || 'YouTube video player';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        );
        iframe.setAttribute('allowfullscreen', '');

        mediaElement = iframe;
        mediaType = 'video';
      }

      if (!mediaElement) return;

      frame.appendChild(mediaElement);
      slide.appendChild(frame);

      const captionText =
        node.getAttribute('data-caption') || node.getAttribute('alt') || '';
      if (captionText) {
        const caption = document.createElement('figcaption');
        caption.textContent = captionText;
        slide.appendChild(caption);
      }

      inner.appendChild(slide);
    });

    // Replace original content
    while (slideshow.firstChild) slideshow.removeChild(slideshow.firstChild);
    slideshow.appendChild(inner);

    const slides = Array.from(slideshow.querySelectorAll('.slide'));
    if (!slides.length) return;

    const slideMedia = slides.map((s) =>
      s.querySelector('img, iframe.slideshow-video')
    );
    const slideTypes = slideMedia.map((m) => {
      if (!m) return null;
      if (m.tagName.toLowerCase() === 'img') return 'img';
      return 'video'; // iframe
    });
    const slideCaptions = slides.map((s) => {
      const fc = s.querySelector('figcaption');
      return fc ? fc.textContent : '';
    });

    // ---------- Dots ----------
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slideshow-dots';

    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slideshow-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dotsContainer.appendChild(dot);
      dot.addEventListener('click', () => showSlide(i));
      return dot;
    });

    slideshow.appendChild(dotsContainer);

    let index = 0;
    let lightboxOpen = false;

    function updateActiveDot() {
      dots.forEach((d) => d.classList.remove('active'));
      if (dots[index]) dots[index].classList.add('active');
    }

    function showSlide(newIndex) {
      slides[index].classList.remove('active');
      index = (newIndex + slides.length) % slides.length;
      slides[index].classList.add('active');
      updateActiveDot();
      if (lightboxOpen) updateLightbox();
    }

    // ---------- Arrows + click-to-enlarge for image slides ----------
    slides.forEach((slide, i) => {
      const frame = slide.querySelector('.slide-image');
      const type = slideTypes[i];

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'slideshow-nav-btn slideshow-nav-btn--prev';
      prevBtn.innerHTML = '&#10094;';
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(index - 1);
      });

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'slideshow-nav-btn slideshow-nav-btn--next';
      nextBtn.innerHTML = '&#10095;';
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(index + 1);
      });

      frame.appendChild(prevBtn);
      frame.appendChild(nextBtn);

      // Only images open lightbox on click
      if (type === 'img') {
        frame.addEventListener('click', openLightbox);
      }
    });

    // ---------------- LIGHTBOX (images + videos) ----------------

    const lightbox = document.createElement('div');
    lightbox.className = 'slideshow-lightbox';
    lightbox.innerHTML = `
      <div class="slideshow-lightbox-content">
        <button class="slideshow-lightbox-close" aria-label="Close">&times;</button>
        <div class="slideshow-lightbox-image-wrapper">
          <img class="slideshow-lightbox-image" alt="">
          <iframe class="slideshow-lightbox-video" allowfullscreen></iframe>
          <button class="slideshow-lightbox-nav slideshow-lightbox-prev">&#10094;</button>
          <button class="slideshow-lightbox-nav slideshow-lightbox-next">&#10095;</button>
        </div>
        <div class="slideshow-lightbox-caption"></div>
      </div>
    `;

    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector('.slideshow-lightbox-image');
    const lbVideo = lightbox.querySelector('.slideshow-lightbox-video');
    const lbCaption = lightbox.querySelector('.slideshow-lightbox-caption');
    const lbClose = lightbox.querySelector('.slideshow-lightbox-close');
    const lbPrev = lightbox.querySelector('.slideshow-lightbox-prev');
    const lbNext = lightbox.querySelector('.slideshow-lightbox-next');

    function updateLightbox() {
      const media = slideMedia[index];
      const type = slideTypes[index];

      if (!media) return;

      if (type === 'img') {
        // show image, hide & stop video
        lbVideo.style.display = 'none';
        lbVideo.src = '';
        lbImg.style.display = 'block';
        lbImg.src = media.src;
        lbImg.alt = media.alt || '';
      } else if (type === 'video') {
        // show video, hide image
        lbImg.style.display = 'none';
        lbImg.src = '';
        lbVideo.style.display = 'block';
        lbVideo.src = media.src;
      }

      lbCaption.textContent = slideCaptions[index] || '';
    }

    function openLightbox() {
      lightbox.classList.add('is-open');
      lightboxOpen = true;
      updateLightbox();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightboxOpen = false;
      // stop any playing video
      lbVideo.src = '';
    }

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => showSlide(index - 1));
    lbNext.addEventListener('click', () => showSlide(index + 1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showSlide(index - 1);
      if (e.key === 'ArrowRight') showSlide(index + 1);
    });

    // init
    slides[0].classList.add('active');
    updateActiveDot();
  }

  function initAllSlideshows() {
    document.querySelectorAll('.slideshow').forEach(initSlideshow);
  }

  document.addEventListener('DOMContentLoaded', initAllSlideshows);
})();
