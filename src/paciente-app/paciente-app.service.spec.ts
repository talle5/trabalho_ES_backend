import { describe, expect, it, vi } from 'vitest';
import { compare, hash } from 'bcryptjs';

import { PacienteAppService } from './paciente-app.service.js';

async function criarServico() {
  const paciente = {
    id: 10,
    nome: 'João da Silva',
    identificador: '111.456.789-22',
    email: 'joao.silva@email.com',
    telefone: '(88) 99999-1234',
    dataNascimento: '1985-05-15',
    endereco: 'Rua José de Alencar, 245, Centro, Quixadá – CE',
    senhaHash: await hash('15051985', 4),
  };
  const consulta = {
    addSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    getOne: vi.fn().mockResolvedValue(paciente),
  };
  const pacienteRepository = {
    createQueryBuilder: vi.fn(() => consulta),
    findOne: vi.fn(),
    save: vi.fn(async (dados: unknown) => dados),
  };
  const jwtService = { signAsync: vi.fn().mockResolvedValue('token-falso') };

  const service = new PacienteAppService(
    pacienteRepository as never,
    jwtService as never,
  );

  return { service, paciente, consulta, pacienteRepository, jwtService };
}

describe('PacienteAppService', () => {
  it('faz login com o CPF digitado sem pontuação', async () => {
    const { service, consulta, jwtService } = await criarServico();

    const resultado = await service.login('11145678922', '15051985');

    expect(consulta.where).toHaveBeenCalledWith(
      expect.stringContaining('regexp_replace'),
      { cpf: '11145678922' },
    );
    expect(resultado.accessToken).toBe('token-falso');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 10,
      tipo: 'paciente',
    });
  });

  it('faz login com o CPF pontuado', async () => {
    const { service, consulta } = await criarServico();

    await service.login('111.456.789-22', '15051985');

    expect(consulta.where).toHaveBeenCalledWith(
      expect.stringContaining('regexp_replace'),
      { cpf: '11145678922' },
    );
  });

  it('faz login com o e-mail em qualquer caixa', async () => {
    const { service, consulta } = await criarServico();

    await service.login('  JOAO.SILVA@EMAIL.COM ', '15051985');

    expect(consulta.where).toHaveBeenCalledWith('paciente.email = :email', {
      email: 'joao.silva@email.com',
    });
  });

  it('a resposta do login mascara o CPF e não traz o hash', async () => {
    const { service } = await criarServico();

    const resultado = await service.login('11145678922', '15051985');

    expect(resultado.paciente.cpf).toBe('***.456.789-**');
    expect(resultado.paciente).not.toHaveProperty('senhaHash');
  });

  it('recusa senha errada', async () => {
    const { service } = await criarServico();

    await expect(service.login('11145678922', 'errada')).rejects.toThrow(
      'CPF/e-mail ou senha inválidos',
    );
  });

  it('recusa paciente inexistente', async () => {
    const { service, consulta } = await criarServico();
    consulta.getOne.mockResolvedValue(null);

    await expect(service.login('11145678922', '15051985')).rejects.toThrow(
      'CPF/e-mail ou senha inválidos',
    );
  });

  it('recusa paciente que ainda não tem senha cadastrada', async () => {
    const { service, consulta, paciente } = await criarServico();
    consulta.getOne.mockResolvedValue({ ...paciente, senhaHash: null });

    await expect(service.login('11145678922', '15051985')).rejects.toThrow(
      'CPF/e-mail ou senha inválidos',
    );
  });

  it('recusa login vazio sem consultar o banco', async () => {
    const { service, pacienteRepository } = await criarServico();

    await expect(service.login('', 'qualquer')).rejects.toThrow(
      'CPF/e-mail ou senha inválidos',
    );
    expect(pacienteRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('o perfil traz os dados do cadastro com o CPF mascarado', async () => {
    const { service, paciente, pacienteRepository } = await criarServico();
    pacienteRepository.findOne.mockResolvedValue(paciente);

    const resultado = await service.perfil(10);

    expect(resultado).toMatchObject({
      nome: 'João da Silva',
      cpf: '***.456.789-**',
      dataNascimento: '1985-05-15',
      email: 'joao.silva@email.com',
    });
  });

  it('o perfil de um paciente inexistente lança NotFound', async () => {
    const { service, pacienteRepository } = await criarServico();
    pacienteRepository.findOne.mockResolvedValue(null);

    await expect(service.perfil(99)).rejects.toThrow('Paciente não encontrado');
  });

  it('redefinir a senha exige pelo menos 6 caracteres', async () => {
    const { service, paciente, pacienteRepository } = await criarServico();
    pacienteRepository.findOne.mockResolvedValue(paciente);

    await expect(service.redefinirSenha(10, '123')).rejects.toThrow(
      'pelo menos 6 caracteres',
    );
  });

  it('redefinir a senha guarda só o hash da nova senha', async () => {
    const { service, paciente, pacienteRepository } = await criarServico();
    pacienteRepository.findOne.mockResolvedValue(paciente);

    await service.redefinirSenha(10, 'NovaSenha1');

    expect(await compare('NovaSenha1', paciente.senhaHash)).toBe(true);
    expect(paciente.senhaHash).not.toBe('NovaSenha1');
  });
});
