/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-everhome-suites-landing.js
  var import_everhome_suites_landing_exports = {};
  __export(import_everhome_suites_landing_exports, {
    default: () => import_everhome_suites_landing_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const video = element.querySelector("video");
    const videoUrl = video && video.getAttribute("src") || (element.querySelector("video source") ? element.querySelector("video source").getAttribute("src") : null) || (element.querySelector('a[href*=".mp4"]') ? element.querySelector('a[href*=".mp4"]').getAttribute("href") : null);
    if (videoUrl) {
      const videoLink = document2.createElement("a");
      videoLink.href = videoUrl;
      videoLink.textContent = videoUrl;
      cells.push([videoLink]);
    }
    const foreground = [];
    const heading = element.querySelector("h1, h2, h3");
    if (heading) foreground.push(heading);
    const logo = element.querySelector(".cmp-brand-hero-banner__logo img, img");
    if (logo) foreground.push(logo);
    cells.push(foreground);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document: document2 }) {
    const image = element.querySelector(".cmp-image img, .cmp-teaser__image img, figure img, img");
    const textCell = [];
    const seen = /* @__PURE__ */ new Set();
    const pushClone = (node, tag) => {
      if (!node) return;
      const txt = (node.textContent || "").trim();
      if (!txt) return;
      const el = document2.createElement(tag || "p");
      el.innerHTML = node.innerHTML;
      textCell.push(el);
    };
    const eyebrow = element.querySelector(".eyebrow, .cmp-teaser__pretitle, .banner-eyebrow");
    if (eyebrow) {
      pushClone(eyebrow, "p");
      seen.add(eyebrow);
    }
    const heading = element.querySelector(".banner-title, .cmp-teaser__title, h1, h2, h3");
    if (heading) {
      const level = /^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : "h2";
      pushClone(heading, level);
      seen.add(heading);
    }
    const body = element.querySelector(".banner-text, .cmp-teaser__description");
    if (body) {
      const paras = body.querySelectorAll("p");
      if (paras.length && body.classList.contains("banner-text")) {
        paras.forEach((p) => {
          if (p.closest(".eyebrow") || p.classList.contains("banner-title")) return;
          if ((p.textContent || "").trim()) pushClone(p, "p");
        });
      } else {
        pushClone(body, "p");
      }
    }
    const cta = element.querySelector("a.cmp-button, .cmp-teaser__cta a, .cmp-button a, a.button");
    if (cta) {
      const a = document2.createElement("a");
      a.setAttribute("href", cta.getAttribute("href") || "#");
      a.textContent = (cta.textContent || "").trim();
      const p = document2.createElement("p");
      p.appendChild(a);
      textCell.push(p);
    }
    const cells = [[image || "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse3(element, { document: document2 }) {
    const cells = [];
    const imageCards = Array.from(element.querySelectorAll(":scope .cmp-image a.cmp-image__link")).map((a) => a.closest(".cmp-image")).filter((v, i, arr) => v && arr.indexOf(v) === i);
    const teaserCards = Array.from(element.querySelectorAll(":scope .cmp-teaser"));
    if (teaserCards.length) {
      teaserCards.forEach((teaser) => {
        const image = teaser.querySelector(".cmp-teaser__image img, img");
        const textCell = [];
        const eyebrow = teaser.querySelector(".cmp-teaser__content .eyebrow, .eyebrow");
        if (eyebrow && (eyebrow.textContent || "").trim()) {
          const p = document2.createElement("p");
          p.innerHTML = eyebrow.innerHTML;
          textCell.push(p);
        }
        const title = teaser.querySelector(".cmp-teaser__title");
        if (title && (title.textContent || "").trim()) {
          const level = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : "h3";
          const h = document2.createElement(level);
          h.innerHTML = title.innerHTML;
          textCell.push(h);
        }
        const desc = teaser.querySelector(".cmp-teaser__description");
        if (desc) {
          const blocks = desc.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p");
          if (blocks.length) {
            blocks.forEach((node) => {
              if (!(node.textContent || "").trim()) return;
              const tag = /^H[1-6]$/.test(node.tagName) ? node.tagName.toLowerCase() : "p";
              const el = document2.createElement(tag);
              el.innerHTML = node.innerHTML;
              textCell.push(el);
            });
          } else if ((desc.textContent || "").trim()) {
            const np = document2.createElement("p");
            np.innerHTML = desc.innerHTML;
            textCell.push(np);
          }
        }
        const cta = teaser.querySelector(".cmp-teaser__cta a, a.cmp-button, a.button");
        if (cta) {
          const a = document2.createElement("a");
          a.setAttribute("href", cta.getAttribute("href") || "#");
          a.textContent = (cta.textContent || "").trim();
          const p = document2.createElement("p");
          p.appendChild(a);
          textCell.push(p);
        }
        cells.push([image || "", textCell.length ? textCell : ""]);
      });
    } else if (imageCards.length) {
      imageCards.forEach((card) => {
        const link = card.querySelector("a.cmp-image__link");
        const image = card.querySelector("img");
        const caption = card.querySelector("figcaption, .cmp-image__title");
        const captionText = caption ? (caption.textContent || "").trim() : link ? (link.textContent || "").trim() : "";
        const textCell = [];
        if (link && link.getAttribute("href")) {
          const a = document2.createElement("a");
          a.setAttribute("href", link.getAttribute("href"));
          a.textContent = captionText;
          textCell.push(a);
        } else if (captionText) {
          const p = document2.createElement("p");
          p.textContent = captionText;
          textCell.push(p);
        }
        cells.push([image || "", textCell.length ? textCell : ""]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse4(element, { document: document2 }) {
    const items = element.querySelectorAll(":scope .cmp-accordion__item");
    const cells = [];
    items.forEach((item) => {
      const button = item.querySelector(".cmp-accordion__item-button");
      let question = "";
      if (button) {
        const clone = button.cloneNode(true);
        const indicator = clone.querySelector(".cmp-accordion__item-indicator");
        if (indicator) indicator.remove();
        question = (clone.textContent || "").replace(/ /g, " ").trim();
      }
      if (!question) {
        const header = item.querySelector(".cmp-accordion__item-header, h3, h4");
        question = header ? (header.textContent || "").replace(/ /g, " ").trim() : "";
      }
      let answer = item.querySelector(".cmp-accordion__item-content");
      if (!answer) {
        const panel = item.querySelector(".cmp-accordion__panel");
        if (panel) {
          const clone = panel.cloneNode(true);
          const hdr = clone.querySelector(".cmp-accordion__item-header");
          if (hdr) hdr.remove();
          answer = clone;
        }
      }
      if (answer) {
        answer.removeAttribute("hidden");
      }
      cells.push([question, answer || ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/everhome-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        "script",
        "noscript",
        "style",
        '[class*="cookie"]',
        '[id*="cookie"]',
        '[id*="onetrust"]',
        '[class*="onetrust"]',
        '[class*="breadcrumb"]',
        // App-driven hotel booking-search widget at the top of <main>.
        "search",
        '[role="search"]',
        '[class*="search-widget"]',
        '[class*="booking-search"]',
        // Skip-to-content link, top "___" anchor, and loading status.
        'a[href="#mainContent"]',
        'a[href="#"]',
        '[role="status"]',
        "status"
      ]);
      element.querySelectorAll('img[src*="ch-mobile-app-logo"]').forEach((img) => {
        const wrapper = img.closest("p") || img;
        wrapper.remove();
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        "aside",
        "script",
        "noscript",
        "style",
        "link",
        "iframe",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-tracking");
      });
    }
  }

  // tools/importer/transformers/everhome-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) {
      return;
    }
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 1) {
      return;
    }
    const doc = element.ownerDocument || document;
    const resolved = sections.map((section) => ({
      section,
      el: section.selector ? element.querySelector(section.selector) : null
    }));
    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { section, el } = resolved[i];
      if (!el) {
        continue;
      }
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        el.appendChild(metaBlock);
      }
      if (i > 0) {
        const hr = doc.createElement("hr");
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  // tools/importer/import-everhome-suites-landing.js
  var PAGE_TEMPLATE = {
    name: "everhome-suites-landing",
    description: "Everhome Suites brand landing page with hero, brand overview, features, and supporting content sections",
    urls: [
      "https://www.choicehotels.com/everhome-suites"
    ],
    blocks: [
      {
        name: "hero-video",
        instances: [".cmp-brand-hero-banner"]
      },
      {
        name: "columns-feature",
        instances: [
          ".cmp-banner",
          ".cmp-teaser--type-tile-left"
        ]
      },
      {
        name: "cards-feature",
        instances: [".cmp-grid-container"]
      },
      {
        name: "accordion-faq",
        instances: [".cmp-accordion"]
      }
    ],
    sections: [
      {
        id: "section-dark-banner",
        name: "Dark heading banner",
        selector: ".cmp-hero-banner",
        style: "dark",
        blocks: [],
        defaultContent: [".cmp-hero-banner h2"]
      }
    ]
  };
  var parsers = {
    "hero-video": parse,
    "columns-feature": parse2,
    "cards-feature": parse3,
    "accordion-faq": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length >= 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_everhome_suites_landing_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_everhome_suites_landing_exports);
})();
