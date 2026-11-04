# Saúde Digital - Backend (UBS)

API do sistema de filas e consultas de uma UBS. Feita com NestJS, TypeORM e PostgreSQL.

- Documentação interativa (Swagger): `/docs`
- Publicado no Render: https://ubs-backend-90zn.onrender.com

## Como rodar

```bash
npm install
cp .env.example .env   # preencha com os dados do seu banco
npm run build
npm run start:prod
```

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `DB_HOST` | Host do PostgreSQL (somente o host) |
| `DB_PORT` | Porta (5432) |
| `DB_USERNAME` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_DATABASE` | Nome do banco |
| `JWT_SECRET` | Chave usada para assinar os tokens de login |

O arquivo `.env` não vai para o repositório.

## Banco de dados

O projeto usa `synchronize: false`. As estruturas criadas à mão estão em `sql/`:

1. `sql/01-estrutura.sql`: colunas e tabelas adicionadas
2. `sql/02-dados-teste.sql`: dados fictícios para demonstração

## Rotas

### Fila
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/fila/profissionais` | Profissionais (abas da tela) |
| GET | `/fila?profissionalId=&busca=` | Fila com posição, por profissional |
| GET | `/fila/:id` | Busca um atendimento |
| POST | `/fila` | Coloca paciente na fila (`pacienteId`, `senha`, `profissionalId`) |
| PATCH | `/fila/:id/status` | Atualiza o status |
| PATCH | `/fila/:id/remover` | Remove o paciente da fila |

### Solicitações de saída
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/solicitacoes-saida?profissionalId=` | Solicitações pendentes |
| GET | `/solicitacoes-saida/total` | Quantidade de pendentes |
| POST | `/solicitacoes-saida` | Cria solicitação (`atendimentoId`) |
| PATCH | `/solicitacoes-saida/:id/aceitar` | Aceita e tira o paciente da fila |

### Consultas
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/consultas?profissionalId=&data=AAAA-MM-DD` | Consultas do dia (padrão: hoje) |
| POST | `/consultas` | Cadastra consulta (`pacienteId`, `profissionalId`) |

### Login e perfil
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/auth/login` | Login (`email`, `senha`), devolve o token |
| GET | `/auth/me` | Meu perfil (exige token) |
| PATCH | `/auth/me` | Edita nome, e-mail, telefone e nome social |
| PATCH | `/auth/senha` | Troca a senha (`senhaAtual`, `novaSenha`) |

As rotas de `/auth/me` e `/auth/senha` usam o header `Authorization: Bearer <token>`.
