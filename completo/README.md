# Enjoy Padel · Super 8 completo

Aplicativo completo: jogadores (8, 10, 12, 14 ou 16), sorteio de duplas, resultados, ranking, probabilidade de título e histórico por categoria.

**Usar o aplicativo:** https://super8-padel-diogo.diogosavoldi2.chatgpt.site/

## Em mais de um celular

Abra o mesmo link em cada aparelho. Os jogos são guardados em um banco D1 online. A lista e os placares são atualizados a cada oito segundos e ao voltar para a aba.

Para criar disputas, substituir jogadores ou salvar resultados, clique em **Entrar como administrador** e use a mesma conta do ChatGPT que criou o site. Visitantes podem consultar os jogos e rankings. O e-mail autorizado fica no ambiente do servidor, não no código público.

No aparelho que contém jogos antigos, entre como administrador e escolha **Importar jogos deste aparelho**. Só disputas que ainda não existem no banco são importadas; os dados locais são preservados. Cada navegador precisa importar seu próprio histórico.

Salvar exige conexão. Se o banco estiver indisponível, o app avisa e mantém a edição na tela. Não feche a página antes de salvar. Se outro aparelho já atualizou a disputa, uma gravação antiga é recusada para evitar perda de resultados.

## Código e hospedagem

O GitHub guarda o código. O aplicativo e o banco rodam no endereço acima, hospedados por Sites. GitHub Pages sozinho não executa o servidor D1.

- `public/`: interface e arquivos originais do clube.
- `worker/`: API, autorização e acesso ao banco.
- `db/schema.ts` e `drizzle/`: esquema e migração do banco.
- `scripts/build.mjs`: empacota a interface no Worker.
- `.openai/hosting.json`: identidade do Site e vínculo lógico `DB`.

A rota `rapido.html` do aplicativo original mantém seu armazenamento local; a sincronização online desta atualização cobre o Super 8 completo. A versão rápida anterior com Firebase, que já existia no GitHub, foi preservada na raiz do repositório.

## Desenvolvimento

```sh
npm ci
npm test
npm run build
```

Configure `ADMIN_EMAILS` no ambiente de hospedagem com o e-mail da conta ChatGPT administradora. O servidor confia nos cabeçalhos de identidade verificados pelo dispatcher de Sites; outro provedor precisa de uma integração de autenticação equivalente. Não exponha esse Worker diretamente em outro provedor sem substituir essa validação.

Migrações devem ser aplicadas antes do servidor. Novas alterações de esquema: `npm run db:generate`. Migrações já aplicadas não devem ser editadas.
