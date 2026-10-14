/* ============================================================================
   site.js — progressive enhancement for the about page.

   Everything here is additive: `pages/about.md` stays plain Markdown, and if
   this file never runs the page still renders as a normal styled document.
   The publication cards are built by re-using the nodes Markdown produced —
   no text is invented, only re-arranged.
   ========================================================================= */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var ME = 'Peiyu Liao';

  /* ─────────────────────────────────────────────────────────────────────────
     Theme
     ────────────────────────────────────────────────────────────────────────*/

  var THEME_KEY = 'pl-theme';
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function themeIsDark() {
    var attr = root.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    return darkQuery.matches;
  }

  function syncThemeButtons() {
    var dark = themeIsDark();
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
    }
    syncThemeButtons();
  }

  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(themeIsDark() ? 'light' : 'dark', true);
    });
  });
  darkQuery.addEventListener('change', syncThemeButtons);
  syncThemeButtons();

  // Keep the copyright year honest on long-lived tabs.
  var thisYear = String(new Date().getFullYear());
  $$('[data-year]').forEach(function (el) { el.textContent = thisYear; });

  /* ─────────────────────────────────────────────────────────────────────────
     Mobile navigation
     ────────────────────────────────────────────────────────────────────────*/

  var nav = $('#site-nav');
  var navToggle = $('[data-nav-toggle]');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__link', nav).forEach(function (link) { link.addEventListener('click', closeNav); });
    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Scroll: progress bar, scroll-spy, back-to-top
     ────────────────────────────────────────────────────────────────────────*/

  var progressBar = $('[data-progress]');
  var toTop = $('[data-to-top]');
  var spyLinks = $$('.nav__link').map(function (link) {
    var hash = link.getAttribute('href') || '';
    var target = hash.charAt(0) === '#' ? document.getElementById(hash.slice(1)) : null;
    return target ? { link: link, target: target } : null;
  }).filter(Boolean);

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      progressBar.style.setProperty('--p', max > 0 ? Math.min(y / max, 1).toFixed(4) : '0');
      progressBar.classList.toggle('is-on', y > 6);
    }

    if (toTop) {
      var show = y > 620;
      toTop.hidden = !show;
      if (show) {
        // let the browser paint `hidden` away before animating in
        window.requestAnimationFrame(function () { toTop.classList.add('is-in'); });
      } else {
        toTop.classList.remove('is-in');
      }
    }

    if (spyLinks.length) {
      var line = y + 140;
      var active = null;
      spyLinks.forEach(function (item) {
        var top = item.target.getBoundingClientRect().top + y;
        if (top <= line) active = item;
      });
      spyLinks.forEach(function (item) {
        item.link.classList.toggle('is-active', item === active);
      });
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Reveal on scroll
     ────────────────────────────────────────────────────────────────────────*/

  var observer = null;

  function observeReveal(elements, stagger) {
    if (!elements.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('reveal', 'is-in'); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    var step = stagger || 45;
    elements.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--d', Math.min(i * step, 320) + 'ms');
      observer.observe(el);
    });
  }

  observeReveal($$('[data-reveal]'), 70);

  /* ─────────────────────────────────────────────────────────────────────────
     Hero: cursor-follow glow
     ────────────────────────────────────────────────────────────────────────*/

  (function cursorGlow() {
    var hero = $('.hero');
    var glow = $('[data-cursor-glow]');
    if (!hero || !glow || reduceMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    hero.addEventListener('pointermove', function (event) {
      var box = hero.getBoundingClientRect();
      glow.style.setProperty('--mx', ((event.clientX - box.left) / box.width * 100) + '%');
      glow.style.setProperty('--my', ((event.clientY - box.top) / box.height * 100) + '%');
      glow.classList.add('is-on');
    });
    hero.addEventListener('pointerleave', function () { glow.classList.remove('is-on'); });
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     Content enhancement
     ────────────────────────────────────────────────────────────────────────*/

  var content = $('.content');
  if (!content) return;

  /* -- group children into <section> per H2 ------------------------------- */

  (function groupSections() {
    var current = null;
    Array.prototype.slice.call(content.children).forEach(function (node) {
      if (node.tagName === 'H2') {
        current = document.createElement('section');
        current.className = 'content-section';
        if (node.id) current.setAttribute('data-section', node.id);
        content.insertBefore(current, node);
      }
      if (current) current.appendChild(node);
    });
  })();

  /* -- permalink anchors on headings ------------------------------------- */

  (function headingAnchors() {
    $$('h2[id], h3[id]', content).forEach(function (heading) {
      var link = document.createElement('a');
      link.className = 'heading-anchor';
      link.href = '#' + heading.id;
      link.setAttribute('aria-label', 'Link to this section');
      link.textContent = '#';
      heading.appendChild(link);
    });
  })();

  /* -- DOM helpers for the citation parser ------------------------------- */

  // All text of an element, ignoring anything inside <a> (DOIs/arXiv ids would
  // otherwise be mistaken for years).
  function textWithoutLinks(el) {
    var out = '';
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) out += child.data;
        else if (child.nodeType === 1 && child.tagName !== 'A') walk(child);
      });
    })(el);
    return out;
  }

  function eachTextNode(el, fn) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(fn);
  }

  // Tidy up the text nodes that were moved into a card. `lead`/`trail` only
  // touch the first/last non-empty node, so separators between authors survive.
  function tidy(el, opts) {
    opts = opts || {};
    var nodes = [];
    eachTextNode(el, function (node) { nodes.push(node); });

    var first = null;
    var last = null;
    nodes.forEach(function (node) {
      if (!node.data.trim()) return;
      if (!first) first = node;
      last = node;
    });

    nodes.forEach(function (node) {
      var data = node.data.replace(/\s{2,}/g, ' ');
      if (node === first && opts.lead) data = data.replace(opts.lead, '');
      if (node === last && opts.trail) data = data.replace(opts.trail, '');
      data = data.replace(/\s+([.,;:])/g, '$1').replace(/([.,;:])\s*([.,;:])/g, '$2');
      node.data = data;
    });

    // Collapse punctuation duplicated across node boundaries — after the award
    // span is lifted out of the tail, "… (DATE). . Antwerp" must read "… (DATE). Antwerp".
    var previousEnd = '';
    nodes.forEach(function (node) {
      if (previousEnd) {
        var lead = node.data.match(/^\s*([.,;:])\s*/);
        if (lead && lead[1] === previousEnd) node.data = node.data.replace(/^\s*[.,;:]\s*/, '');
      }
      var trimmed = node.data.replace(/\s+$/, '');
      if (trimmed) previousEnd = trimmed.slice(-1);
    });
  }

  // The last plausible publication year — skipping page ranges ("pp. 1821--1824")
  // that would otherwise win the race.
  function lastYear(text) {
    var re = /\b(19\d{2}|20\d{2})\b/g;
    var maxYear = new Date().getFullYear() + 1;
    var found = null;
    var match;

    while ((match = re.exec(text))) {
      var year = parseInt(match[1], 10);
      if (year < 1970 || year > maxYear) continue;
      var before = text.slice(Math.max(0, match.index - 9), match.index);
      var after = text.slice(match.index + match[0].length, match.index + match[0].length + 2);
      if (/[-–—]\s*$/.test(before)) continue;          // tail of a page range
      if (/^\s*[-–—]/.test(after)) continue;           // head of a page range
      if (/\bpp?\.?\s*$/i.test(before)) continue;      // "pp. 1821--1824"
      found = match[1];
    }
    return found;
  }

  function pickVenue(text) {
    var phrase = '';
    var inMatch = text.match(/\bIn:\s*([^.]*)/);
    var accMatch = text.match(/accepted by\s*([^.]*)/);
    if (inMatch) phrase = inMatch[1];
    else if (accMatch) phrase = accMatch[1];
    else phrase = text.slice(0, 140);

    var acronym = phrase.match(/\(([A-Z][A-Za-z0-9&/+-]{1,14})\)/);
    if (acronym) return acronym[1];

    var words = phrase.replace(/[()]/g, ' ').trim().split(/\s+/).filter(Boolean);
    return (words[words.length - 1] || '').replace(/[,;.]$/, '');
  }

  // Split the <li> into [authors…] [title] [citation tail…] by re-using nodes.
  function splitCitation(li) {
    var anchors = $$('a', li);
    var titleAnchor = null;
    for (var i = 0; i < anchors.length; i++) {
      if (/^["“]/.test(anchors[i].textContent.trim())) { titleAnchor = anchors[i]; break; }
    }

    if (titleAnchor) {
      var before = [];
      var after = [];
      var seen = false;
      Array.prototype.slice.call(li.childNodes).forEach(function (node) {
        if (node === titleAnchor) { seen = true; return; }
        (seen ? after : before).push(node);
      });
      var text = titleAnchor.textContent.trim().replace(/^["“]/, '').replace(/["”]$/, '');
      return { before: before, after: after, title: text, titleLink: titleAnchor };
    }

    // No title link: the title is a quoted run inside a text node.
    var walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var match = node.data.match(/["“]([^"”]{12,})["”]/);
      if (!match) continue;

      var parent = node.parentNode;
      var pre = document.createTextNode(node.data.slice(0, match.index));
      var titleNode = document.createTextNode(match[1]);
      var post = document.createTextNode(node.data.slice(match.index + match[0].length));
      parent.insertBefore(pre, node);
      parent.insertBefore(titleNode, node);
      parent.insertBefore(post, node);
      parent.removeChild(node);

      var head = [];
      var tail = [];
      var hitTitle = false;
      Array.prototype.slice.call(li.childNodes).forEach(function (child) {
        if (child === titleNode) { hitTitle = true; return; }
        if (child === pre) { head.push(child); return; }
        (hitTitle ? tail : head).push(child);
      });
      return { before: head, after: tail, title: match[1], titleLink: null };
    }
    return null;
  }

  var SPARKLE = 'M12 2.6l1.9 5.7a3 3 0 0 0 1.9 1.9l5.7 1.9-5.7 1.9a3 3 0 0 0-1.9 1.9L12 21.6l-1.9-5.7a3 3 0 0 0-1.9-1.9L2.5 12l5.7-1.9a3 3 0 0 0 1.9-1.9L12 2.6Z';

  function svgIcon(path, filled) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    if (filled) {
      svg.setAttribute('fill', 'currentColor');
    } else {
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.9');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
    }
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    return svg;
  }

  function highlightMe(el) {
    eachTextNode(el, function (node) {
      if (node.data.indexOf(ME) === -1) return;
      var parent = node.parentNode;
      if (parent.tagName === 'STRONG' && node.data.trim() === ME) {
        parent.classList.add('is-me');
        return;
      }
      var fragment = document.createDocumentFragment();
      node.data.split(ME).forEach(function (part, i) {
        if (i) {
          var strong = document.createElement('strong');
          strong.className = 'is-me';
          strong.textContent = ME;
          fragment.appendChild(strong);
        }
        if (part) fragment.appendChild(document.createTextNode(part));
      });
      parent.replaceChild(fragment, node);
    });
  }

  /* -- turn each <li> into a card ---------------------------------------- */

  function enhanceItem(li, type, index) {
    var original = li;
    var citation = textWithoutLinks(original);
    var parts = splitCitation(original);

    // Only the span highlighted in the Markdown counts as an award — prose
    // mentioning "Best Papers" (e.g. the IJCAI sister-conference track) is not one.
    var awardNode = $$('span', original).filter(function (span) {
      return /best paper/i.test(span.textContent);
    })[0] || null;
    var isAward = !!awardNode;

    var year = lastYear(citation);
    var venue = pickVenue(citation);

    var card = document.createElement('li');
    card.className = 'pub';
    card.setAttribute('data-type', type);
    if (year) card.setAttribute('data-year', year);
    if (venue) card.setAttribute('data-venue', venue);
    if (isAward) card.setAttribute('data-award', '1');

    /* meta row */
    var head = document.createElement('div');
    head.className = 'pub__head';

    var idx = document.createElement('span');
    idx.className = 'pub__idx';
    idx.textContent = (index < 10 ? '0' : '') + index;
    head.appendChild(idx);

    if (venue) {
      var venueChip = document.createElement('span');
      venueChip.className = 'chip chip--venue';
      venueChip.textContent = venue;
      head.appendChild(venueChip);
    }
    if (year) {
      var yearChip = document.createElement('span');
      yearChip.className = 'chip chip--year';
      yearChip.textContent = year;
      head.appendChild(yearChip);
    }
    if (isAward) {
      var awardChip = document.createElement('span');
      awardChip.className = 'chip chip--award';
      awardChip.title = 'Best Paper Award';
      awardChip.appendChild(svgIcon(SPARKLE, true));
      if (awardNode) {
        awardNode.removeAttribute('style');
        awardChip.appendChild(awardNode);
      } else {
        awardChip.appendChild(document.createTextNode('Best Paper'));
      }
      head.appendChild(awardChip);
    }
    card.appendChild(head);

    /* title */
    var title = document.createElement('h4');
    title.className = 'pub__title';
    if (parts && parts.titleLink) {
      parts.titleLink.textContent = parts.title;
      title.appendChild(parts.titleLink);
    } else if (parts) {
      title.textContent = parts.title;
    } else {
      title.textContent = citation.trim();
    }
    card.appendChild(title);

    /* authors */
    if (parts && parts.before.length) {
      var authors = document.createElement('p');
      authors.className = 'pub__authors';
      parts.before.forEach(function (node) { authors.appendChild(node); });
      tidy(authors, { trail: /\s*[,;.]\s*$/ });
      if (authors.textContent.trim()) {
        highlightMe(authors);
        card.appendChild(authors);
      }
    }

    /* venue / citation tail (the award span lives in the chip instead) */
    if (parts && parts.after.length) {
      var tail = document.createElement('p');
      tail.className = 'pub__venue';
      parts.after.forEach(function (node) {
        if (node === awardNode) return;
        tail.appendChild(node);
      });
      $$('a', tail).forEach(function (anchor) {
        anchor.target = '_blank';
        anchor.rel = 'noopener';
      });
      tidy(tail, { lead: /^\s*[.,;:]\s*/ });
      if (tail.textContent.trim()) card.appendChild(tail);
    }

    var searchable = [
      card.getAttribute('data-venue') || '',
      year || '',
      card.querySelector('.pub__title') ? card.querySelector('.pub__title').textContent : '',
      card.querySelector('.pub__authors') ? card.querySelector('.pub__authors').textContent : '',
      card.querySelector('.pub__venue') ? card.querySelector('.pub__venue').textContent : ''
    ].join(' ').toLowerCase().replace(/\s+/g, ' ');
    card.setAttribute('data-search', searchable);

    return card;
  }

  /* -- publications section ---------------------------------------------- */

  var pubHeading = document.getElementById('publications');

  if (pubHeading) {
    var scope = pubHeading.closest('.content-section') || content;
    var groups = [];

    $$('h3', scope).forEach(function (h3) {
      var ol = h3.nextElementSibling;
      if (!ol || ol.tagName !== 'OL') return;

      var label = h3.textContent.toLowerCase();
      var type = /conference/.test(label) ? 'conference'
        : /journal/.test(label) ? 'journal'
        : 'other';

      var wrapper = document.createElement('div');
      wrapper.className = 'pub-group';
      wrapper.setAttribute('data-type', type);
      h3.parentNode.insertBefore(wrapper, h3);
      wrapper.appendChild(h3);
      wrapper.appendChild(ol);

      groups.push({ el: wrapper, ol: ol, type: type, cards: [] });
    });

    groups.forEach(function (group) {
      var items = Array.prototype.slice.call(group.ol.children);
      var cards = [];
      items.forEach(function (li, i) {
        var card;
        try {
          card = enhanceItem(li, group.type, i + 1);
        } catch (err) {
          return; // leave the original list item untouched
        }
        group.ol.replaceChild(card, li);
        cards.push(card);
      });
      group.cards = cards;
      if (cards.length) group.ol.classList.add('is-enhanced');
    });

    var allCards = groups.reduce(function (acc, group) { return acc.concat(group.cards); }, []);

    /* -- filter UI ------------------------------------------------------- */

    var state = { q: '', type: 'all', year: 'all' };

    function countBy(type) {
      return allCards.filter(function (card) {
        return type === 'all' || card.getAttribute('data-type') === type;
      }).length;
    }

    var controls = document.createElement('div');
    controls.className = 'pub-controls';

    var counts = {
      all: countBy('all'),
      journal: countBy('journal'),
      conference: countBy('conference')
    };

    var filters = [
      { key: 'all', label: 'All' },
      { key: 'journal', label: 'Journal' },
      { key: 'conference', label: 'Conference' }
    ].filter(function (f) { return f.key === 'all' || counts[f.key] > 0; });

    var years = allCards
      .map(function (card) { return card.getAttribute('data-year'); })
      .filter(Boolean)
      .filter(function (year, i, arr) { return arr.indexOf(year) === i; })
      .sort(function (a, b) { return b - a; });

    controls.innerHTML =
      '<div class="pub-controls__row">' +
        '<label class="field">' +
          svgIcon('M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z M16 16l4.5 4.5', false).outerHTML +
          '<input type="search" data-filter-q placeholder="Search title, author, venue…" aria-label="Search publications">' +
        '</label>' +
        '<div class="seg" role="group" aria-label="Filter by type">' +
          filters.map(function (f) {
            return '<button type="button" class="seg__btn" data-filter-type="' + f.key + '" ' +
              'aria-pressed="' + (f.key === 'all') + '">' + f.label +
              '<span>' + counts[f.key] + '</span></button>';
          }).join('') +
        '</div>' +
        (years.length
          ? '<select class="select" data-filter-year aria-label="Filter by year">' +
              '<option value="all">All years</option>' +
              years.map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('') +
            '</select>'
          : '') +
      '</div>' +
      '<div class="pub-controls__foot">' +
        '<p class="pub-controls__count" role="status" aria-live="polite"></p>' +
        '<button type="button" class="pub-controls__reset" data-filter-reset hidden>Clear filters</button>' +
      '</div>';

    pubHeading.insertAdjacentElement('afterend', controls);

    var qInput = $('[data-filter-q]', controls);
    var yearSelect = $('[data-filter-year]', controls);
    var countLabel = $('.pub-controls__count', controls);
    var resetBtn = $('[data-filter-reset]', controls);
    var emptyState = null;

    function applyFilters() {
      var query = state.q.trim().toLowerCase();
      var visible = 0;

      allCards.forEach(function (card) {
        var matchType = state.type === 'all' || card.getAttribute('data-type') === state.type;
        var matchYear = state.year === 'all' || card.getAttribute('data-year') === state.year;
        var matchQuery = !query || (card.getAttribute('data-search') || '').indexOf(query) !== -1;
        var show = matchType && matchYear && matchQuery;
        card.classList.toggle('is-filtered-out', !show);
        if (show) visible++;
      });

      groups.forEach(function (group) {
        var hasVisible = group.cards.some(function (card) {
          return !card.classList.contains('is-filtered-out');
        });
        group.el.classList.toggle('is-filtered-out', !hasVisible);
      });

      countLabel.innerHTML = 'Showing <strong>' + visible + '</strong> of <strong>' +
        allCards.length + '</strong> publications';

      var filtered = state.type !== 'all' || state.year !== 'all' || !!query;
      resetBtn.hidden = !filtered;

      if (!visible && !emptyState) {
        emptyState = document.createElement('p');
        emptyState.className = 'pub-empty';
        emptyState.textContent = 'No publications match this filter.';
        controls.insertAdjacentElement('afterend', emptyState);
      } else if (emptyState) {
        emptyState.hidden = visible > 0;
      }
    }

    $$('[data-filter-type]', controls).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.type = btn.getAttribute('data-filter-type');
        $$('[data-filter-type]', controls).forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === btn));
        });
        applyFilters();
      });
    });

    if (qInput) {
      qInput.addEventListener('input', function () {
        state.q = qInput.value;
        applyFilters();
      });
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', function () {
        state.year = yearSelect.value;
        applyFilters();
      });
    }
    resetBtn.addEventListener('click', function () {
      state = { q: '', type: 'all', year: 'all' };
      if (qInput) qInput.value = '';
      if (yearSelect) yearSelect.value = 'all';
      $$('[data-filter-type]', controls).forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter-type') === 'all'));
      });
      applyFilters();
    });

    applyFilters();
    observeReveal(allCards, 40);
  }

  /* -- reveal the rest of the prose -------------------------------------- */

  observeReveal($$('.content-section > h2, .content-section > h3, .content-section > p, .pub-controls, .footer__inner'), 60);
})();
