## Problema

No `supabase-migration.sql`, a política `Profiles: read own + linked trainer` (linhas 41-48) referencia `public.clients`, mas a tabela `clients` só é criada na linha 83. O Postgres valida a referência no momento de criar a policy, por isso rebenta com:

```
ERROR: 42P01: relation "public.clients" does not exist
```

(Isto não dava erro no projeto Supabase antigo porque as tabelas já existiam de execuções anteriores.)

## Correção

Editar `supabase-migration.sql` para que a policy de `profiles` que depende de `clients` seja criada **depois** de `clients` existir.

Abordagem mais simples e segura: mover apenas o bloco da policy `Profiles: read own + linked trainer` (e o `drop policy if exists` correspondente) para **depois** do bloco que cria a tabela `public.clients` e ativa o RLS.

Resultado da nova ordem na secção 2/4:

```text
2) profiles            -> create table + enable RLS + policy "update own"
3) user_roles          -> create table + RLS + has_role()
4) clients             -> create table + indexes + enable RLS + policies
   >>> aqui criar a policy "Profiles: read own + linked trainer"
5) sessions
6) invites
7) trigger handle_new_user
```

Nada mais muda — schema final é idêntico, só a ordem de criação das policies é que fica válida.

## Próximos passos para o utilizador

1. Aplico a alteração ao `supabase-migration.sql`.
2. No SQL Editor do Supabase: corres **de novo** o `supabase-migration.sql` inteiro (é idempotente — `create table if not exists`, `drop policy if exists` — por isso é seguro repetir).
3. Depois corres por ordem: `phase2`, `phase3`, `storage`, `security-fixes`.
4. Avisas-me se algum deles der erro.
