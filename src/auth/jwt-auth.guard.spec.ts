import { describe, expect, it, vi } from 'vitest';

import { JwtAuthGuard } from './jwt-auth.guard.js';

function criarContexto(authorization?: string) {
  const request: {
    headers: Record<string, string | undefined>;
    usuarioId?: number;
  } = { headers: { authorization } };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  };

  return { request, context: context as never };
}

describe('JwtAuthGuard (funcionário)', () => {
  it('recusa requisição sem token', async () => {
    const guard = new JwtAuthGuard({ verifyAsync: vi.fn() } as never);

    await expect(guard.canActivate(criarContexto().context)).rejects.toThrow(
      'Token não informado',
    );
  });

  it('aceita token de funcionário e guarda o id na requisição', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({ sub: 7, tipo: 'funcionario' }),
    };
    const guard = new JwtAuthGuard(jwtService as never);
    const { request, context } = criarContexto('Bearer abc');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.usuarioId).toBe(7);
  });

  it('recusa token de paciente com a mensagem "Token inválido"', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({ sub: 1, tipo: 'paciente' }),
    };
    const guard = new JwtAuthGuard(jwtService as never);

    await expect(
      guard.canActivate(criarContexto('Bearer abc').context),
    ).rejects.toMatchObject({ message: 'Token inválido' });
  });

  it('recusa token expirado ou adulterado', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockRejectedValue(new Error('jwt expired')),
    };
    const guard = new JwtAuthGuard(jwtService as never);

    await expect(
      guard.canActivate(criarContexto('Bearer abc').context),
    ).rejects.toMatchObject({ message: 'Token inválido ou expirado' });
  });
});
