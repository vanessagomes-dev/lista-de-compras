const form = document.getElementById('form-adicionar');
const inputItem = document.getElementById('input-item');
const listaEl = document.getElementById('lista-itens');
const toast = document.getElementById('toast');
const btnConfig = document.getElementById('btn-config');
const configPanel = document.getElementById('config-panel');
const btnVoltar = configPanel.querySelector('.btn-voltar');


const STORAGE_KEY = 'listaCompras_v1';
let itens = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');


// Utils
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
const showToast = (msg, timeout = 3000) => {
toast.textContent = msg;
toast.hidden = false;
setTimeout(() => { toast.hidden = true; }, timeout);
};

// abre/fecha painel
btnConfig.addEventListener('click', () => {
  configPanel.classList.toggle('hidden');
});

// voltar
btnVoltar.addEventListener('click', () => {
  configPanel.classList.add('hidden');
});

// ações ao clicar nas listas
document.querySelectorAll('.opcao').forEach(btn => {
  btn.addEventListener('click', () => {
    showToast(`Você selecionou: ${btn.textContent}`);
    configPanel.classList.add('hidden');
  });
});
// Render
function render(){
listaEl.innerHTML = '';
if(itens.length === 0){
const li = document.createElement('li');
li.className = 'item';
li.innerHTML = `<div class="item-title">Nenhum item na lista</div>`;
listaEl.appendChild(li);
return;
}


itens.forEach(item => {
const li = document.createElement('li');
li.className = 'item';
li.dataset.id = item.id;


li.innerHTML = `
<div class="item-left">
<input type="checkbox" aria-label="Marcar ${escapeHtml(item.text)} como comprado" ${item.done ? 'checked' : ''} data-action="toggle">
<div class="item-title">${escapeHtml(item.text)}</div>
</div>
<div class="item-controls">
<button class="icon-btn" data-action="delete" aria-label="Remover ${escapeHtml(item.text)}">
<svg class="icon-trash" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M3 6h18" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 11v6" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 11v6" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</button>
</div>
`;


listaEl.appendChild(li);
});
}


// Sanitização mínima
function escapeHtml(str){
return String(str).replace(/[&"'<>]/g, tag => ({
'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'
})[tag]);
}


// Eventos
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = inputItem.value.trim();
  if(!text){
    render();
    return;
  }

  const novoItem = {
    id: Date.now(),
    text,
    done: false
  };

  itens.push(novoItem);
  save();
  render();
  inputItem.value = '';
  showToast('Item adicionado com sucesso!');
});

