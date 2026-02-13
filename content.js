// Research360 Unblur Extension
// Removes the 'blurtext' class and reveals hidden content from Research360 advisory pages

function removeBlurAndUnlock() {
  // Remove blur from all elements with blurtext class
  const blurredElements = document.querySelectorAll('.blurtext');
  blurredElements.forEach(element => {
    element.classList.remove('blurtext');
    element.style.filter = 'none';
    element.style.webkitFilter = 'none';
  });

  // Remove blur from elements with blur-related styles
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.filter === 'blur(10px)' || style.filter === 'blur(8px)' || 
        style.filter === 'blur(5px)' || style.filter.includes('blur')) {
      element.style.filter = 'none';
    }
  });

  // Show hidden chips/sections
  const hiddenChips = document.querySelectorAll('.chips-hidden-section');
  hiddenChips.forEach(section => {
    section.style.visibility = 'visible';
    section.style.height = 'auto';
    section.style.overflow = 'visible';
    section.style.display = 'block';
  });

  // Show hidden plan-specific elements (AlphaInvestPro, AlphaDayTrader)
  const alphaElements = document.querySelectorAll('.AlphaInvestPro, .AlphaDayTrader');
  alphaElements.forEach(element => {
    element.style.display = 'flex';
    element.style.visibility = 'visible';
  });

  // Handle unlock sections - hide the overlay but keep content visible
  const unlockSections = document.querySelectorAll('.unlock-section');
  unlockSections.forEach(section => {
    section.style.display = 'none';
  });

  // Hide "Unlock Now" buttons
  const unlockButtons = document.querySelectorAll('.unlock-btn-small, .unlock, a[onclick*="Unlock"], button[onclick*="Unlock"]');
  unlockButtons.forEach(btn => {
    btn.style.display = 'none';
  });

  // Make blurred cards fully visible
  const blurredCards = document.querySelectorAll('.bg-white-cards.blurtext');
  blurredCards.forEach(card => {
    card.classList.remove('blurtext');
    card.style.filter = 'none';
    card.style.webkitFilter = 'none';
    card.style.pointerEvents = 'auto';
  });

  // Show all content in recommendation sections
  const recommendationContent = document.querySelectorAll('.recommendation-content');
  recommendationContent.forEach(content => {
    content.style.display = 'block';
  });

  // Make PDF links clickable - remove blocking event handlers
  makePdfLinksClickable();

  console.log(`[Research360 Unblur] Removed blur and unlocked content`);
}

function makePdfLinksClickable() {
  // Find all PDF link containers in borderbox-icon
  const pdfContainers = document.querySelectorAll('.borderbox-icon');
  
  pdfContainers.forEach(container => {
    const link = container.querySelector('a.viewReport');
    if (!link) return;
    
    // Get the PDF URL from the href
    const pdfUrl = link.getAttribute('href');
    if (!pdfUrl || !pdfUrl.includes('pdf')) return;
    
    // Check if we already processed this container
    if (container.dataset.unblurProcessed === 'true') return;
    container.dataset.unblurProcessed = 'true';
    
    // Remove any duplicate unblur-pdf-btn buttons that may exist
    const existingDuplicateBtn = container.querySelector('.unblur-pdf-btn');
    if (existingDuplicateBtn) {
      existingDuplicateBtn.remove();
    }
    
    // Fix the original link - make it fully clickable
    link.style.cursor = 'pointer';
    link.style.display = 'inline-flex';
    link.style.alignItems = 'center';
    link.style.justifyContent = 'center';
    link.style.pointerEvents = 'auto';
    link.style.zIndex = '9999';
    link.style.position = 'relative';
    
    // Remove any inline onclick that might block the click
    if (link.onclick) {
      link.onclick = null;
    }
    
    // Remove all event listeners (they may be blocking)
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
    
    console.log('[Research360 Unblur] Fixed PDF link:', pdfUrl);
  });

  // Also handle PDF links in modal content
  const modalPdfLinks = document.querySelectorAll('.modal-body a.viewReport[href*="pdf"], .modal-content a.viewReport[href*="pdf"]');
  modalPdfLinks.forEach(link => {
    const pdfUrl = link.getAttribute('href');
    if (!pdfUrl) return;
    
    // Make sure it opens in new tab
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Remove blocking onclick
    link.onclick = null;
    
    console.log('[Research360 Unblur] Fixed modal PDF link:', pdfUrl);
  });
}

// Run immediately when the page loads
removeBlurAndUnlock();

// Also observe for dynamically loaded content (in case content loads via AJAX)
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;

  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) { // Element node
        // Check if the added node has blur-related classes
        if (node.classList && (node.classList.contains('blurtext') || 
            node.classList.contains('activelock') ||
            node.classList.contains('chips-hidden-section') ||
            node.classList.contains('borderbox-icon'))) {
          shouldProcess = true;
        }
        // Check children of the added node
        if (node.querySelectorAll) {
          const blurredChildren = node.querySelectorAll('.blurtext, .chips-hidden-section, .AlphaInvestPro, .AlphaDayTrader, .borderbox-icon');
          if (blurredChildren.length > 0) {
            shouldProcess = true;
          }
        }
      }
    });
  });

  // If new relevant elements were added, process them
  if (shouldProcess) {
    removeBlurAndUnlock();
  }
});

// Start observing the document for changes
observer.observe(document.body || document.documentElement, {
  childList: true,
  subtree: true
});

// Also run on page load events to catch late-loading content
window.addEventListener('load', () => {
  setTimeout(removeBlurAndUnlock, 500);
  setTimeout(removeBlurAndUnlock, 1500);
  setTimeout(removeBlurAndUnlock, 3000);
});

// Run periodically to catch any dynamically loaded content
setInterval(removeBlurAndUnlock, 2000);
