# Dashboard de restaurante

Por enquanto este template tem:

- Uma tela para ver os pedidos
- Uma tela para ver os itens do menu
- Uma tela para cadastrar itens do menu

## Como rodar o projeto

### Pré requisitos
- Ter o [NodeJS](https://nodejs.org/en/download) instalado

Antes de rodar o projeto crie um arquivo `.env` na raíz da pasta `Frontend` com as seguintes variáveis

```
VITE_API_BASE_URL=
VITE_FIREBASE_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_SENDER_ID=
```

Depois de preencher as variáveis, basta abrir um terminal na pasta `Frontend` e rodar o seguinte comando

```bash
npm install
```
_(você só precisa fazer na primeira vez que rodar o projeto)_

Depois de instalar as dependências, pode rodar iniciar o projeto com
```bash
npm run dev
```