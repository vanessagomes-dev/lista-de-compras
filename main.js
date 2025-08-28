const STORAGE_KEY = "listasCompras_v1";
let listas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let listaAtiva = null;

// elementos
const btnConfig = document.getElementById("btn-config");
const configPanel = document.getElementById("config-panel");
const btnVoltar = configPanel.querySelector(".btn-voltar");
const listasContainer = document.getElementById("listas-container");
const itensSection = document.getElementById("itens-section");
const categoriasContainer = document.getElementById("categorias-container");
const form = document.getElementById("form-adicionar");
const inputItem = document.getElementById("input-item");
const selectCategoria = document.getElementById("select-categoria");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");
const tituloLista = document.getElementById("titulo-lista");
const btnNovaLista = document.getElementById("btn-nova-lista");
const navHome = document.getElementById("nav-home");
const navListas = document.getElementById("nav-listas");
const homeSection = document.getElementById("home-section");
const listasSection = document.getElementById("listas-section");
const btnVoltarListas = document.getElementById("btn-voltar-listas");
const btnSearch = document.getElementById("btn-search");
const inputSearch = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const btnClearSearch = document.getElementById("btn-clear-search");

function showSection(section) {
  // esconde todas
  homeSection.classList.add("hidden");
  listasSection.classList.add("hidden");
  itensSection.classList.add("hidden");

  // mostra a desejada
  section.classList.remove("hidden");

  // atualiza destaque no menu
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
}

// Home
navHome.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(homeSection);
  navHome.classList.add("active");
});

// Minhas Listas
navListas.addEventListener("click", (e) => {
  e.preventDefault();
  renderListas();
  showSection(listasSection);
  navListas.classList.add("active");
});

// botão voltar lista
btnVoltarListas.addEventListener("click", () => {
  showSection(listasSection);
  navListas.classList.add("active");
});

// salvar localStorage
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(listas));

const showToast = (msg, timeout = 2500) => {
  toastMsg.textContent = msg;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), timeout);
};

// abre/fecha painel config
btnConfig.addEventListener("click", () => {
  configPanel.classList.toggle("hidden");
});
btnVoltar.addEventListener("click", () => {
  configPanel.classList.add("hidden");
});

// botão "+ Nova Lista" abre painel
btnNovaLista.addEventListener("click", () => {
  configPanel.classList.remove("hidden");
});

// ações ao escolher o tipo da lista
document.querySelectorAll(".opcao").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tipo = btn.dataset.tipo;

    // se já existe uma lista desse tipo, não cria outra
    if (listas.some((l) => l.tipo === tipo)) {
      showToast(`A lista de ${btn.textContent} já foi criada!`);
      configPanel.classList.add("hidden");
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
      },
    };

    listas.push(novaLista);
    save();
    renderListas();
    configPanel.classList.add("hidden");

    // mostra Minhas Listas
    showSection(listasSection);
    navListas.classList.add("active");

    showToast(`Lista de ${btn.textContent} criada!`);
  });
});

// renderizar todas listas
function renderListas() {
  listasContainer.innerHTML = "";
  if (listas.length === 0) {
    listasContainer.innerHTML = "<p>Nenhuma lista criada ainda.</p>";
    return;
  }
  listas.forEach((lista) => {
    const div = document.createElement("div");
    div.className = `lista-card card-${lista.tipo}`;

    const nome = document.createElement("span");
    nome.textContent = `Lista de ${lista.tipo}`;

    const btnDelete = document.createElement("button");
    btnDelete.className = "icon-btn";
    btnDelete.innerHTML = `<img src="assets/delete.png" alt="Excluir lista">`;
    btnDelete.addEventListener("click", (e) => {
      e.stopPropagation(); // impede abrir a lista
      listas = listas.filter((l) => l.id !== lista.id);
      save();
      renderListas();
      showToast(`Lista de ${lista.tipo} excluída!`);
    });

    div.appendChild(nome);
    div.appendChild(btnDelete);

    div.addEventListener("click", () => abrirLista(lista.id));
    listasContainer.appendChild(div);
  });
}

// abrir lista específica
function abrirLista(id) {
  listaAtiva = listas.find((l) => l.id === id);
  if (!listaAtiva) return;
  tituloLista.textContent = `Itens da Lista (${listaAtiva.tipo})`;
  renderCategorias();
  itensSection.classList.remove("hidden");
  document.getElementById("listas-section").classList.add("hidden");
  document.getElementById("home-section").classList.add("hidden");

  // se veio da pesquisa → destacar item
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

// renderizar categorias + itens
function renderCategorias() {
  categoriasContainer.innerHTML = "";
  Object.keys(listaAtiva.categorias).forEach((cat) => {
    const ul = document.createElement("ul");
    ul.className = "lista";
    ul.innerHTML = `<h3 class="inter-semibold">${cat}</h3>`;
    listaAtiva.categorias[cat].forEach((item) => {
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
    categoriasContainer.appendChild(ul);
  });
}

// adicionar item
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!listaAtiva) return;

  const text = inputItem.value.trim();
  const cat = selectCategoria.value;
  if (!text) return;

  const listaItens = listaAtiva.categorias[cat];
  if (listaItens.length >= 10) {
    showToast("Cada categoria só pode ter até 10 itens.");
    return;
  }
  const totalItens = Object.values(listaAtiva.categorias).flat().length;
  if (totalItens >= 50) {
    showToast("Cada lista só pode ter até 50 itens.");
    return;
  }

  listaItens.push({ id: Date.now(), text, done: false });
  save();
  renderCategorias();
  inputItem.value = "";
});

// delegação de eventos (checkbox + delete)
categoriasContainer.addEventListener("click", (e) => {
  if (e.target.matches("input[type=checkbox]")) {
    const cat = e.target.dataset.cat;
    const id = Number(e.target.dataset.id);
    const item = listaAtiva.categorias[cat].find((i) => i.id === id);
    if (item) {
      item.done = e.target.checked;
      save();
    }
  }
  if (e.target.closest("[data-action=delete]")) {
    const btn = e.target.closest("button");
    const cat = btn.dataset.cat;
    const id = Number(btn.dataset.id);
    listaAtiva.categorias[cat] = listaAtiva.categorias[cat].filter(
      (i) => i.id !== id
    );
    save();
    renderCategorias();
  }
});

// ================== PESQUISA GLOBAL ==================

function pesquisar() {
  const termo = inputSearch.value.trim().toLowerCase();
  searchResults.innerHTML = ""; // limpa resultados

  if (!termo) {
    searchResults.innerHTML = "<p>Digite um termo para pesquisar.</p>";
    return;
  }

  let encontrados = [];

  listas.forEach((lista) => {
    let itensEncontrados = [];
    Object.values(lista.categorias).forEach((categoria) => {
      categoria.forEach((item) => {
        if (item.text.toLowerCase().includes(termo)) {
          itensEncontrados.push(item);
        }
      });
    });

    if (itensEncontrados.length > 0) {
      encontrados.push({ lista, itens: itensEncontrados });
    }
  });

  if (encontrados.length === 0) {
    searchResults.innerHTML = `<p class="nenhum">Item não encontrado.</p>`;
  } else {
    encontrados.forEach((resultado) => {
      const div = document.createElement("div");
      div.className = `lista-card card-${resultado.lista.tipo} resultado-card`;
      div.dataset.id = resultado.lista.id;

      div.innerHTML = `
        <span>Lista de ${resultado.lista.tipo}</span>
        <button class="icon-btn limpar-resultado" title="Remover resultado">
          <img src="assets/delete-small.png" alt="Limpar">
        </button>
      `;
      searchResults.appendChild(div);
    });
  }

  // limpa campo
  inputSearch.value = "";
}

// botão pesquisar
btnSearch.addEventListener("click", pesquisar);

// enter no campo
inputSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    pesquisar();
  }
});

// clique no resultado → abre lista correspondente ou remove resultado
searchResults.addEventListener("click", (e) => {
  // abrir lista ao clicar no card (mas não no botão de excluir)
  if (
    e.target.closest(".resultado-card") &&
    !e.target.closest(".limpar-resultado")
  ) {
    const listaId = Number(e.target.closest(".resultado-card").dataset.id);
    abrirLista(listaId);
  }

  // clique no ícone de deletar → remove apenas esse resultado
  if (e.target.closest(".limpar-resultado")) {
    e.target.closest(".resultado-card").remove();

    // se não restar mais nenhum card, limpa completamente a área de resultados
    if (!searchResults.querySelector(".resultado-card")) {
      searchResults.innerHTML = "";
    }
  }
});

// ================== UTILS ==================
function escapeHtml(str) {
  return String(str).replace(
    /[&"'<>]/g,
    (tag) =>
      ({
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#39;",
        "<": "&lt;",
        ">": "&gt;",
      }[tag])
  );
}

// inicializar
renderListas();
