-- Dados fictícios para demonstração. Rodar uma única vez.

INSERT INTO profissionais (nome, cargo) VALUES
  ('Dr. Ricardo Mendes', 'Clínico Geral'),
  ('Dra. Luiza Freitas', 'Dentista'),
  ('Dr. Pedro Henrique', 'Cardiologista'),
  ('Dra. Juliana Silva', 'Nutricionista');

INSERT INTO pacientes (nome, identificador) VALUES
  ('Sabrina Oliveira', '111.111.111-01'),
  ('Antônio Carlos', '111.111.111-02'),
  ('Ricardo Felipe', '111.111.111-03'),
  ('Karla Santos de Oliveira', '111.111.111-04'),
  ('Maria Helena Marques', '111.111.111-05'),
  ('Maria do Socorro', '123.456.789-00'),
  ('Ana Souza Matias', '987.654.321-11'),
  ('Roberto Oliveira', '444.222.111-99')
ON CONFLICT DO NOTHING;

-- Troque SENHA_DE_TESTE pela senha que você quiser antes de rodar.
INSERT INTO usuarios
  (nome, email, senha_hash, cpf, data_nascimento, telefone, nome_social, matricula, funcao, setor, unidade)
VALUES
  ('Mariana Costa Ferreira', 'mariana.ferreira@example.com',
   crypt('SENHA_DE_TESTE', gen_salt('bf', 10)),
   '111.222.333-00', '1992-08-14', '(11) 90000-0000', 'Mariana',
   'ATD-0042', 'Atendente', 'Recepção', 'UBS CENTRO');
