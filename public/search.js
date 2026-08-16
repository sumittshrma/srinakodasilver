/**
 * Sri Nakoda Silver - Universal Search Controller
 */
(function() {
  if (window.__LIVE_SEARCH_INITIALIZED) return;
  window.__LIVE_SEARCH_INITIALIZED = true;

  // Country Code 91 ke saath
  const WHATSAPP_NUMBER = "91XXXXXXXXXX"; 

  // Photo Modal + WhatsApp Button Creator
  function showImagePreview(imgSrc, title) {
    let modal = document.getElementById('search-custom-image-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'search-custom-image-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 hidden';
      modal.innerHTML = `
        <div class="relative bg-[#0D1B2A] border border-[#778DA9]/40 rounded-2xl p-4 max-w-lg w-full text-center shadow-2xl">
          <button id="close-custom-modal" class="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold bg-[#1B263B] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">&times;</button>
          <img id="custom-modal-img" src="" alt="Product" class="w-full h-72 object-contain rounded-lg border border-[#778DA9]/20 mb-3 bg-[#050C14]">
          <h3 id="custom-modal-title" class="text-base font-semibold text-[#E0E1DD] mb-3"></h3>
          
          <!-- WhatsApp Inquiry Button Inside Modal -->
          <a id="custom-modal-whatsapp" href="#" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
            </svg>
            Inquire on WhatsApp
          </a>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'close-custom-modal') {
          modal.classList.add('hidden');
        }
      });
    }

    const imgElem = document.getElementById('custom-modal-img');
    const titleElem = document.getElementById('custom-modal-title');
    const waElem = document.getElementById('custom-modal-whatsapp');

    if (imgElem && titleElem && waElem) {
      imgElem.src = imgSrc;
      titleElem.innerText = title;
      
      const message = encodeURIComponent(`Hello Sri Nakoda Silver, I want to inquire about this product: ${title}`);
      waElem.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      
      modal.classList.remove('hidden');
    }
  }

  window.__showImagePreview = showImagePreview;

  function applyUniversalSearch() {
    const path = window.location.pathname.toLowerCase();
    const isIndexPage = path === '/' || path.endsWith('/index.html') || path.endsWith('/') || path.includes('index');

    const searchInputs = document.querySelectorAll('input[type="search"]');
    if (!searchInputs.length) return;

    function toggleHeroBanner(query) {
      const heroBanner = document.getElementById('hero-banner');
      if (heroBanner) {
        if (query && query.trim().length > 0) {
          heroBanner.classList.add('hidden');
        } else {
          heroBanner.classList.remove('hidden');
        }
      }
    }

    // ==========================================
    // CASE 1: CATEGORY PAGES (Local Page Search)
    // ==========================================
    if (!isIndexPage) {
      const productCards = document.querySelectorAll('.product-card, [data-name]');
      let noResultsMsg = document.getElementById('no-local-results');

      searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase().trim();
          let visibleCount = 0;

          toggleHeroBanner(query);

          searchInputs.forEach(otherInput => {
            if (otherInput !== input) otherInput.value = e.target.value;
          });

          productCards.forEach(card => {
            const title = (card.querySelector('.product-title')?.innerText || card.querySelector('h3')?.innerText || card.dataset.name || '').toLowerCase();
            const weight = (card.dataset.weight || card.querySelector('.product-purity')?.innerText || '').toLowerCase();

            if (title.includes(query) || weight.includes(query)) {
              card.style.display = '';
              visibleCount++;
            } else {
              card.style.display = 'none';
            }
          });

          if (query !== '' && visibleCount === 0) {
            if (!noResultsMsg) {
              noResultsMsg = document.createElement('div');
              noResultsMsg.id = 'no-local-results';
              noResultsMsg.className = 'w-full col-span-full py-12 text-center bg-[#0D1B2A]/90 rounded-2xl border border-[#778DA9]/30 my-4';
              noResultsMsg.innerHTML = `<p class="text-base font-semibold text-[#E0E1DD]">No items found</p>`;
              const container = document.querySelector('.grid') || document.querySelector('main');
              if (container) container.appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
          } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
          }
        });
      });
      return;
    }

    // ==========================================
    // CASE 2: INDEX PAGE ONLY (Sitewide Fetch Search)
    // ==========================================
    const sitePages = [
      '/jewellery.html',
      '/plain.html',
      '/antique.html',
      '/woodenitems.html',
      '/gold-polished.html',
      '/templejewellery.html',
      '/store.html'
    ];

    const siteIndexCache = {};

    async function fetchPageProducts(pageUrl) {
      if (siteIndexCache[pageUrl]) return siteIndexCache[pageUrl];
      try {
        const res = await fetch(pageUrl);
        if (!res.ok) return [];
        const txt = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(txt, 'text/html');
        const cards = Array.from(doc.querySelectorAll('.product-card, [data-name]'));
        const items = cards.map(card => {
          const title = (card.querySelector('.product-title')?.innerText || card.querySelector('h3')?.innerText || card.dataset.name || '').trim();
          const img = (card.querySelector('img')?.getAttribute('src')) || '';
          const weight = (card.dataset.weight || card.querySelector('.product-purity')?.innerText || '').trim();
          return { title, img, weight, page: pageUrl };
        });
        siteIndexCache[pageUrl] = items;
        return items;
      } catch (e) {
        return [];
      }
    }

    async function fetchAndShowSitewideResults(rawQuery) {
      let container = document.getElementById('sitewide-search-results');
      
      if (!rawQuery || rawQuery.trim() === '') {
        if (container) {
          container.innerHTML = '';
          container.style.display = 'none';
        }
        return;
      }

      const query = rawQuery.trim().toLowerCase();
      const results = [];
      await Promise.all(sitePages.map(async (p) => {
        const items = await fetchPageProducts(p);
        items.forEach(it => {
          if (it.title.toLowerCase().includes(query) || (it.weight || '').toLowerCase().includes(query)) {
            results.push(it);
          }
        });
      }));

      renderSitewideResults(results, rawQuery);
    }

    function renderSitewideResults(items, rawQuery) {
      let container = document.getElementById('sitewide-search-results');
      if (!container) {
        container = document.createElement('section');
        container.id = 'sitewide-search-results';
        container.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-40';
        const main = document.querySelector('main') || document.body;
        main.insertAdjacentElement('afterbegin', container);
      }

      if (!rawQuery || rawQuery.trim() === '') {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
      }

      container.style.display = '';
      if (!items.length) {
        container.innerHTML = `
          <div class="w-full py-12 text-center bg-[#0D1B2A]/90 rounded-2xl border border-[#778DA9]/30">
            <p class="text-base font-semibold text-[#E0E1DD]">No items found for "${escapeHtml(rawQuery)}"</p>
            <p class="text-xs text-[#778DA9] mt-1">Try searching for keywords like 'choker', 'bangles', 'pendant', or 'silver'.</p>
          </div>`;
        return;
      }

      const cardsHtml = items.map(it => {
        const categoryName = it.page.replace('/', '').replace('.html', '');
        return `
          <div onclick="window.__showImagePreview('${escapeHtml(it.img)}', '${escapeHtml(it.title)}')" class="cursor-pointer block product-card-link p-3 sm:p-4 bg-[#0D1B2A] rounded-2xl border border-[#415A6A]/40 hover:border-[#778DA9] hover:scale-[1.02] transition-all text-inherit">
            <div class="flex items-center gap-3">
              <img src="${it.img}" class="w-16 h-16 object-cover rounded-md border border-[#778DA9]/20" alt="${escapeHtml(it.title)}" />
              <div>
                <h3 class="font-semibold text-sm text-[#E0E1DD]">${escapeHtml(it.title)}</h3>
                <p class="text-xs text-[#778DA9]">${escapeHtml(it.weight || 'Silver Item')}</p>
                <span class="inline-block mt-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">Category: ${escapeHtml(categoryName)}</span>
              </div>
            </div>
          </div>`;
      }).join('');

      container.innerHTML = `
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-[#E0E1DD]">Showing ${items.length} result(s) for "<span class='text-emerald-400 font-bold'>${escapeHtml(rawQuery)}</span>"</p>
          <button id="close-sitewide-results" class="text-xs text-[#778DA9] hover:text-[#E0E1DD] underline cursor-pointer">Clear Results</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${cardsHtml}</div>`;

      document.getElementById('close-sitewide-results')?.addEventListener('click', () => {
        searchInputs.forEach(i => { i.value = ''; });
        toggleHeroBanner('');
        container.innerHTML = '';
        container.style.display = 'none';
      });
    }

    function escapeHtml(str) {
      return String(str).replace(/[&"'<>]/g, (s) => ({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[s]));
    }

    searchInputs.forEach(searchInput => {
      const handleLiveTyping = () => {
        const rawQuery = searchInput.value;
        toggleHeroBanner(rawQuery);

        searchInputs.forEach(input => {
          if (input !== searchInput) input.value = rawQuery;
        });
        fetchAndShowSitewideResults(rawQuery);
      };

      searchInput.addEventListener('input', handleLiveTyping);
      searchInput.addEventListener('search', handleLiveTyping);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUniversalSearch);
  } else {
    applyUniversalSearch();
  }
})();
