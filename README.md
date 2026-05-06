# Bank Robbery Slot

Slot em **Pixi.js** com **Vite** (JavaScript).

## Requisitos

- [Node.js](https://nodejs.org/) **18** ou superior (recomendado **20 LTS**)
- npm (vem com o Node)

## Como rodar em desenvolvimento

Na raiz do repositório:

```bash
npm install
npm run dev
```

Abra no navegador o endereço que o Vite mostrar (geralmente **http://localhost:5173**).

## Build de produção

```bash
npm run build
```

Saída em `dist/`. Para testar o build localmente:

```bash
npm run preview
```

## Assets (`public/assets`)

O jogo carrega PNGs e sequências a partir de **`public/assets`** (veja `src/AssetManifest.js`).

- **Não use symlink** apontando para pastas fora do repo (isso quebra CI e deploy, por exemplo na Vercel). Os arquivos precisam estar **dentro do projeto** e versionados no Git, ou servidos por outra URL/CDN se você mudar o manifest.
- Na Vercel/CI, o script `prebuild` remove symlink inválido antes do `vite build`; sem os arquivos reais no repositório o build pode passar, mas as artes não carregam.

## Scripts

| Comando        | Descrição                          |
|----------------|------------------------------------|
| `npm run dev`  | Servidor de desenvolvimento (Vite) |
| `npm run build`| Build para produção (`dist/`)      |
| `npm run preview` | Servidor estático do `dist/`   |
