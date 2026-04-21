/**
 * Tienda de Zapatos - Frontend principal
 * Este archivo contiene la logica de:
 * - carga de datos (JSON)
 * - slider de portada
 * - filtros y render de productos
 * - modal de producto
 * - formulario de pedido por WhatsApp
 */

const DATA_URL = "/data/store.json";
const WHATSAPP_NUMBER = "50582325819";

/** Estado global minimo para evitar variables sueltas */
const state = {
  heroSlides: [],
  products: [],
  currentSlide: 0,
  slideTimer: null,
};

/** Escapa rutas con caracteres especiales */
function assetPath(path) {
  return encodeURI(path);
}

/**
 * Carga la data del catalogo desde JSON.
 * Si falla, muestra error en consola y devuelve arreglos vacios.
 */
async function loadStoreData() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${DATA_URL} (${response.status})`);
    }
    const data = await response.json();
    state.heroSlides = Array.isArray(data.heroSlides) ? data.heroSlides : [];
    state.products = Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.error("Error cargando datos de tienda:", error);
    state.heroSlides = [];
    state.products = [];
  }
}

/** Construye el slider principal usando datos del JSON */
function buildHero() {
  const slidesContainer = document.querySelector(".hero__slides");
  const dotsContainer = document.querySelector(".hero__dots");
  if (!slidesContainer || !dotsContainer) return;

  slidesContainer.innerHTML = "";
  dotsContainer.innerHTML = "";

  if (!state.heroSlides.length) {
    slidesContainer.innerHTML =
      '<div class="hero__slide hero__slide--active"><div class="hero__overlay"></div><div class="hero__content container"><h1 class="hero__title">Catalogo no disponible</h1><p class="hero__subtitle">No se pudieron cargar los datos de portada.</p></div></div>';
    return;
  }

  state.heroSlides.forEach((slide, idx) => {
    const item = document.createElement("div");
    item.className = `hero__slide${idx === 0 ? " hero__slide--active" : ""}`;
    item.style.backgroundImage = `url(${assetPath(slide.img)})`;
    item.innerHTML = `
      <div class="hero__overlay"></div>
      <div class="hero__content container">
        <p class="hero__eyebrow">${slide.eyebrow}</p>
        <h1 class="hero__title">${slide.title}</h1>
        <p class="hero__subtitle">${slide.subtitle}</p>
        <div class="hero__actions">
          <a href="#productos" class="btn btn--gold btn--lg">${slide.cta}</a>
          <a href="#pedido" class="btn btn--outline hero__cta-secondary">Hacer pedido</a>
        </div>
      </div>
    `;
    slidesContainer.appendChild(item);

    const dot = document.createElement("button");
    dot.className = `hero__dot${idx === 0 ? " hero__dot--active" : ""}`;
    dot.addEventListener("click", () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });
}

/** Cambia de slide y reinicia autoplay */
function goToSlide(index) {
  const slides = document.querySelectorAll(".hero__slide");
  const dots = document.querySelectorAll(".hero__dot");
  if (!slides.length || !dots.length) return;

  slides[state.currentSlide].classList.remove("hero__slide--active");
  dots[state.currentSlide].classList.remove("hero__dot--active");

  state.currentSlide = (index + state.heroSlides.length) % state.heroSlides.length;
  slides[state.currentSlide].classList.add("hero__slide--active");
  dots[state.currentSlide].classList.add("hero__dot--active");

  clearInterval(state.slideTimer);
  state.slideTimer = setInterval(() => goToSlide(state.currentSlide + 1), 5500);
}

/** Inicializa botones y autoplay del hero */
function initHero() {
  buildHero();
  if (state.heroSlides.length > 1) {
    state.slideTimer = setInterval(() => goToSlide(state.currentSlide + 1), 5500);
  }

  const prev = document.querySelector(".hero__prev");
  const next = document.querySelector(".hero__next");
  if (prev) prev.addEventListener("click", () => goToSlide(state.currentSlide - 1));
  if (next) next.addEventListener("click", () => goToSlide(state.currentSlide + 1));
}

/** Renderiza botones de filtros de persona y tipo */
function buildFilters() {
  const filters = document.querySelector(".filters");
  if (!filters) return;

  const personas = ["todos", "ninos", "adolescentes", "damas", "caballeros"];
  const pLabels = {
    todos: "Todos",
    ninos: "Ninos y Ninas",
    adolescentes: "Adolescentes",
    damas: "Damas",
    caballeros: "Caballeros",
  };

  const tipos = ["todos-tipo", "deportivos", "casuales"];
  const tLabels = {
    "todos-tipo": "Todos los estilos",
    deportivos: "Deportivos",
    casuales: "Casuales",
  };

  filters.innerHTML =
    '<div class="filters__row" id="filters-persona"></div><div class="filters__row" id="filters-tipo"></div>';

  const filtersPersona = document.getElementById("filters-persona");
  const filtersTipo = document.getElementById("filters-tipo");
  if (!filtersPersona || !filtersTipo) return;

  personas.forEach((persona) => {
    const btn = document.createElement("button");
    btn.className = `filter-btn filter-btn--persona${persona === "todos" ? " filter-btn--active" : ""}`;
    btn.textContent = pLabels[persona];
    btn.dataset.persona = persona;
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn--persona")
        .forEach((b) => b.classList.remove("filter-btn--active"));
      btn.classList.add("filter-btn--active");
      const activeTipo = document.querySelector(".filter-btn--tipo.filter-btn--active");
      renderProducts(persona, activeTipo ? activeTipo.dataset.tipo : "todos-tipo");
    });
    filtersPersona.appendChild(btn);
  });

  tipos.forEach((tipo) => {
    const btn = document.createElement("button");
    btn.className = `filter-btn filter-btn--tipo${tipo === "todos-tipo" ? " filter-btn--active" : ""}`;
    btn.textContent = tLabels[tipo];
    btn.dataset.tipo = tipo;
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn--tipo")
        .forEach((b) => b.classList.remove("filter-btn--active"));
      btn.classList.add("filter-btn--active");
      const activePersona = document.querySelector(".filter-btn--persona.filter-btn--active");
      renderProducts(activePersona ? activePersona.dataset.persona : "todos", tipo);
    });
    filtersTipo.appendChild(btn);
  });
}

/** Renderiza tarjetas de productos segun filtros activos */
function renderProducts(persona, tipo) {
  const grid = document.querySelector(".products-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const list = state.products.filter((product) => {
    const matchPersona = persona === "todos" || product.persona === persona;
    const matchTipo = !tipo || tipo === "todos-tipo" || product.tipo === tipo;
    return matchPersona && matchTipo;
  });

  if (!list.length) {
    grid.innerHTML =
      '<p class="products-empty">No hay productos en esta categoria todavia.</p>';
    return;
  }

  list.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = String(product.id);

    const badge = product.badge
      ? `<span class="product-card__badge${
          product.badge === "No disponible" ? " product-card__badge--unavailable" : ""
        }">${product.badge}</span>`
      : "";

    const personaLabel =
      {
        ninos: "Ninos y Ninas",
        adolescentes: "Adolescentes",
        damas: "Damas",
        caballeros: "Caballeros",
      }[product.persona] || product.persona;

    const footer =
      product.badge === "No disponible"
        ? '<div class="product-card__footer"><span class="product-card__soon">Disponible pronto</span></div>'
        : `<div class="product-card__footer"><span class="product-card__view">Ver detalle &rarr;</span><a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            `Hola, me interesa: ${product.name}`
          )}" class="btn btn--whatsapp btn--sm" target="_blank" rel="noreferrer">WhatsApp</a></div>`;

    const priceHtml = product.price ? `<p class="product-card__price">${product.price}</p>` : "";
    const sizesHtml = product.sizes ? `<p class="product-card__sizes">Tallas: ${product.sizes}</p>` : "";

    card.innerHTML = `
      <div class="product-card__img-wrap">
        ${badge}
        <img src="${assetPath(product.img)}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-card__body">
        <span class="product-card__category">${personaLabel} &mdash; ${product.tipo}</span>
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__desc">${product.desc}</p>
        ${priceHtml}
        ${sizesHtml}
        ${footer}
      </div>
    `;

    const imageWrap = card.querySelector(".product-card__img-wrap");
    if (imageWrap) imageWrap.addEventListener("click", () => openModal(product.id));

    const viewBtn = card.querySelector(".product-card__view");
    if (viewBtn) viewBtn.addEventListener("click", () => openModal(product.id));

    grid.appendChild(card);
  });

  initScrollReveal();
}

/** Abre modal con detalle de un producto */
function openModal(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;

  const modal = document.getElementById("product-modal");
  const body = document.getElementById("modal-body");
  if (!modal || !body) return;

  const price = product.price ? `<p class="modal__price">${product.price}</p>` : "";
  const sizes = product.sizes ? `<p class="modal__sizes"><strong>Tallas:</strong> ${product.sizes}</p>` : "";

  body.innerHTML = `
    <img src="${assetPath(product.img)}" alt="${product.name}">
    <div class="modal__info">
      <h2>${product.name}</h2>
      <p>${product.desc}</p>
      ${price}
      ${sizes}
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hola, me interesa: ${product.name}`
      )}" class="btn btn--whatsapp" target="_blank" rel="noreferrer">Consultar por WhatsApp</a>
    </div>
  `;

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.hidden = true;
  document.body.style.overflow = "";
}

/** Inicializa eventos del modal (cerrar por X, fondo o ESC) */
function initModal() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;
  modal.querySelector(".modal__close")?.addEventListener("click", closeModal);
  modal.querySelector(".modal__backdrop")?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

/** Controla menu movil y efecto del header al hacer scroll */
function initHeader() {
  const header = document.getElementById("header");
  const hamburger = document.querySelector(".hamburger");
  const nav = document.getElementById("main-nav");

  window.addEventListener("scroll", () => {
    if (header) header.classList.toggle("header--scrolled", window.scrollY > 60);
  });

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      const open = nav.classList.toggle("nav__list--open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll(".nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav__list--open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }
}

/** Llena el select de modelos con los productos disponibles */
function populateModelSelect() {
  const select = document.getElementById("order-model");
  if (!select) return;

  // Filtrar productos disponibles (con precio y sin badge "No disponible")
  const availableProducts = state.products.filter(
    (p) => p.price && p.badge !== "No disponible"
  );

  // Agrupar por categoría
  const groups = {
    caballeros: { deporticos: [], casuales: [], formales: [] },
    damas: { deporticos: [], casuales: [], formales: [] },
    ninos: { deporticos: [], casuales: [], formales: [] },
    adolescentes: { deporticos: [], casuales: [], formales: [] },
  };

  availableProducts.forEach((p) => {
    const persona = p.persona || "otros";
    const tipo = p.tipo || "otros";
    if (groups[persona] && groups[persona][tipo]) {
      groups[persona][tipo].push(p);
    } else if (!groups[persona]) {
      groups["otros"] = { otros: (groups["otros"]?.otros || []).concat([p]) };
    }
  });

  const labels = {
    caballeros: "Caballeros",
    damas: "Damas",
    ninos: "Niños",
    adolescentes: "Adolescentes",
    deporticos: "Deportivos",
    casuales: "Casuales",
    formales: "Formales",
    otros: "Otros",
  };

  // Crear opciones agrupadas
  Object.keys(groups).forEach((persona) => {
    if (persona === "otros") return;
    Object.keys(groups[persona]).forEach((tipo) => {
      const products = groups[persona][tipo];
      if (products.length === 0) return;

      const optgroup = document.createElement("optgroup");
      optgroup.label = `${labels[persona]} - ${labels[tipo]}`;

      products.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.name;
        option.dataset.img = p.img;
        option.dataset.name = p.name;
        optgroup.appendChild(option);
      });

      select.appendChild(optgroup);
    });
  });
}

/** Muestra la imagen del producto seleccionado */
function initModelPreview() {
  const select = document.getElementById("order-model");
  const img = document.getElementById("order-model-img");

  if (!select || !img) return;

  select.addEventListener("change", () => {
    const option = select.options[select.selectedIndex];
    if (option && option.dataset.img) {
      img.src = assetPath(option.dataset.img);
      img.style.display = "block";
      img.alt = option.dataset.name || "Vista previa";
    } else {
      img.style.display = "none";
      img.src = "";
    }
  });
}

/** Construye y envia mensaje a WhatsApp con los datos del pedido */
function initOrderForm() {
  const form = document.getElementById("order-form");
  const success = document.getElementById("order-success");
  if (!form) return;

  // Llenar select de modelos
  populateModelSelect();
  initModelPreview();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("order-name")?.value.trim();
    const phone = document.getElementById("order-phone")?.value.trim();
    const modelSelect = document.getElementById("order-model");
    const modelId = modelSelect?.value;
    const size = document.getElementById("order-size")?.value;
    const qty = document.getElementById("order-qty")?.value;
    const notes = document.getElementById("order-notes")?.value.trim();

    // Obtener datos del producto seleccionado
    const product = state.products.find((p) => String(p.id) === String(modelId));

    if (!name || !phone || !modelId || !size) {
      if (success) {
        success.textContent = "Por favor completa los campos obligatorios.";
        success.style.color = "#e94560";
      }
      return;
    }

    const modelName = product?.name || "No especificado";
    const modelImg = product?.img || "";

    const message =
      "Hola! Quiero hacer un pedido:\n\n" +
      `Nombre: ${name}\n` +
      `Telefono: ${phone}\n` +
      `Modelo: ${modelName}\n` +
      `Talla: ${size}\n` +
      `Cantidad: ${qty} par(es)` +
      (modelImg ? `\nFoto del modelo: ${window.location.origin}/${modelImg}` : "") +
      (notes ? `\nNotas: ${notes}` : "") +
      "\n\n💡 Si tienes una foto de referencia, puedes enviarla directamente por WhatsApp después de abrir la conversación." +
      "\n\nGracias!";

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    if (success) {
      success.textContent = "Abriendo WhatsApp con tu pedido...";
      success.style.color = "#25d366";
    }
    form.reset();
    // Resetear preview
    const img = document.getElementById("order-model-img");
    if (img) img.style.display = "none";
  });
}

/** Revela secciones cuando entran al viewport */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal:not(.revealed)");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -20px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

function setCopyrightYear() {
  const el = document.getElementById("copyright-year");
  if (el) el.textContent = new Date().getFullYear();
}

/** Secuencia principal de arranque */
async function bootstrap() {
  await loadStoreData();
  initHero();
  buildFilters();
  renderProducts("todos", "todos-tipo");
  initModal();
  initHeader();
  initOrderForm();
  setCopyrightYear();
  initScrollReveal();
}

document.addEventListener("DOMContentLoaded", bootstrap);
