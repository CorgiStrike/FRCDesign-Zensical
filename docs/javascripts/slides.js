(function () {
  function initSlideshow(slideshow) {

    const imgs = Array.from(slideshow.querySelectorAll('img'));
    if (!imgs.length) return;

    const inner = document.createElement('div');
    inner.className = 'slideshow-inner';

    imgs.forEach((img) => {
      const slide = document.createElement('figure');
      slide.className = 'slide';

      const frame = document.createElement('div');
      frame.className = 'slide-image';

      frame.appendChild(img);
      slide.appendChild(frame);

      const captionText = img.getAttribute('data-caption');
      if (captionText) {
        const caption = document.createElement('figcaption');
        caption.textContent = captionText;
        slide.appendChild(caption);
      }

      inner.appendChild(slide);
    });

    while (slideshow.firstChild) slideshow.removeChild(slideshow.firstChild);
    slideshow.appendChild(inner);

    const slides = Array.from(slideshow.querySelectorAll('.slide'));
    if (!slides.length) return;

    const slideImages = slides.map((s) => s.querySelector('img'));
    const slideCaptions = slides.map((s) => {
      const fc = s.querySelector('figcaption');
      return fc ? fc.textContent : '';
    });

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

    slides.forEach((slide) => {
      const frame = slide.querySelector('.slide-image');

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

      frame.addEventListener('click', openLightbox);
    });

    const lightbox = document.createElement('div');
    lightbox.className = 'slideshow-lightbox';
    lightbox.innerHTML = `
      <div class="slideshow-lightbox-content">
        <button class="slideshow-lightbox-close" aria-label="Close">&times;</button>
        <div class="slideshow-lightbox-image-wrapper">
          <img class="slideshow-lightbox-image" alt="">
          <button class="slideshow-lightbox-nav slideshow-lightbox-prev">&#10094;</button>
          <button class="slideshow-lightbox-nav slideshow-lightbox-next">&#10095;</button>
        </div>
        <div class="slideshow-lightbox-caption"></div>
      </div>
    `;

    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector('.slideshow-lightbox-image');
    const lbCaption = lightbox.querySelector('.slideshow-lightbox-caption');
    const lbClose = lightbox.querySelector('.slideshow-lightbox-close');
    const lbPrev = lightbox.querySelector('.slideshow-lightbox-prev');
    const lbNext = lightbox.querySelector('.slideshow-lightbox-next');

    function updateLightbox() {
      const img = slideImages[index];
      lbImg.src = img ? img.src : '';
      lbImg.alt = img ? img.alt : '';
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

    slides[0].classList.add('active');
    updateActiveDot();
  }

  function initAllSlideshows() {
    document.querySelectorAll('.slideshow').forEach(initSlideshow);
  }

  document.addEventListener('DOMContentLoaded', initAllSlideshows);
})();
