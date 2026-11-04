-- Estruturas criadas manualmente no banco (synchronize = false).
-- As tabelas base (pacientes, profissionais, atendimentos, triagens) já existiam.

-- Liga o atendimento ao profissional (fila por profissional)
ALTER TABLE atendimentos
  ADD COLUMN IF NOT EXISTS profissional_id integer NULL REFERENCES profissionais(id);

-- Solicitações de saída da fila
CREATE TABLE IF NOT EXISTS solicitacoes_saida (
  id SERIAL PRIMARY KEY,
  atendimento_id integer NOT NULL REFERENCES atendimentos(id),
  status varchar(20) NOT NULL DEFAULT 'PENDENTE',
  data_hora_solicitacao timestamp NOT NULL DEFAULT now()
);

-- Usuários do sistema (atendentes)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome varchar(150) NOT NULL,
  email varchar(150) NOT NULL UNIQUE,
  senha_hash varchar(100) NOT NULL,
  cpf varchar(20),
  data_nascimento date,
  telefone varchar(20),
  nome_social varchar(100),
  matricula varchar(30) NOT NULL,
  funcao varchar(50) NOT NULL,
  setor varchar(50) NOT NULL,
  unidade varchar(100) NOT NULL
);
