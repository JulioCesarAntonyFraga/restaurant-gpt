# 🍽️ Dashboard de Restaurante

Este projeto é um painel administrativo desenvolvido com **React + Vite**, estilizado com **Tailwind CSS**, e utilizando **Firebase** para autenticação. Ideal para restaurantes que precisam gerenciar pedidos e itens de cardápio de forma prática e moderna.

## ✨ Funcionalidades

- 📦 Visualização e controle de pedidos
- 📝 CRUD completo de itens do cardápio
- 🔐 Autenticação com Firebase (email/senha)
- 🚪 Login e Logout de usuários
- 🎯 Rotas protegidas com base na autenticação

## 🚀 Como rodar o projeto

### ⚙️ Pré-requisitos
- [Node.js](https://nodejs.org/en/download) instalado

### 📦 Variáveis de ambiente

Antes de iniciar, crie um arquivo `.env` na raiz da pasta `Frontend` com o seguinte conteúdo:

```env
VITE_API_BASE_URL=
VITE_FIREBASE_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_SENDER_ID=
```

### 💻 Instruções

1. Abra um terminal na pasta `Frontend`
2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

---

Ficou com alguma dúvida? Sinta-se à vontade para abrir uma *issue* ou contribuir com melhorias! 💬