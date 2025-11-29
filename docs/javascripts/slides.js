(function () {
  // Renders markdown if the 'marked' library is available
  // Used for both fallback attributes and sibling caption content
  function renderMarkdown(md) {
    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(md);
    }
    return md;
  }

  function initSlideshow(slideshow) {
    // Gather content
    const children = Array.from(slideshow.children);
    const slidesData = [];

    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      let isMedia = false;
      let mediaType = '';

      // Check if current node is an image
      if (node.tagName.toLowerCase() === 'img') {
        isMedia = true;
        mediaType = 'img';
      } 
      // Check if current node is a youtube placeholder
      else if (node.hasAttribute('data-youtube-id')) {
        isMedia = true;
        mediaType = 'video';
      }

      if (isMedia) {
        const slideItem = {
          mediaNode: node,
          mediaType: mediaType,
          captionHTML: ''
        };

        // Check if next sibling is a caption
        const nextNode = children[i + 1];
        if (nextNode && nextNode.classList.contains('slide-caption')) {
          slideItem.captionHTML = renderMarkdown(nextNode.innerHTML.trim());
          
          i++; 
        } else {
          // Fallback: Check attributes on the media node itself
          const attrText = node.getAttribute('data-caption') || node.getAttribute('alt') || '';
          if (attrText) {
            slideItem.captionHTML = renderMarkdown(attrText);
          }
        }

        slidesData.push(slideItem);
      }
    }

    if (slidesData.length === 0) return;

    // Build slideshow DOM
    const inner = document.createElement('div');
    inner.className = 'slideshow-inner';

    slidesData.forEach((item) => {
      const slide = document.createElement('figure');
      slide.className = 'slide';

      const frame = document.createElement('div');
      frame.className = 'slide-image';

      let mediaElement;

      if (item.mediaType === 'img') {
        mediaElement = item.mediaNode.cloneNode(true);
      } else if (item.mediaType === 'video') {
        const id = item.mediaNode.getAttribute('data-youtube-id');
        const iframe = document.createElement('iframe');
        iframe.className = 'slideshow-video';
        // FIX: Add enablejsapi=1 to allow pausing via postMessage
        iframe.src =
          'https://www.youtube.com/embed/' +
          id +
          '?rel=0&controls=1&showinfo=0&vq=hd1080&enablejsapi=1';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        mediaElement = iframe;
      }

      frame.appendChild(mediaElement);
      slide.appendChild(frame);

      // Add caption if it exists
      if (item.captionHTML && item.captionHTML.trim() !== '') {
        const caption = document.createElement('figcaption');
        caption.innerHTML = item.captionHTML;
        slide.appendChild(caption);
      }

      inner.appendChild(slide);
    });

    // Clear original content and append new structure
    slideshow.innerHTML = '';
    slideshow.appendChild(inner);

    // 3. INITIALIZE NAVIGATION & EVENTS
    const slides = Array.from(slideshow.querySelectorAll('.slide'));
    if (!slides.length) return;

    const slideMedia = slides.map((s) =>
      s.querySelector('img, iframe.slideshow-video')
    );
    // Re-map types based on the DOM we just built
    const slideTypes = slideMedia.map((m) => {
      if (!m) return null;
      if (m.tagName.toLowerCase() === 'img') return 'img';
      return 'video';
    });
    
    // Re-map captions from the DOM
    const slideCaptions = slides.map((s) => {
      const fc = s.querySelector('figcaption');
      return fc ? fc.innerHTML : '';
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
      const currentSlide = slides[index];
      const currentVideo = currentSlide.querySelector('iframe');
      if (currentVideo) {
        // Post message to YouTube API to pause video
        currentVideo.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }

      slides[index].classList.remove('active');
      index = (newIndex + slides.length) % slides.length;
      slides[index].classList.add('active');
      updateActiveDot();
      if (lightboxOpen) updateLightbox();
    }

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

      if (type === 'img') {
        frame.addEventListener('click', openLightbox);
      }
    });

    // Lightbox construction
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
        lbVideo.style.display = 'none';
        lbVideo.src = '';
        lbImg.style.display = 'block';
        lbImg.src = media.src;
        lbImg.alt = media.alt || '';
      } else if (type === 'video') {
        lbImg.style.display = 'none';
        lbImg.src = '';
        lbVideo.style.display = 'block';
        // Ensure the lightbox video also has JS API enabled if needed
        let src = media.src;
        if (!src.includes('enablejsapi=1')) {
             src += (src.includes('?') ? '&' : '?') + 'enablejsapi=1';
        }
        lbVideo.src = src;
      }

      lbCaption.innerHTML = slideCaptions[index] || '';
    }

    function openLightbox() {
      lightbox.classList.add('is-open');
      lightboxOpen = true;
      updateLightbox();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightboxOpen = false;
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

    // Initialize first slide
    slides[0].classList.add('active');
    updateActiveDot();
  }

  function initAllSlideshows() {
    document.querySelectorAll('.slideshow').forEach((slideshow) => {
      if (slideshow.dataset.slideshowInitialized === 'true') return;
      slideshow.dataset.slideshowInitialized = 'true';
      initSlideshow(slideshow);
    });
  }

  if (window.document$ && typeof document$.subscribe === 'function') {
    document$.subscribe(() => {
      initAllSlideshows();
    });
  } else {
    document.addEventListener('DOMContentLoaded', initAllSlideshows);
    window.addEventListener('pageshow', initAllSlideshows);
  }
})();