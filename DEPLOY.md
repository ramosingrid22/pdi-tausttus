# Deploy no Dokploy — tausttus.tech/pdi

## 1. Banco de dados
No Dokploy, crie um serviço **PostgreSQL**. Anote a connection string no formato:
```
postgresql://usuario:senha@host:5432/pdi_tausttus
```

## 2. Criar o app
- Tipo: **Application**
- Fonte: Git (ou upload do zip)
- Build: **Dockerfile**

## 3. Variáveis de ambiente
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>
NEXTAUTH_URL=https://tausttus.tech/pdi
```

## 4. Domínio
- Adicione o domínio `tausttus.tech`
- Path prefix: `/pdi`
- HTTPS: ativo

## 5. Primeiro deploy
Após subir, rode no terminal do container:
```bash
npx prisma db push
```

## 6. Criar o primeiro usuário admin
Conecte no banco e rode:
```sql
INSERT INTO "User" (id, name, username, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Admin',
  'admin',
  -- senha: tausttus2026 (bcrypt hash)
  '$2a$10$HASH_GERADO_ABAIXO',
  'ADMIN',
  NOW(), NOW()
);
```

Para gerar o hash da senha, rode localmente:
```bash
node -e "const b=require('bcryptjs');console.log(b.hashSync('SUA_SENHA',10))"
```

## 7. Criar colaboradores
```sql
INSERT INTO "User" (id, name, username, password, role, cargo, unidade, "liderId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Nome do Colaborador',
  'nome.sobrenome',
  '$2a$10$HASH',
  'COLABORADOR',
  'Atendente',
  'Unidade Centro',
  'ID_DO_LIDER',
  NOW(), NOW()
);
```

## Cargos disponíveis
- Atendente
- Auxiliar de Cozinha
- Cozinheiro(a)
- Delivery
- Líder
- Supervisor(a)
- Analista Administrativo
- Auxiliar Administrativo
