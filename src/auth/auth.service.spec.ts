import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compare, hash } from 'bcryptjs';

import { AuthService } from './auth.service.js';

async function criarServico() {
  const usuario = {
    id: 1,
    nome: 'Mariana Costa Ferreira',
    email: 'mariana.ferreira@example.com',
    senhaHash: await hash('Ubs@2026', 4),
    cpf: '111.222.333-00',
    dataNascimento: '1992-08-14',
    telefone: '(11) 90000-0000',
    nomeSocial: 'Mariana',
    matricula: 'ATD-0042',
    funcao: 'Atendente',
    setor: 'Recepção',
    unidade: 'UBS CENTRO',
  };
  const usuarioRepository = {
    findOne: vi.fn(),
    save: vi.fn(async (dados: unknown) => dados),
  };
  const jwtService = { signAsync: vi.fn().mockResolvedValue('token-falso') };

  const service = new AuthService(
    usuarioRepository as never,
    jwtService as never,
  );

  return { service, usuario, usuarioRepository, jwtService };
}

describe('AuthService (funcionário)', () => {
  let ctx: Awaited<ReturnType<typeof criarServico>>;

  beforeEach(async () => {
    ctx = await criarServico();
  });

  it('faz login e devolve o token do tipo funcionário e o perfil sem senha', async () => {
    ctx.usuarioRepository.findOne.mockResolvedValue(ctx.usuario);

    const resultado = await ctx.service.login(
      'mariana.ferreira@example.com',
      'Ubs@2026',
    );

    expect(resultado.accessToken).toBe('token-falso');
    expect(ctx.jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 1, tipo: 'funcionario' }),
    );
    expect(resultado.usuario.cpf).toBe('***.***.***-00');
    expect(resultado.usuario).not.toHaveProperty('senhaHash');
  });

  it('normaliza o e-mail antes de procurar o usuário', async () => {
    ctx.usuarioRepository.findOne.mockResolvedValue(ctx.usuario);

    await ctx.service.login('  MARIANA.FERREIRA@EXAMPLE.COM ', 'Ubs@2026');

    expect(ctx.usuarioRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'mariana.ferreira@example.com' },
    });
  });

  it('recusa usuário inexistente', async () => {
    ctx.usuarioRepository.findOne.mockResolvedValue(null);

    await expect(ctx.service.login('x@x.com', 'qualquer')).rejects.toThrow(
      'E-mail ou senha inválidos',
    );
  });

  it('recusa senha errada', async () => {
    ctx.usuarioRepository.findOne.mockResolvedValue(ctx.usuario);

    await expect(
      ctx.service.login('mariana.ferreira@example.com', 'errada'),
    ).rejects.toThrow('E-mail ou senha inválidos');
  });

  it('a troca de senha exige a senha atual correta', async () => {
    ctx.usuarioRepository.findOne.mockResolvedValue(ctx.usuario);

    await expect(
      ctx.service.alterarSenha(1, 'errada', 'NovaSenha123'),
    ).rejects.toThrow('Senha atual incorreta');
  });

  it('a nova senha precisa ter pelo menos 8 caracteres', async () => {
    ctx.usuarioRepository.findOne.mockResolvedValue(ctx.usuario);

    await expect(
      ctx.service.alterarSenha(1, 'Ubs@2026', 'curta'),
    ).rejects.toThrow('pelo menos 8 caracteres');
  });

  it('troca a senha guardando apenas o hash da nova', async () => {
    ctx.usuarioRepository.findOne.mockResolvedValue(ctx.usuario);

    await ctx.service.alterarSenha(1, 'Ubs@2026', 'NovaSenha123');

    expect(await compare('NovaSenha123', ctx.usuario.senhaHash)).toBe(true);
    expect(ctx.usuario.senhaHash).not.toBe('NovaSenha123');
  });

  it('não deixa trocar o e-mail por um que já é de outro usuário', async () => {
    ctx.usuarioRepository.findOne
      .mockResolvedValueOnce(ctx.usuario)
      .mockResolvedValueOnce({ id: 2, email: 'outro@example.com' });

    await expect(
      ctx.service.atualizarPerfil(1, { email: 'outro@example.com' }),
    ).rejects.toThrow('E-mail já está em uso');
  });

  it('telefone vazio vira nulo no perfil', async () => {
    ctx.usuarioRepository.findOne.mockResolvedValue(ctx.usuario);

    const resultado = await ctx.service.atualizarPerfil(1, { telefone: '  ' });

    expect(resultado.telefone).toBeNull();
  });
});
