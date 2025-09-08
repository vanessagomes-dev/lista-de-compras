# 🛒 Lista de Compras  

![GitHub repo size](https://img.shields.io/github/repo-size/vanessagomes-dev/lista-de-compras?style=flat-square)  
![GitHub last commit](https://img.shields.io/github/last-commit/vanessagomes-dev/lista-de-compras?style=flat-square)  
![GitHub issues](https://img.shields.io/github/issues/vanessagomes-dev/lista-de-compras?style=flat-square)  
![GitHub stars](https://img.shields.io/github/stars/vanessagomes-dev/lista-de-compras?style=flat-square)  

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)  
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)  
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)  
![LocalStorage](https://img.shields.io/badge/LocalStorage-FF6F00?style=for-the-badge&logo=googlechrome&logoColor=white)  

Aplicação web simples e intuitiva para gerenciar listas de compras do dia, semana, quinzena ou mês.  
Permite criar listas personalizadas, adicionar itens por categorias, aplicar cores, papéis de parede e compartilhar com facilidade.  

---

## 📸 Screenshots  

### Tela inicial  
<img src="assets/screenshots/home.png" width="600">  

### Modal de criação de lista  
<img src="assets/screenshots/modal.png" width="600">  

### Exemplo de lista criada  
<img src="assets/screenshots/lista.png" width="600">  
 
---

## 🚀 Funcionalidades  

- 📌 **Gerenciamento de listas** (Dia, Semana, Quinzena e Mês).  
- 🎨 **Personalização** de cores e papéis de parede.  
- 🌍 **Idiomas**: Português 🇧🇷 | Espanhol 🇪🇸 | Inglês 🇺🇸  
- 📤 **Compartilhamento** via Web Share API ou área de transferência.  
- 🔍 **Pesquisa global** em todas as listas.  
- ✅ **Interface acessível e responsiva**.  

---

## 🐞 Principais bugs corrigidos  

- **Logo muito pequena** → aumentada para melhor destaque.  
- **Ícone de compartilhar quebrando layout** → corrigido tamanho/alinhamento.  
- **Listas não abriam ao clicar** → corrigido conflito de eventos.  
- **Tradução incompleta** → ajustado `applyTranslationsToUI` e `modal-title`.  
- **Troca de idioma não funcionava** → corrigido handler dos botões `.lang-option`.  
- **Ícones desalinhados nas listas** → corrigido com `flexbox`.  
- **Hover sem estilo** → adicionado efeito de sombra colorida.  
- **Toast com botão X desalinhado** → removido e melhorado UX.  

---

## 📂 Estrutura de Arquivos  

```bash
/
├── index.html       # Estrutura principal da aplicação
├── styles.css       # Estilos e temas
├── main.js          # Lógica da aplicação (listas, eventos, i18n, etc.)
├── locales/         # Arquivos de tradução
│   ├── pt.json
│   ├── en.json
│   └── es.json
└── assets/          # Ícones, imagens e planos de fundo

````

---

## ⚙️ Tecnologias  

- **HTML5**  
- **CSS3**  
- **JavaScript Vanilla (ES6+)**  
- **LocalStorage**  

---

## 📥 Como usar  

1. Clone o repositório:
   

   ```
   git clone https://github.com/vanessagomes-dev/lista-de-compras.git
   cd lista-de-compras

3. Abra o arquivo index.html no navegador.

4. Crie sua primeira lista clicando em "Iniciar nova lista".

📌 Roadmap (melhorias futuras)

 Exportar listas em PDF/CSV.

 Adicionar suporte para login/contas.

 Sincronizar listas em tempo real (Firebase/Supabase).
