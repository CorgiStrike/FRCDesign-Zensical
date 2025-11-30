(function () {
  // Renders markdown if the 'marked' library is available
  function renderMarkdown(md) {
    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(md);
    }
    return md;
  }

  function initSlideshow(slideshow) {
    // Check if user manually enforced a ratio
    const userAspectRatio = slideshow.getAttribute('data-aspect-ratio');
    
    // We will track the "widest" aspect ratio found among all slides.
    let calculatedMaxRatio = 0;

    // HELPER: Calculate effective ratio including CSS scaling (width="90%")
    function getEffectiveRatio(node) {
        let w, h;
        if (node.tagName.toLowerCase() === 'img') {
            w = node.naturalWidth;
            h = node.naturalHeight;
            if (!w || !h) {
                w = parseFloat(node.getAttribute('width'));
                h = parseFloat(node.getAttribute('height'));
            }
        } else {
            return 16 / 9;
        }

        if (!w || !h) return 0;
        let ratio = w / h;

        let scale = 1;
        const styleWidth = node.style.width;
        const attrWidth = node.getAttribute('width');

        if (styleWidth && styleWidth.endsWith('%')) {
            scale = parseFloat(styleWidth) / 100;
        } else if (attrWidth && attrWidth.endsWith('%')) {
            scale = parseFloat(attrWidth) / 100;
        }

        if (scale > 0 && scale <= 1) {
            ratio = ratio / scale;
        }

        return ratio;
    }

    // Gather slide data
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
          captionHTML: '',
          ratio: 0 
        };

        // Attempt to determine aspect ratio immediately
        if (mediaType === 'video') {
            slideItem.ratio = 16 / 9;
        } else if (mediaType === 'img') {
            if (node.complete && node.naturalHeight > 0) {
                 slideItem.ratio = getEffectiveRatio(node);
            }
        }

        if (slideItem.ratio > calculatedMaxRatio) {
            calculatedMaxRatio = slideItem.ratio;
        }

        // Check if next sibling is a caption
        const nextNode = children[i + 1];
        if (nextNode && nextNode.classList.contains('slide-caption')) {
          slideItem.captionHTML = renderMarkdown(nextNode.innerHTML.trim());
          i++; 
        } else {
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

    // Use Grid to stack slides
    inner.style.display = 'grid';
    inner.style.alignItems = 'start'; 

    // This layer will overlay the slides and MATCH the aspect ratio of the media
    // ensuring buttons are centered on the media, not the media+caption.
    const uiLayer = document.createElement('div');
    uiLayer.className = 'slideshow-ui-layer';
    uiLayer.style.position = 'absolute';
    uiLayer.style.top = '0';
    uiLayer.style.left = '0';
    uiLayer.style.width = '100%';
    uiLayer.style.pointerEvents = 'none'; // Allow clicks to pass through to images (lightbox)
    uiLayer.style.zIndex = '10';          // Ensure buttons sit above slides

    const frameElements = [];

    slidesData.forEach((item) => {
      const slide = document.createElement('figure');
      slide.className = 'slide';

      slide.style.setProperty('display', 'block', 'important'); 
      slide.style.gridArea = '1 / 1'; 
      slide.style.width = '100%';
      slide.style.opacity = '0';
      slide.style.visibility = 'hidden'; 
      slide.style.transition = 'opacity 0.4s ease';
      slide.style.zIndex = '0';

      const frame = document.createElement('div');
      frame.className = 'slide-image';
      frameElements.push(frame);

      let mediaElement;

      if (item.mediaType === 'img') {
        mediaElement = item.mediaNode.cloneNode(true);
        
        if (item.ratio === 0) {
            mediaElement.onload = function() {
                const r = getEffectiveRatio(this);
                if (r > calculatedMaxRatio) {
                    calculatedMaxRatio = r;
                    updateAllFrames();
                }
            };
        }
      } else if (item.mediaType === 'video') {
        const id = item.mediaNode.getAttribute('data-youtube-id');
        const iframe = document.createElement('iframe');
        
        const originalClasses = Array.from(item.mediaNode.classList).filter(c => c !== 'slideshow-video');
        if (originalClasses.length > 0) {
            iframe.classList.add(...originalClasses);
        }
        
        iframe.classList.add('slideshow-video');
        
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

      if (item.captionHTML && item.captionHTML.trim() !== '') {
        const caption = document.createElement('figcaption');
        caption.innerHTML = item.captionHTML;
        slide.appendChild(caption);
      }

      inner.appendChild(slide);
    });

    slideshow.innerHTML = '';
    slideshow.appendChild(inner);
    slideshow.appendChild(uiLayer); // Append UI layer to main container

    // 3. APPLY ASPECT RATIO
    function updateAllFrames() {
        const finalRatio = userAspectRatio 
            ? userAspectRatio 
            : (calculatedMaxRatio > 0 ? calculatedMaxRatio : (16/9));
            
        frameElements.forEach(f => f.style.aspectRatio = finalRatio);
        
        // This makes the UI layer exactly the height of the media content
        uiLayer.style.aspectRatio = finalRatio;
    }

    updateAllFrames();

    // 4. INITIALIZE NAVIGATION & EVENTS
    const slides = Array.from(inner.querySelectorAll('.slide')); // Query inner, not slideshow (since uiLayer is there)
    if (!slides.length) return;

    const slideMedia = slides.map((s) =>
      s.querySelector('img, iframe.slideshow-video')
    );
    
    const slideTypes = slideMedia.map((m) => {
      if (!m) return null;
      if (m.tagName.toLowerCase() === 'img') return 'img';
      return 'video';
    });
    
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
      // Pause video on previous slide
      const currentSlide = slides[index];
      const currentVideo = currentSlide.querySelector('iframe');
      if (currentVideo) {
        currentVideo.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }

      // Hide previous slide
      currentSlide.classList.remove('active');
      currentSlide.style.opacity = '0';
      currentSlide.style.visibility = 'hidden';
      currentSlide.style.zIndex = '0';

      // Calculate new index
      index = (newIndex + slides.length) % slides.length;
      
      // Show new slide
      const newSlide = slides[index];
      newSlide.classList.add('active');
      newSlide.style.opacity = '1';
      newSlide.style.visibility = 'visible';
      newSlide.style.zIndex = '1';

      updateActiveDot();
      if (lightboxOpen) updateLightbox();
    }

    // CREATE GLOBAL BUTTONS INSIDE UI LAYER
    
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'slideshow-nav-btn slideshow-nav-btn--prev';
    prevBtn.innerHTML = '&#10094;';
    prevBtn.style.pointerEvents = 'auto'; // Re-enable clicks
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(index - 1);
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'slideshow-nav-btn slideshow-nav-btn--next';
    nextBtn.innerHTML = '&#10095;';
    nextBtn.style.pointerEvents = 'auto'; // Re-enable clicks (FIXED TYPO HERE)
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(index + 1);
    });

    // Append buttons to the UI Layer, not the main slideshow
    uiLayer.appendChild(prevBtn);
    uiLayer.appendChild(nextBtn);


    slides.forEach((slide, i) => {
      const frame = slide.querySelector('.slide-image');
      const type = slideTypes[i];

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

    // Initialize first slide with explicit styles
    slides[0].classList.add('active');
    slides[0].style.opacity = '1';
    slides[0].style.visibility = 'visible';
    slides[0].style.zIndex = '1';
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