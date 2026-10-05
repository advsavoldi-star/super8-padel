# Aplicativos Super 8 · Enjoy Padel

## Super 8 completo com banco online

**Acesse:** https://super8-padel-diogo.diogosavoldi2.chatgpt.site/

Código completo e instruções: [completo/README.md](completo/README.md). Essa versão mantém jogadores, disputas, resultados e rankings em um banco online. Abra o mesmo link em todos os celulares. Para salvar, entre com a conta ChatGPT administradora. Jogos antigos deste aparelho podem ser importados pelo botão no aplicativo.

O GitHub guarda o código; o aplicativo completo e seu banco estão hospedados no link acima. A versão rápida com Firebase que já existia neste repositório foi preservada abaixo e nos arquivos da raiz.

---

# Super 8 Padel

App de celular para controlar um Super 8 de padel: chaveamento com os 14 jogos, lançamento de resultados (Salvar, Editar, Resetar) e ranking ao vivo com chance de título.

O app fica hospedado no **GitHub Pages**. Os resultados ficam no **Firebase Realtime Database** (gratuito), então qualquer celular com o link vê e atualiza o mesmo placar na hora. Se a internet cair, o resultado é guardado no celular e enviado quando a conexão voltar.

---

## 1. Criar o banco no Firebase (uns 5 minutos)

1. Acesse <https://console.firebase.google.com> com sua conta Google e clique em **Criar projeto** (pode chamar de `super8-padel`). O Google Analytics pode ficar desativado.
2. No menu da esquerda: **Criação › Realtime Database › Criar banco de dados**.
   - Local: **Estados Unidos (us-central1)** ou o mais próximo disponível.
   - Modo: escolha **modo bloqueado**. As regras certas entram no item seguinte.
3. Na aba **Regras**, apague tudo, cole o conteúdo do arquivo [`database.rules.json`](database.rules.json) e clique em **Publicar**.

## 2. Pegar a configuração do app

1. No Firebase, clique na engrenagem ⚙️ › **Configurações do projeto**.
2. Em **Seus apps**, clique no ícone **`</>`** (Web), dê um nome (ex.: `super8`) e clique em **Registrar app**. Não precisa ativar o Hosting.
3. Vai aparecer um bloco `const firebaseConfig = { ... }`. Copie os valores para o arquivo [`firebase-config.js`](firebase-config.js), substituindo cada `COLE_AQUI`.
   - Confira se o `databaseURL` apareceu. Se não aparecer, copie a URL que aparece no topo da tela do Realtime Database (algo como `https://super8-padel-default-rtdb.firebaseio.com`).

## 3. Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (ex.: `super8-padel`). Pode ser público.
2. Clique em **Add file › Upload files**, arraste **todos os arquivos desta pasta** (incluindo `.nojekyll`) e clique em **Commit changes**.
3. Vá em **Settings › Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `(root)` › **Save**
4. Depois de 1 ou 2 minutos, o link aparece no topo da página: `https://SEU-USUARIO.github.io/super8-padel/`.

## 4. Usar no celular

- Abra o link e lance um resultado de teste. Depois abra em outro celular e confira se aparece. Use **Resetar** para apagar o teste.
- No topo aparece **Ao vivo** quando está conectado ao Firebase. **Só neste aparelho** significa que o `firebase-config.js` ainda não foi preenchido.
- Para ficar com cara de aplicativo, use **Adicionar à tela inicial** (iPhone: botão Compartilhar no Safari; Android: menu ⋮ no Chrome).

---

## Segurança

Qualquer pessoa com o link pode lançar e apagar resultados. As regras do banco só aceitam os jogos `m01` a `m14` e placares válidos (3×0, 2×1, 1×2, 0×3), e todo o resto do banco fica bloqueado. Para um Super 8 entre amigos isso costuma bastar. Se precisar restringir quem lança resultados, dá para adicionar login com Google e liberar só alguns e-mails.

## Alterar jogadores ou horários

Edite o `index.html` direto no GitHub (ícone de lápis), nas listas `PLAYERS` e `MATCHES` no começo do `<script>`. Mantenha 14 jogos com ids `m01`–`m14` ou ajuste também a regra em `database.rules.json`.

## Novo Super 8

Use **Zerar todos os resultados**, no rodapé do app.

## Arquivos

| Arquivo | Para quê |
|---|---|
| `index.html` | O app (chaveamento + ranking) |
| `firebase-config.js` | Configuração do seu projeto Firebase |
| `database.rules.json` | Regras para colar no Realtime Database |
| `manifest.json`, `icon.svg` | Ícone e "Adicionar à tela inicial" |
| `.nojekyll` | Faz o GitHub Pages publicar os arquivos como estão |
