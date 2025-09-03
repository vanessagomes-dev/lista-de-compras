const STORAGE_KEY = "listasCompras_v1";
let listas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let listaAtiva = null;

const TIPOS_LISTA_NOME = {
  dia: "Lista do Dia",
  semana: "Lista da Semana",
  quinzena: "Lista da Quinzena",
  mes: "Lista do Mês",
};

const ALL_CATEGORIES = [
  "limpeza",
  "hortifruti",
  "mercearia",
  "bebidas",
  "acougue",
  "variedades",
];

function ensureCategoriaKeys(lista) {
  if (!lista.categorias || typeof lista.categorias !== "object")
    lista.categorias = {};
  ALL_CATEGORIES.forEach((cat) => {
    if (!Object.prototype.hasOwnProperty.call(lista.categorias, cat))
      lista.categorias[cat] = [];
  });
  return lista;
}
listas = listas.map((l) => ensureCategoriaKeys(l));
localStorage.setItem(STORAGE_KEY, JSON.stringify(listas));

// Elements
const btnConfig = document.getElementById("btn-config");
const dropdown = document.getElementById("config-dropdown");

const homeSection = document.getElementById("home-section");
const listasSection = document.getElementById("listas-section");
const itensSection = document.getElementById("itens-section");

const navHome = document.getElementById("nav-home");
const navListas = document.getElementById("nav-listas");

const listasContainer = document.getElementById("listas-container");
const categoriasContainer = document.getElementById("categorias-container");

const tituloLista = document.getElementById("titulo-lista");
const btnVoltarListas = document.getElementById("btn-voltar-listas");
const btnVoltarItens = document.getElementById("btn-voltar-itens");

const form = document.getElementById("form-adicionar");
const inputItem = document.getElementById("input-item");
const selectCategoria = document.getElementById("select-categoria");

const btnNovaLista = document.getElementById("btn-nova-lista");
const modalLista = document.getElementById("modal-lista");
const closeModal = document.getElementById("close-modal");

const btnSearch = document.getElementById("btn-search");
const inputSearch = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");
const toastClose = document.getElementById("toast-close");

// i18n
let currentLang = localStorage.getItem("lang") || "pt";
let translations = null;

// normaliza texto (remove acentos e deixa minúsculo)
function normalizeKey(str = "") {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// carrega arquivo de tradução por fetch; fallback para console.error
async function loadTranslations(lang) {
  try {
    const res = await fetch(`locales/${lang}.json`);
    if (!res.ok) throw new Error("Failed to load locale");
    translations = await res.json();
    currentLang = lang;
    localStorage.setItem("lang", lang);
    applyTranslationsToUI();
    // re-renderiza para aplicar traduções nos itens/listas
    renderListas();
    if (listaAtiva) renderCategorias();
  } catch (err) {
    console.error("loadTranslations error", err);
  }
}
// retorna texto traduzido para chaves estáticas
function t(path, vars = {}) {
  if (!translations) return "";
  const parts = path.split(".");
  let node = translations;
  for (const p of parts) {
    if (!node[p]) return "";
    node = node[p];
  }
  // substitui variáveis {name}
  return node.replace(/\{(\w+)\}/g, (_, k) => vars[k] || "");
}

// tenta traduzir texto livre (item). usa glossary presente em translations.items
function applyTranslationsToUI() {
  if (!translations) return;

  // nav
  document.getElementById("nav-home").textContent =
    translations.nav.home || "Home";
  document.getElementById("nav-listas").textContent =
    translations.nav.myLists || "Minhas Listas";

  // título global
  const titleEl = document.querySelector(".title");
  if (titleEl)
    titleEl.textContent = translations.titles?.appTitle || "Lista de Compras";

  // título da seção "Minhas Listas"
  const listasTitle = document.querySelector("#listas-section h2");
  if (listasTitle)
    listasTitle.textContent = translations.nav.myLists || "Minhas Listas";

  // título do modal "Escolha o tipo de lista"
  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) {
    modalTitle.textContent =
      translations.titles?.chooseListType || "Escolha o tipo de lista";
  }

  // botões dentro do modal (nova lista)
  document.querySelectorAll("#modal-lista .opcao").forEach((btn) => {
    const tipo = btn.dataset.tipo;
    if (tipo && translations.lists?.[tipo]) {
      btn.textContent = translations.lists[tipo];
    }
  });

  // placeholders
  const input = document.getElementById("input-item");
  if (input)
    input.placeholder =
      translations.placeholders?.addItem || "Adicione um novo item";

  const searchInput = document.getElementById("search-input");
  if (searchInput)
    searchInput.placeholder =
      translations.placeholders?.search || "Pesquisar item...";

  // botões
  const btnAdd = document.getElementById("btn-adicionar");
  if (btnAdd)
    btnAdd.textContent = translations.buttons?.addItem || "Adicionar item";

  const btnSearch = document.getElementById("btn-search");
  if (btnSearch)
    btnSearch.textContent = translations.buttons?.search || "Pesquisar";

  const btnNovaLista = document.getElementById("btn-nova-lista");
  if (btnNovaLista)
    btnNovaLista.textContent =
      translations.buttons?.startNewList || "Iniciar nova lista";

  // traduz labels do select de categorias
  const select = document.getElementById("select-categoria");
  if (select) {
    Array.from(select.options).forEach((opt) => {
      const key = opt.value;
      const label = translations.categories?.[key];
      if (label) opt.textContent = label;
    });
  }
}

// ===== Helpers =====
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(listas));
const show = (el) => el && el.classList.remove("hidden");
const hide = (el) => el && el.classList.add("hidden");

const showSection = (section) => {
  hide(homeSection);
  hide(listasSection);
  hide(itensSection);
  show(section);
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
};

// ===== Toast =====
let toastTimeout;
const showToast = (msg, timeout = 2500) => {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.hidden = false;
  toast.classList.add("show");
  toast.classList.remove("hide");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.hidden = true;
  }, timeout);
};
document.querySelectorAll(".toast-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!toast) return;
    toast.hidden = true;
    if (toastTimeout) clearTimeout(toastTimeout);
  });
});

// ===== Nav =====
navHome.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(homeSection);
  navHome.classList.add("active");
});
navListas.addEventListener("click", (e) => {
  e.preventDefault();
  renderListas();
  showSection(listasSection);
  navListas.classList.add("active");
});
btnVoltarListas?.addEventListener("click", () => {
  showSection(homeSection);
  navHome.classList.add("active");
});
btnVoltarItens?.addEventListener("click", () => {
  showSection(listasSection);
  navListas.classList.add("active");
});

// ===== Dropdown Config =====
if (btnConfig) {
  btnConfig.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
    const expanded = btnConfig.getAttribute("aria-expanded") === "true";
    btnConfig.setAttribute("aria-expanded", String(!expanded));
  });
}
document.addEventListener("click", (e) => {
  if (dropdown && !dropdown.contains(e.target) && e.target !== btnConfig) {
    dropdown.classList.add("hidden");
    btnConfig && btnConfig.setAttribute("aria-expanded", "false");
  }
});

// ===== Color map =====
const COLOR_MAP = {
  azul: "#3b82f6",
  rosa: "#ec4899",
  verde: "#22c55e",
  laranja: "#f97316",
  roxo: "#8b5cf6",
  brand: "#ca3884",
};

// ===== Color selector handler =====
document.querySelectorAll(".color-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!listaAtiva) {
      showToast("Abra uma lista para configurar a cor.");
      dropdown.classList.add("hidden");
      return;
    }
    const key = btn.dataset.color;
    const hex = COLOR_MAP[key] || key || null;
    if (!hex) {
      showToast("Cor inválida.");
      dropdown.classList.add("hidden");
      return;
    }

    listaAtiva.color = hex;
    save();
    renderListas();
    aplicarEstiloLista();
    dropdown.classList.add("hidden");
    showToast("Cor da lista alterada!");
  });
});

// ===== Background selector handler =====
document.querySelectorAll(".bg-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    const bg = btn.dataset.bg;
    if (!listaAtiva) {
      showToast("Abra uma lista para alterar o fundo.");
      return;
    }

    if (bg === "none") {
      listaAtiva.bg = null;
      document.body.style.backgroundImage = "";
      showToast("Fundo removido com sucesso!");
    } else {
      listaAtiva.bg = bg;
      document.body.style.backgroundImage = `url('assets/${bg}')`;
      showToast("Papel de parede aplicado!");
    }

    save();
    dropdown.classList.add("hidden");
  });
});

// ===== Menu placeholders  =====
document.getElementById("config-lang")?.addEventListener("click", () => {
  showToast("Em breve: trocar idioma 🌍");
  dropdown.classList.add("hidden");
});

// ===== Modal Nova Lista =====
btnNovaLista?.addEventListener("click", () => {
  if (listas.length >= 4) {
    showToast("Limite de 4 listas atingido.");
    return;
  }
  show(modalLista);
});
closeModal?.addEventListener("click", () => hide(modalLista));
modalLista?.addEventListener("click", (e) => {
  if (e.target === modalLista) hide(modalLista);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hide(modalLista);
    dropdown && dropdown.classList.add("hidden");
    btnConfig && btnConfig.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".opcao").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tipo = btn.dataset.tipo;
    if (!tipo) return;
    if (listas.some((l) => l.tipo === tipo)) {
      showToast(`${TIPOS_LISTA_NOME[tipo]} já foi criada!`);
      hide(modalLista);
      return;
    }
    if (listas.length >= 4) {
      showToast("Limite de 4 listas atingido.");
      hide(modalLista);
      return;
    }

    const novaLista = {
      id: Date.now(),
      tipo,
      categorias: {
        limpeza: [],
        hortifruti: [],
        mercearia: [],
        bebidas: [],
        acougue: [],
        variedades: [],
      },
      color: null,
      bg: null,
    };

    listas.push(ensureCategoriaKeys(novaLista));
    save();
    renderListas();
    hide(modalLista);
    showSection(listasSection);
    navListas.classList.add("active");
    showToast(`${TIPOS_LISTA_NOME[tipo]} criada!`);
  });
});

// ===== Render Listas =====
function renderListas() {
  listasContainer.innerHTML = "";
  if (!listas.length) {
    listasContainer.innerHTML = `<p>Nenhuma lista criada ainda.</p>`;
    return;
  }

  listas.forEach((lista) => {
    const card = document.createElement("div");
    card.className = `lista-card card-${lista.tipo}`;
    card.style.display = "flex";
    card.style.justifyContent = "space-between";
    card.style.alignItems = "center";
    card.style.cursor = "pointer";

    // badge/color indicator
    const badge = document.createElement("span");
    badge.className = "list-badge";
    badge.setAttribute("aria-hidden", "true");
    if (lista.color) {
      badge.style.background = lista.color;
      card.style.borderColor = lista.color;

      // Hover dinâmico baseado na cor
      card.addEventListener("mouseenter", () => {
        card.style.boxShadow = `0 4px 12px ${lista.color}40`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "";
      });
    }

    const nome = document.createElement("span");
    nome.className = "lista-nome";
    nome.textContent =
      t(`lists.${lista.tipo}`) ||
      TIPOS_LISTA_NOME[lista.tipo] ||
      `Lista (${lista.tipo})`;

    // botões de ação
    const actions = document.createElement("div");
    actions.className = "lista-actions";
    actions.style.display = "flex";
    actions.style.gap = "10px";

    // ====== BOTÃO COMPARTILHAR ======
    const btnShare = document.createElement("button");
    btnShare.className = "icon-btn";
    btnShare.innerHTML = `<img src="assets/share.png" alt="Compartilhar lista" style="width:18px;height:18px;">`;
    btnShare.addEventListener("click", async (e) => {
      e.stopPropagation();

      // monta o texto da lista
      let conteudo = `${TIPOS_LISTA_NOME[lista.tipo]}\n\n`;
      Object.keys(lista.categorias).forEach((cat) => {
        const itens = lista.categorias[cat];
        if (itens.length) {
          conteudo += `📌 ${cat}:\n`;
          itens.forEach((item) => {
            conteudo += `- ${item.text}${item.done ? " ✔️" : ""}\n`;
          });
          conteudo += "\n";
        }
      });

      try {
        if (navigator.share) {
          await navigator.share({
            title: TIPOS_LISTA_NOME[lista.tipo],
            text: conteudo,
          });
        } else {
          await navigator.clipboard.writeText(conteudo);
          showToast("Lista copiada para a área de transferência!");
        }
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
        showToast("Não foi possível compartilhar a lista.");
      }
    });

    // botão excluir
    const btnDelete = document.createElement("button");
    btnDelete.className = "icon-btn";
    btnDelete.innerHTML = `<img src="assets/delete.png" alt="Excluir lista" style="width:18px;height:18px;">`;
    btnDelete.addEventListener("click", (e) => {
      e.stopPropagation();
      listas = listas.filter((l) => l.id !== lista.id);
      save();
      renderListas();
      showToast(`${TIPOS_LISTA_NOME[lista.tipo]} excluída!`);
    });

    actions.appendChild(btnShare);
    actions.appendChild(btnDelete);

    const leftWrap = document.createElement("div");
    leftWrap.style.display = "flex";
    leftWrap.style.alignItems = "center";
    leftWrap.style.gap = "8px";
    leftWrap.appendChild(badge);
    leftWrap.appendChild(nome);

    card.appendChild(leftWrap);
    card.appendChild(actions);

    // clique no card abre a lista
    card.addEventListener("click", () => {
      abrirLista(lista.id);
    });

    listasContainer.appendChild(card);
  });
}

// ===== Abrir Lista =====
function abrirLista(listaId) {
  const lista = listas.find((l) => l.id === listaId);
  if (!lista) {
    showToast("Lista não encontrada.");
    return;
  }

  listaAtiva = lista;

  // Atualiza título da lista
  tituloLista.textContent =
    t(`lists.${lista.tipo}`) || TIPOS_LISTA_NOME[lista.tipo];

  renderCategorias();
  aplicarEstiloLista();
  showSection(itensSection);
}

// ===== Render Categorias / Itens =====
function renderCategorias() {
  categoriasContainer.innerHTML = "";
  if (!listaAtiva) return;
  ALL_CATEGORIES.forEach((cat) => {
    const ul = document.createElement("ul");
    ul.className = "lista";
    ul.innerHTML = `<h3>${cat}</h3>`;
    const items = (listaAtiva.categorias && listaAtiva.categorias[cat]) || [];
    if (!items.length) {
      const vazio = document.createElement("li");
      vazio.className = "item vazio";
      vazio.innerHTML = `<div class="item-left"><div class="item-title vazio-text">Nenhum item ainda</div></div>`;
      ul.appendChild(vazio);
    } else {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "item";
        li.dataset.id = item.id;
        li.innerHTML = `
          <div class="item-left">
            <input type="checkbox" ${
              item.done ? "checked" : ""
            } data-cat="${cat}" data-id="${item.id}">
            <div class="item-title">${escapeHtml(
              translateItemText(item.text)
            )}</div>
          </div>
          <div class="item-controls">
            <button class="icon-btn" data-action="delete" data-cat="${cat}" data-id="${
          item.id
        }">
              <img src="assets/delete.png" alt="Remover"/>
            </button>
          </div>
        `;
        ul.appendChild(li);
      });
    }
    categoriasContainer.appendChild(ul);
  });
}

// ===== Add Item =====
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!listaAtiva) {
    showToast("Abra uma lista para adicionar itens.");
    return;
  }
  const text = inputItem.value.trim();
  const cat = selectCategoria ? selectCategoria.value : null;
  if (!text || !cat) return;
  if (!listaAtiva.categorias[cat]) listaAtiva.categorias[cat] = [];
  const listaItens = listaAtiva.categorias[cat];
  if (listaItens.length >= 10) {
    showToast("Cada categoria só pode ter até 10 itens.");
    return;
  }
  const totalItens = Object.values(listaAtiva.categorias).flat().length;
  if (totalItens >= 60) {
    showToast("Cada lista só pode ter até 60 itens.");
    return;
  }
  listaItens.push({ id: Date.now(), text, done: false });
  save();
  renderCategorias();
  inputItem.value = "";
});

// Toggle/Delete handlers
categoriasContainer?.addEventListener("click", (e) => {
  if (e.target.matches("input[type=checkbox]")) {
    const cat = e.target.dataset.cat;
    const id = Number(e.target.dataset.id);
    const item = listaAtiva.categorias[cat].find((i) => i.id === id);
    if (item) {
      item.done = e.target.checked;
      save();
    }
  }
  const delBtn = e.target.closest("[data-action=delete]");
  if (delBtn) {
    const cat = delBtn.dataset.cat;
    const id = Number(delBtn.dataset.id);
    listaAtiva.categorias[cat] = listaAtiva.categorias[cat].filter(
      (i) => i.id !== id
    );
    save();
    renderCategorias();
  }
});

// ===== Pesquisa Global =====
function pesquisar() {
  const termo = inputSearch.value.trim().toLowerCase();
  searchResults.innerHTML = "";
  if (!termo) {
    searchResults.innerHTML = "<p>Digite um termo para pesquisar.</p>";
    return;
  }
  let encontrados = [];
  listas.forEach((lista) => {
    let itensEncontrados = [];
    Object.values(lista.categorias).forEach((categoria) => {
      categoria.forEach((item) => {
        if (item.text.toLowerCase().includes(termo))
          itensEncontrados.push(item);
      });
    });
    if (itensEncontrados.length)
      encontrados.push({ lista, itens: itensEncontrados });
  });

  if (!encontrados.length) {
    searchResults.innerHTML = `<p class="nenhum">Item não encontrado.</p>`;
  } else {
    encontrados.forEach(({ lista, itens }) => {
      const wrap = document.createElement("div");
      wrap.className = `lista-card card-${lista.tipo} resultado-card`;
      wrap.dataset.id = lista.id;
      const itensHtml = itens
        .slice(0, 5)
        .map((i) => `<span class="tag">${escapeHtml(i.text)}</span>`)
        .join(" ");
      wrap.innerHTML = `
        <span>${TIPOS_LISTA_NOME[lista.tipo]}</span>
        <div>${itensHtml}</div>
        <button class="icon-btn limpar-resultado" title="Remover resultado">
          <img src="assets/delete-small.png" alt="Limpar">
        </button>
      `;
      searchResults.appendChild(wrap);
    });
  }
  inputSearch.value = "";
}
btnSearch?.addEventListener("click", pesquisar);
inputSearch?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    pesquisar();
  }
});
searchResults?.addEventListener("click", (e) => {
  const card = e.target.closest(".resultado-card");
  if (card && !e.target.closest(".limpar-resultado"))
    abrirLista(Number(card.dataset.id));
  if (e.target.closest(".limpar-resultado")) {
    e.target.closest(".resultado-card").remove();
    if (!searchResults.querySelector(".resultado-card"))
      searchResults.innerHTML = "";
  }
});

// ===== aplicar Estilo Lista =====
function aplicarEstiloLista() {
  if (!listaAtiva) return;
  // aplicar cor no título e na borda do container de itens
  if (listaAtiva.color) {
    tituloLista.style.color = listaAtiva.color;
    if (itensSection) {
      itensSection.style.border = `2px solid ${listaAtiva.color}`;
    }
  } else {
    tituloLista.style.color = "";
    if (itensSection) {
      itensSection.style.border = "";
    }
  }

  // aplicar fundo
  if (listaAtiva.bg) {
    if (itensSection) {
      itensSection.style.backgroundImage = `url("assets/${listaAtiva.bg}")`;
      itensSection.style.backgroundSize = "cover";
      itensSection.style.backgroundPosition = "center";
    }
  } else {
    if (itensSection) {
      itensSection.style.backgroundImage = "";
      itensSection.style.backgroundSize = "";
      itensSection.style.backgroundPosition = "";
    }
  }
}

// ===== Utils =====
function escapeHtml(str) {
  return String(str).replace(
    /[&"'<>]/g,
    (tag) =>
      ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" }[
        tag
      ])
  );
}

// ===== carregar traduções =====
loadTranslations(currentLang);

// ===== Init =====
renderListas();
showSection(homeSection);
navHome.classList.add("active");
