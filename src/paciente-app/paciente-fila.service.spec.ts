import { describe, expect, it, vi } from 'vitest';

import { PacienteFilaService } from './paciente-fila.service.js';
import { StatusAtendimento } from '../entities/atendimento.entity.js';
import { StatusSolicitacaoSaida } from '../entities/solicitacao-saida.entity.js';

function criarServico() {
  const atendimentoRepository = { find: vi.fn(), findOne: vi.fn() };
  const profissionalRepository = { findOne: vi.fn() };
  const solicitacaoRepository = {
    findOne: vi.fn(),
    create: vi.fn((dados: unknown) => dados),
    save: vi.fn(async (dados: object) => ({
      id: 5,
      dataHoraSolicitacao: new Date('2026-11-14T17:10:46Z'),
      ...dados,
    })),
  };

  const service = new PacienteFilaService(
    atendimentoRepository as never,
    profissionalRepository as never,
    solicitacaoRepository as never,
  );

  return {
    service,
    atendimentoRepository,
    profissionalRepository,
    solicitacaoRepository,
  };
}

const luiza = { id: 2, nome: 'Dra. Luiza Freitas', cargo: 'Dentista' };
const ricardo = { id: 1, nome: 'Dr. Ricardo Mendes', cargo: 'Clínico Geral' };

const naFila = [
  { paciente: { id: 3, nome: 'Antônio Carlos', identificador: '111' } },
  { paciente: { id: 10, nome: 'João da Silva', identificador: '222' } },
];

describe('PacienteFilaService.fila', () => {
  it('devolve a fila do profissional destacando o paciente logado', async () => {
    const { service, atendimentoRepository, profissionalRepository } =
      criarServico();
    profissionalRepository.findOne.mockResolvedValue(luiza);
    atendimentoRepository.find.mockResolvedValue(naFila);

    const resultado = await service.fila(10, 2);

    expect(resultado.profissional).toEqual(luiza);
    expect(resultado.minhaPosicao).toBe(2);
    expect(resultado.fila).toEqual([
      { posicao: 1, nome: 'Antônio Carlos', voce: false },
      { posicao: 2, nome: 'João da Silva', voce: true },
    ]);
  });

  it('não expõe dados pessoais além da posição, do nome e do destaque', async () => {
    const { service, atendimentoRepository, profissionalRepository } =
      criarServico();
    profissionalRepository.findOne.mockResolvedValue(luiza);
    atendimentoRepository.find.mockResolvedValue(naFila);

    const resultado = await service.fila(10, 2);

    for (const item of resultado.fila) {
      expect(Object.keys(item).sort()).toEqual(['nome', 'posicao', 'voce']);
    }
  });

  it('sem profissionalId usa o profissional da fila em que o paciente está', async () => {
    const { service, atendimentoRepository, profissionalRepository } =
      criarServico();
    atendimentoRepository.findOne.mockResolvedValue({ profissional: luiza });
    profissionalRepository.findOne.mockResolvedValue(luiza);
    atendimentoRepository.find.mockResolvedValue(naFila);

    await service.fila(10);

    expect(profissionalRepository.findOne).toHaveBeenCalledWith({
      where: { id: 2 },
    });
  });

  it('com profissionalId informado não procura a fila do paciente', async () => {
    const { service, atendimentoRepository, profissionalRepository } =
      criarServico();
    profissionalRepository.findOne.mockResolvedValue(ricardo);
    atendimentoRepository.find.mockResolvedValue([]);

    await service.fila(10, 1);

    expect(atendimentoRepository.findOne).not.toHaveBeenCalled();
    expect(
      atendimentoRepository.find.mock.calls[0][0].where.profissional,
    ).toEqual({
      id: 1,
    });
  });

  it('paciente fora de qualquer fila recebe a fila vazia', async () => {
    const { service, atendimentoRepository, profissionalRepository } =
      criarServico();
    atendimentoRepository.findOne.mockResolvedValue(null);

    const resultado = await service.fila(10);

    expect(resultado).toEqual({
      profissional: null,
      minhaPosicao: null,
      fila: [],
    });
    expect(profissionalRepository.findOne).not.toHaveBeenCalled();
  });

  it('minhaPosicao é nula quando o paciente não está na fila escolhida', async () => {
    const { service, atendimentoRepository, profissionalRepository } =
      criarServico();
    profissionalRepository.findOne.mockResolvedValue(luiza);
    atendimentoRepository.find.mockResolvedValue([naFila[0]]);

    const resultado = await service.fila(10, 2);

    expect(resultado.minhaPosicao).toBeNull();
  });
});

describe('PacienteFilaService.historico', () => {
  it('traduz o status para a situação mostrada no app', async () => {
    const { service, atendimentoRepository } = criarServico();
    const data = new Date('2026-11-14T17:00:00Z');
    atendimentoRepository.find.mockResolvedValue(
      [
        StatusAtendimento.AGUARDANDO,
        StatusAtendimento.EM_TRIAGEM,
        StatusAtendimento.EM_ATENDIMENTO,
        StatusAtendimento.FINALIZADO,
        StatusAtendimento.CANCELADO,
      ].map((status, i) => ({
        id: i + 1,
        status,
        dataHoraChegada: data,
        profissional: luiza,
      })),
    );

    const resultado = await service.historico(10);

    expect(resultado.total).toBe(5);
    expect(resultado.consultas.map((c) => c.situacao)).toEqual([
      'Aguardando',
      'Em triagem',
      'Em atendimento',
      'Atendido',
      'Desistiu',
    ]);
  });

  it('consulta só o paciente logado, do mais recente ao mais antigo', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([]);

    await service.historico(10);

    const consulta = atendimentoRepository.find.mock.calls[0][0];
    expect(consulta.where.paciente).toEqual({ id: 10 });
    expect(consulta.order).toEqual({ dataHoraChegada: 'DESC' });
  });

  it('devolve profissional nulo quando o atendimento não tem profissional', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([
      {
        id: 1,
        status: StatusAtendimento.FINALIZADO,
        dataHoraChegada: new Date(),
        profissional: null,
      },
    ]);

    const resultado = await service.historico(10);

    expect(resultado.consultas[0].profissional).toBeNull();
  });

  it('histórico vazio quando o paciente nunca foi atendido', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([]);

    await expect(service.historico(10)).resolves.toEqual({
      total: 0,
      consultas: [],
    });
  });
});

describe('PacienteFilaService.solicitarCancelamento', () => {
  const ativo = { id: 18, profissional: luiza };

  it('recusa quando o paciente não está em nenhuma fila', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([]);

    await expect(service.solicitarCancelamento(10)).rejects.toThrow(
      'Você não está em nenhuma fila',
    );
  });

  it('pede o profissional quando o paciente está em mais de uma fila', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([
      ativo,
      { id: 17, profissional: ricardo },
    ]);

    await expect(service.solicitarCancelamento(10)).rejects.toThrow(
      'Informe o profissional da consulta que deseja cancelar',
    );
  });

  it('filtra pelo profissional informado', async () => {
    const { service, atendimentoRepository, solicitacaoRepository } =
      criarServico();
    atendimentoRepository.find.mockResolvedValue([ativo]);
    solicitacaoRepository.findOne.mockResolvedValue(null);

    await service.solicitarCancelamento(10, 2);

    expect(
      atendimentoRepository.find.mock.calls[0][0].where.profissional,
    ).toEqual({
      id: 2,
    });
  });

  it('recusa solicitação duplicada enquanto há uma pendente', async () => {
    const { service, atendimentoRepository, solicitacaoRepository } =
      criarServico();
    atendimentoRepository.find.mockResolvedValue([ativo]);
    solicitacaoRepository.findOne.mockResolvedValue({ id: 2 });

    await expect(service.solicitarCancelamento(10, 2)).rejects.toThrow(
      'Já existe uma solicitação de cancelamento pendente',
    );
    expect(solicitacaoRepository.save).not.toHaveBeenCalled();
  });

  it('cria a solicitação PENDENTE para o atendimento ativo', async () => {
    const { service, atendimentoRepository, solicitacaoRepository } =
      criarServico();
    atendimentoRepository.find.mockResolvedValue([ativo]);
    solicitacaoRepository.findOne.mockResolvedValue(null);

    const resultado = await service.solicitarCancelamento(10, 2);

    expect(solicitacaoRepository.create).toHaveBeenCalledWith({
      atendimento: ativo,
      status: StatusSolicitacaoSaida.PENDENTE,
    });
    expect(resultado).toMatchObject({
      id: 5,
      status: StatusSolicitacaoSaida.PENDENTE,
      profissional: { id: 2, nome: 'Dra. Luiza Freitas' },
    });
  });
});
