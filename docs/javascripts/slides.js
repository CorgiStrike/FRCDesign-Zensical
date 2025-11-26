(function () {
  function initSlideshow(slideshow) {
    const imgs = Array.from(slideshow.querySelectorAll('img'));
    if (imgs.length === 0) return;

    const inner = document.createElement('div');
    inner.className = 'slideshow-inner';

    imgs.forEach((img) => {
      const figure = document.createElement('figure');
      figure.className = 'slide';

      const frame = document.createElement('div');
      frame.className = 'slide-image';

      frame.appendChild(img);
      figure.appendChild(frame);

      const captionText = img.getAttribute('data-caption');
      if (captionText) {
        const caption = document.createElement('figcaption');
        caption.textContent = captionText;
        figure.appendChild(caption);
      }

      inner.appendChild(figure);
    });

    while (slideshow.firstChild) {
      slideshow.removeChild(slideshow.firstChild);
    }
    slideshow.appendChild(inner);

    const slides = Array.from(slideshow.querySelectorAll('.slide'));
    if (!slides.length) return;

    let index = 0;

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

    function showSlide(newIndex) {
      slides[index].classList.remove('active');
      index = (newIndex + slides.length) % slides.length;
      slides[index].classList.add('active');

      dots.forEach((d) => d.classList.remove('active'));
      dots[index].classList.add('active');
    }

    slides.forEach(() => {});

    slides.forEach((slide) => {
      const frame = slide.querySelector('.slide-image');

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'slideshow-nav-btn slideshow-nav-btn--prev';
      prevBtn.innerHTML = '&#10094;';
      prevBtn.addEventListener('click', () => showSlide(index - 1));

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'slideshow-nav-btn slideshow-nav-btn--next';
      nextBtn.innerHTML = '&#10095;';
      nextBtn.addEventListener('click', () => showSlide(index + 1));

      frame.appendChild(prevBtn);
      frame.appendChild(nextBtn);
    });

    showSlide(0);
  }

  function initAllSlideshows() {
    document.querySelectorAll('.slideshow').forEach(initSlideshow);
  }

  document.addEventListener('DOMContentLoaded', initAllSlideshows);
})();
