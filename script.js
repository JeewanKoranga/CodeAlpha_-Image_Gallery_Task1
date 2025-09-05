document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const uploadBtn = document.getElementById('upload-btn');
  const imageUploadInput = document.getElementById('image-upload');
  const themeToggle = document.getElementById('theme-toggle');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const body = document.body;

  // Initial images with categories & captions
  let images = [
    { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", title: "Forest", category: "nature" },
    { url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", title: "River", category: "nature" },
    { url: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=400&q=80", title: "Desert", category: "nature" },
    { url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=400&q=80", title: "City Street", category: "urban" },
    { url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80", title: "Building", category: "urban" },
    { url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80", title: "Galaxy", category: "space" }
  ];

  let activeCategory = "all";

  // Render gallery based on category
  function renderGallery() {
    gallery.innerHTML = '';

    const filteredImages = activeCategory === 'all' 
      ? images 
      : images.filter(img => img.category === activeCategory);

    filteredImages.forEach((img, idx) => {
      const item = document.createElement('div');
      item.classList.add('gallery-item');
      item.setAttribute('draggable', 'true');
      item.setAttribute('tabindex', '0');
      item.innerHTML = `
        <img src="${img.url}" alt="${img.title}" />
        <div class="caption" contenteditable="true" aria-label="Edit image caption">${img.title}</div>
        <button class="remove-btn" aria-label="Remove image">&times;</button>
      `;

      // Click image to open lightbox
      item.querySelector('img').onclick = () => openLightbox(img.url, img.title);

      // Remove button
      item.querySelector('.remove-btn').onclick = (e) => {
        e.stopPropagation();
        if (confirm('Remove this image?')) {
          // Find global index & remove image
          const globalIndex = images.findIndex(i => i.url === img.url && i.title === img.title);
          if(globalIndex >= 0) {
            images.splice(globalIndex, 1);
            renderGallery();
          }
        }
      };

      // Update caption content on blur
      const captionEl = item.querySelector('.caption');
      captionEl.addEventListener('blur', () => {
        const globalIndex = images.findIndex(i => i.url === img.url && i.title === img.title);
        if(globalIndex >= 0) {
          images[globalIndex].title = captionEl.textContent.trim() || 'No Title';
        }
      });

      // Drag and Drop handlers
      item.addEventListener('dragstart', dragStart);
      item.addEventListener('dragover', dragOver);
      item.addEventListener('drop', drop);
      item.addEventListener('dragend', dragEnd);

      gallery.appendChild(item);
    });
  }

  // Drag and drop variables
  let draggedItem = null;

  function dragStart(e) {
    draggedItem = e.currentTarget;
    draggedItem.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function dragOver(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (target && target !== draggedItem) {
      const bounding = target.getBoundingClientRect();
      const offset = e.clientY - bounding.top;
      if (offset > bounding.height / 2) {
        target.style['border-bottom'] = '4px solid var(--orange)';
        target.style['border-top'] = '';
      } else {
        target.style['border-top'] = '4px solid var(--orange)';
        target.style['border-bottom'] = '';
      }
    }
  }

  function drop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (target && target !== draggedItem) {
      target.style['border-bottom'] = '';
      target.style['border-top'] = '';

      const draggedIndex = [...gallery.children].indexOf(draggedItem);
      const targetIndex = [...gallery.children].indexOf(target);

      // Rearrange images array accordingly
      const movedImage = images.splice(draggedIndex, 1)[0];
      images.splice(targetIndex, 0, movedImage);

      renderGallery();
    }
  }

  function dragEnd(e) {
    draggedItem.classList.remove('dragging');
    Array.from(gallery.children).forEach(item => {
      item.style['border-bottom'] = '';
      item.style['border-top'] = '';
    });
  }

  // Upload images from user's device
  uploadBtn.onclick = () => imageUploadInput.click();

  imageUploadInput.onchange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          images.push({ url: event.target.result, title: 'Uploaded Image', category: 'all' });
          renderGallery();
        }
        reader.readAsDataURL(file);
      }
    });
    // Reset input
    e.target.value = '';
  };

  // Category filter buttons
  filterButtons.forEach(btn => {
    btn.onclick = () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderGallery();
    }
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('img');
  const closeLightboxBtn = document.getElementById('close-lightbox');

  function openLightbox(url, alt) {
    lightboxImg.src = url;
    lightboxImg.alt = alt;
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('active');
  }

  closeLightboxBtn.onclick = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  // Close lightbox on ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  });

  // Light/Dark mode toggle
  body.classList.add('dark-mode');
  themeToggle.textContent = 'Switch to Light Mode';

  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-mode')) {
      body.classList.replace('dark-mode', 'light-mode');
      themeToggle.textContent = 'Switch to Dark Mode';
    } else {
      body.classList.replace('light-mode', 'dark-mode');
      themeToggle.textContent = 'Switch to Light Mode';
    }
  });

  // Initial render
  renderGallery();
});
