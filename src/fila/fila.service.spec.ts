import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

import { FilaService } from './fila.service.js';
import { StatusAtendimento } from '../entities/atendimento.entity.js';

function criarServico() {
  const atendimentoRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn((dados: unknown) => dados),
    save: vi.fn(async (dados: unknown) => dados),
  };
  const pacienteRepository = { findOne: vi.fn() };
  const profissionalRepository = { find: vi.fn(), findOne: vi.fn() };

  const service = new FilaService(
    atendimentoRepository as never,
    pacienteRepository as never,
    profissionalRepository as never,
  );

  return {
    service,
    atendimentoRepository,
    pacienteRepository,
    profissionalRepository,
  };
}

const fila = [
  {
    id: 1,
    senha: 'L001',
    status: StatusAtendimento.AGUARDANDO,
    paciente: { nome: 'Sabrina Oliveira' },
    profissional: { nome: 'Dra. Luiza Freitas' },
  },
  {
    id: 2,
    senha: 'L002',
    status: StatusAtendimento.AGUARDANDO,
    paciente: { nome: 'Antônio Carlos' },
    profissional: { nome: 'Dra. Luiza Freitas' },
  },
  {
    id: 3,
    senha: 'L003',
    status: StatusAtendimento.AGUARDANDO,
    paciente: { nome: 'Ricardo Felipe' },
    profissional: { nome: 'Dra. Luiza Freitas' },
  },
];

describe('FilaService', () => {
  it('lista os profissionais na ordem do cadastro', async () => {
    const { service, profissionalRepository } = criarServico();
    profissionalRepository.find.mockResolvedValue([]);

    await service.listarProfissionais();

    expect(profissionalRepository.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
    });
  });

  it('devolve a fila com a posição de cada paciente', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue(fila);

    const resultado = await service.listarFila();

    expect(resultado.map((item) => item.posicao)).toEqual([1, 2, 3]);
  });

  it('filtra a consulta ao banco pelo profissional informado', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([]);

    await service.listarFila(2);

    expect(atendimentoRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ profissional: { id: 2 } }),
      }),
    );
  });

  it('a busca por paciente mantém a posição original', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue(fila);

    const resultado = await service.listarFila(undefined, 'ricardo');

    expect(resultado).toHaveLength(1);
    expect(resultado[0].paciente.nome).toBe('Ricardo Felipe');
    expect(resultado[0].posicao).toBe(3);
  });

  it('a busca também encontra pelo nome do profissional', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue(fila);

    const resultado = await service.listarFila(undefined, 'luiza');

    expect(resultado).toHaveLength(3);
  });

  it('remover paciente marca o atendimento como CANCELADO', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.findOne.mockResolvedValue({
      id: 5,
      status: StatusAtendimento.AGUARDANDO,
    });

    const resultado = await service.removerDaFila(5);

    expect(resultado.status).toBe(StatusAtendimento.CANCELADO);
    expect(atendimentoRepository.save).toHaveBeenCalledTimes(1);
  });

  it('atualizar o status de um atendimento inexistente lança NotFound', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.findOne.mockResolvedValue(null);

    await expect(
      service.atualizarStatus(99, StatusAtendimento.FINALIZADO),
    ).rejects.toThrow(NotFoundException);
  });

  it('não cria atendimento para paciente inexistente', async () => {
    const { service, pacienteRepository } = criarServico();
    pacienteRepository.findOne.mockResolvedValue(null);

    await expect(
      service.criarAtendimento({ pacienteId: 1, senha: 'L001' }),
    ).rejects.toThrow('Paciente não encontrado');
  });

  it('não cria atendimento para profissional inexistente', async () => {
    const { service, pacienteRepository, profissionalRepository } =
      criarServico();
    pacienteRepository.findOne.mockResolvedValue({ id: 1 });
    profissionalRepository.findOne.mockResolvedValue(null);

    await expect(
      service.criarAtendimento({
        pacienteId: 1,
        senha: 'L001',
        profissionalId: 9,
      }),
    ).rejects.toThrow('Profissional não encontrado');
  });

  it('cria o atendimento como AGUARDANDO com a senha informada', async () => {
    const { service, pacienteRepository, profissionalRepository } =
      criarServico();
    pacienteRepository.findOne.mockResolvedValue({ id: 1 });
    profissionalRepository.findOne.mockResolvedValue({ id: 2 });

    const resultado = await service.criarAtendimento({
      pacienteId: 1,
      senha: 'L001',
      profissionalId: 2,
    });

    expect(resultado.status).toBe(StatusAtendimento.AGUARDANDO);
    expect(resultado.senha).toBe('L001');
  });
});
