const STORAGE_KEY = "listasCompras_v1";
let listas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let listaAtiva = null;

const TIPOS_LISTA_NOME = {
  dia: "Lista do Dia",
  semana: "Lista da Semana",
  quinzena: "Lista da Quinzena",
  mes: "Lista do Mês",
};

// ordem fixa de categorias
const ALL_CATEGORIES = [
  "limpeza",
  "hortifruti",
  "mercearia",
  "bebidas",
  "acougue",
  "variedades",
];

// ====== Normalize listas carregadas ======
function ensureCategoriaKeys(lista) {
  if (!lista.categorias || typeof lista.categorias !== "object") {
    lista.categorias = {};
  }
  ALL_CATEGORIES.forEach((cat) => {
    if (!Object.prototype.hasOwnProperty.call(lista.categorias, cat)) {
      lista.categorias[cat] = [];
    }
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

// ====== Helpers ======
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

// ====== Toast (garante limpar timeout) ======
let toastTimeout;
const showToast = (msg, timeout = 2500) => {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add("show");
  toast.classList.remove("hide");
  toast.hidden = false;

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.hidden = true;
  }, timeout);
};

if (toastClose) {
  toastClose.addEventListener("click", () => {
    if (!toast) return;
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.hidden = true;
    if (toastTimeout) clearTimeout(toastTimeout);
  });
}

// ====== Nav ======
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

// ====== Dropdown Config ======
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
document.getElementById("config-colors")?.addEventListener("click", () => {
  showToast("Em breve: trocar cores 🎨");
  dropdown.classList.add("hidden");
});
document.getElementById("config-lang")?.addEventListener("click", () => {
  showToast("Em breve: trocar idioma 🌍");
  dropdown.classList.add("hidden");
});
document.getElementById("config-share")?.addEventListener("click", () => {
  showToast("Em breve: compartilhar lista 🔗");
  dropdown.classList.add("hidden");
});

// Definir cor da lista
document.querySelectorAll(".color-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!listaAtiva) {
      showToast("Abra uma lista para configurar.");
      return;
    }
    listaAtiva.color = btn.dataset.color;
    save();
    renderListas();
    showToast(`Cor da lista alterada para ${btn.dataset.color}`);
  });
});

// Definir papel de parede
document.querySelectorAll(".bg-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!listaAtiva) {
      showToast("Abra uma lista para configurar.");
      return;
    }
    listaAtiva.bg = btn.dataset.bg;
    save();
    aplicarEstiloLista();
    showToast("Papel de parede aplicado!");
  });
});

// Aplicar estilo quando abrir lista
function aplicarEstiloLista() {
  if (!listaAtiva) return;

  // Cor no título / card
  if (listaAtiva.color) {
    tituloLista.style.color = listaAtiva.color;
  }

  // Fundo no container
  if (listaAtiva.bg) {
    itensSection.style.backgroundImage = `url("assets/${listaAtiva.bg}")`;
    itensSection.style.backgroundSize = "cover";
    itensSection.style.backgroundPosition = "center";
  } else {
    itensSection.style.backgroundImage = "none";
  }
}

// ====== Modal Nova Lista ======
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

// criação de listas pelo modal
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

// ====== Render Listas ======
function renderListas() {
  listasContainer.innerHTML = "";
  if (!listas.length) {
    listasContainer.innerHTML = `<p>Nenhuma lista criada ainda.</p>`;
    return;
  }

  listas.forEach((lista) => {
    const card = document.createElement("div");
    card.className = `lista-card card-${lista.tipo}`;

    const nome = document.createElement("span");
    nome.textContent = TIPOS_LISTA_NOME[lista.tipo] || `Lista (${lista.tipo})`;

    const del = document.createElement("button");
    del.className = "icon-btn";
    del.innerHTML = `<img src="assets/delete.png" alt="Excluir lista">`;
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      listas = listas.filter((l) => l.id !== lista.id);
      save();
      renderListas();
      showToast(`${TIPOS_LISTA_NOME[lista.tipo]} excluída!`);
    });

    card.appendChild(nome);
    card.appendChild(del);
    card.addEventListener("click", () => abrirLista(lista.id));
    listasContainer.appendChild(card);
  });
}

// ====== Abrir Lista ======
function abrirLista(id) {
  aplicarEstiloLista();
  listaAtiva = listas.find((l) => l.id === id);
  if (!listaAtiva) return;

  // garante que listaAtiva tem todas as categorias
  ensureCategoriaKeys(listaAtiva);

  tituloLista.textContent = `${TIPOS_LISTA_NOME[listaAtiva.tipo]} - Itens`;
  renderCategorias();
  show(itensSection);
  hide(listasSection);
  hide(homeSection);

  if (abrirLista.destacarId) {
    const el = categoriasContainer.querySelector(
      `[data-id="${abrirLista.destacarId}"]`
    );
    if (el) {
      el.classList.add("destacado");
      setTimeout(() => el.classList.remove("destacado"), 3000);
    }
    abrirLista.destacarId = null;
  }
}

// ====== Render Categorias / Itens ======
function renderCategorias() {
  categoriasContainer.innerHTML = "";

  // renderiza todas as categorias na ordem ALL_CATEGORIES
  ALL_CATEGORIES.forEach((cat) => {
    const ul = document.createElement("ul");
    ul.className = "lista";
    ul.innerHTML = `<h3>${cat}</h3>`;

    const items =
      (listaAtiva && listaAtiva.categorias && listaAtiva.categorias[cat]) || [];

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
            <div class="item-title">${escapeHtml(item.text)}</div>
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

// ====== Add Item ======
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!listaAtiva) {
    showToast("Abra uma lista para adicionar itens.");
    return;
  }

  const text = inputItem.value.trim();
  const cat = selectCategoria ? selectCategoria.value : null;
  if (!text || !cat) return;

  // garante que a categoria exista (cria se não existir)
  if (!listaAtiva.categorias[cat]) {
    listaAtiva.categorias[cat] = [];
  }

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

// Toggle / Delete
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

// ====== Pesquisa Global ======
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
  if (card && !e.target.closest(".limpar-resultado")) {
    abrirLista(Number(card.dataset.id));
  }
  if (e.target.closest(".limpar-resultado")) {
    e.target.closest(".resultado-card").remove();
    if (!searchResults.querySelector(".resultado-card"))
      searchResults.innerHTML = "";
  }
});

// Toast close (fallback caso id diferir)
document.querySelectorAll(".toast-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (toast) {
      toast.hidden = true;
      if (toastTimeout) clearTimeout(toastTimeout);
    }
  });
});

// ====== Utils ======
function escapeHtml(str) {
  return String(str).replace(
    /[&"'<>]/g,
    (tag) =>
      ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" }[
        tag
      ])
  );
}

// ====== Init ======
renderListas();
showSection(homeSection);
navHome.classList.add("active");
