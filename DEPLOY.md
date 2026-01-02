Deploy & Armazenamento Remoto 🔧

- Para que os dados sejam salvos no site e acessíveis de qualquer plataforma, recomendamos o deploy no Vercel com Vercel Postgres.
- Crie um banco de dados Postgres no Vercel e verifique as variáveis de ambiente (por exemplo, `DATABASE_URL`) para acesso ao banco.
- Após o deploy, execute a rota de setup para criar as tabelas: abra `https://<seu-site>/api/setup` no navegador (ou faça `curl https://<seu-site>/api/setup`).
- O endpoint `/api/state` armazena/recupera o estado completo da aplicação em JSON (mantido por compatibilidade).
- Novos endpoints REST foram adicionados: `/api/athletes` e `/api/assessments` para um modelo normalizado e sincronização por plataforma.

Dica: teste localmente com `npm run dev`, depois faça o deploy para o Vercel e acesse a rota `/api/setup` uma vez para criar as tabelas no banco.

Variáveis de ambiente necessárias:

- `DATABASE_URL` (Vercel Postgres)
- `API_KEY` (opcional, recomendado) — chave secreta para proteger endpoints de escrita (compatibilidade server-to-server)
- `VITE_API_KEY` (opcional, recomendado) — chave exposta ao cliente para autorizar chamadas de gravação (defina o mesmo valor de `API_KEY` em Vercel para simplicidade)
- `JWT_SECRET` (recomendado) — segredo para assinaturas JWT (use uma chave forte). Quando configurado, o aplicativo usa autenticação baseada em tokens para login de usuários e proteção dos endpoints.

Testes locais (recomendado):

- Instale dependências: `npm install`
- Rode os testes: `npm test` (usa Vitest). Note: os testes usam mocks para o banco e cobrem fluxo básico de auth e endpoints; configure `JWT_SECRET`/`API_KEY` em `.env.local` para testar fluxos com autenticação real.

Exemplos rápidos com curl (usando a chave):

- GET atletas:
```
curl -s -H "x-api-key: <SUA_CHAVE>" https://<seu-site>/api/athletes | jq
```

- POST atletas:
```
curl -X POST -H "x-api-key: <SUA_CHAVE>" https://<seu-site>/api/athletes -H "Content-Type: application/json" -d '{"athletes":[{"id":"1","name":"Teste"}]}'
```

Testes rápidos com curl:

- Verificar estado atual (GET):
```
curl -s https://<seu-site>/api/state | jq
```

- Salvar estado (POST):
```
curl -X POST https://<seu-site>/api/state -H "Content-Type: application/json" -d '{"athletes": [{"id":"1","name":"Teste"}]}'
```

Após salvar, re-execute o GET para confirmar que os dados foram persistidos.

Exemplo de `.env.local` local (use uma chave forte e idêntica para `API_KEY` e `VITE_API_KEY`):

```
GEMINI_API_KEY=PLACEHOLDER_API_KEY
API_KEY=REPLACE_ME_SECRET
VITE_API_KEY=REPLACE_ME_SECRET
```

No Vercel: defina `API_KEY` e `VITE_API_KEY` com o mesmo valor nas variáveis de ambiente (Settings → Environment Variables) e re-deploy o projeto.

Criando um usuário inicial (ex.: admin) via curl:

```
curl -X POST https://<seu-site>/api/auth/signup -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"sua-senha-segura","role":"admin"}'
```

Isso retorna um token JWT que pode ser usado no header `Authorization: Bearer <token>` para proteger as chamadas de escrita.

Se você vir erros ao salvar (401 Unauthorized ou mensagens de erro do servidor):

- Verifique se o token JWT foi salvo no navegador (localStorage `lb_sports_token`) após login; caso contrário, efetue login e tente novamente.
- Se estiver usando `VITE_API_KEY`/`API_KEY`, confirme que as variáveis de ambiente estão definidas no Vercel com os mesmos valores e que o build foi refeito.
- Em caso de erros 500 ou mensagens com detalhes, consulte os logs do servidor no Vercel (Dashboard → Functions → Logs) para ver o motivo específico (validação SQL ou payload inválido).
