Deploy & Armazenamento Remoto 🔧

- Para que os dados sejam salvos no site e acessíveis de qualquer plataforma, recomendamos o deploy no Vercel com Vercel Postgres.
- Crie um banco de dados Postgres no Vercel e verifique as variáveis de ambiente (por exemplo, `DATABASE_URL`) para acesso ao banco.
- Após o deploy, execute a rota de setup para criar as tabelas: abra `https://<seu-site>/api/setup` no navegador (ou faça `curl https://<seu-site>/api/setup`).
- O endpoint `/api/state` armazena/recupera o estado completo da aplicação em JSON (mantido por compatibilidade).
- Novos endpoints REST foram adicionados: `/api/athletes` e `/api/assessments` para um modelo normalizado e sincronização por plataforma.

Dica: teste localmente com `npm run dev`, depois faça o deploy para o Vercel e acesse a rota `/api/setup` uma vez para criar as tabelas no banco.

Variáveis de ambiente necessárias:

- `DATABASE_URL` (Vercel Postgres)
- `API_KEY` (opcional, recomendado) — chave secreta para proteger endpoints de escrita
- `VITE_API_KEY` (opcional, recomendado) — chave exposta ao cliente para autorizar chamadas de gravação (defina o mesmo valor de `API_KEY` em Vercel para simplicidade)

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
