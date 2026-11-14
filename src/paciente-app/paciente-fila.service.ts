import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  Atendimento,
  StatusAtendimento,
} from '../entities/atendimento.entity.js';
import { Profissional } from '../entities/profissional.entity.js';
import {
  SolicitacaoSaida,
  StatusSolicitacaoSaida,
} from '../entities/solicitacao-saida.entity.js';

const STATUS_ATIVOS = [
  StatusAtendimento.AGUARDANDO,
  StatusAtendimento.EM_TRIAGEM,
  StatusAtendimento.EM_ATENDIMENTO,
];

const SITUACAO: Record<StatusAtendimento, string> = {
  [StatusAtendimento.AGUARDANDO]: 'Aguardando',
  [StatusAtendimento.EM_TRIAGEM]: 'Em triagem',
  [StatusAtendimento.EM_ATENDIMENTO]: 'Em atendimento',
  [StatusAtendimento.FINALIZADO]: 'Atendido',
  [StatusAtendimento.CANCELADO]: 'Desistiu',
};

@Injectable()
export class PacienteFilaService {
  constructor(
    @InjectRepository(Atendimento)
    private readonly atendimentoRepository: Repository<Atendimento>,

    @InjectRepository(Profissional)
    private readonly profissionalRepository: Repository<Profissional>,

    @InjectRepository(SolicitacaoSaida)
    private readonly solicitacaoRepository: Repository<SolicitacaoSaida>,
  ) {}

  // Fila ativa de um profissional, só com posição e nome, destacando o paciente logado.
  // Sem profissionalId, usa o profissional da fila em que o paciente está.
  async fila(pacienteId: number, profissionalId?: number) {
    let alvo = profissionalId;

    if (!alvo) {
      const meu = await this.atendimentoRepository.findOne({
        where: { paciente: { id: pacienteId }, status: In(STATUS_ATIVOS) },
        relations: { profissional: true },
        order: { dataHoraChegada: 'DESC' },
      });
      alvo = meu?.profissional?.id;
    }

    const profissional = alvo
      ? await this.profissionalRepository.findOne({ where: { id: alvo } })
      : null;

    if (!profissional) {
      return { profissional: null, minhaPosicao: null, fila: [] };
    }

    const atendimentos = await this.atendimentoRepository.find({
      where: {
        status: In(STATUS_ATIVOS),
        profissional: { id: profissional.id },
      },
      relations: { paciente: true },
      order: { dataHoraChegada: 'ASC' },
    });

    const fila = atendimentos.map((atendimento, indice) => ({
      posicao: indice + 1,
      nome: atendimento.paciente?.nome,
      voce: atendimento.paciente?.id === pacienteId,
    }));

    return {
      profissional: {
        id: profissional.id,
        nome: profissional.nome,
        cargo: profissional.cargo,
      },
      minhaPosicao: fila.find((item) => item.voce)?.posicao ?? null,
      fila,
    };
  }

  // Histórico do paciente, do mais recente para o mais antigo
  async historico(pacienteId: number) {
    const atendimentos = await this.atendimentoRepository.find({
      where: { paciente: { id: pacienteId } },
      relations: { profissional: true },
      order: { dataHoraChegada: 'DESC' },
    });

    const consultas = atendimentos.map((atendimento) => ({
      id: atendimento.id,
      profissional: atendimento.profissional
        ? {
            id: atendimento.profissional.id,
            nome: atendimento.profissional.nome,
            cargo: atendimento.profissional.cargo,
          }
        : null,
      data: atendimento.dataHoraChegada,
      situacao: SITUACAO[atendimento.status],
    }));

    return { total: consultas.length, consultas };
  }

  // "Solicitar cancelamento de consulta": o atendente aceita depois pela web
  async solicitarCancelamento(pacienteId: number, profissionalId?: number) {
    const ativos = await this.atendimentoRepository.find({
      where: {
        paciente: { id: pacienteId },
        status: In(STATUS_ATIVOS),
        ...(profissionalId ? { profissional: { id: profissionalId } } : {}),
      },
      relations: { profissional: true },
      order: { dataHoraChegada: 'ASC' },
    });

    if (ativos.length === 0) {
      throw new NotFoundException('Você não está em nenhuma fila');
    }

    if (ativos.length > 1) {
      throw new BadRequestException(
        'Informe o profissional da consulta que deseja cancelar',
      );
    }

    const atendimento = ativos[0];

    const pendente = await this.solicitacaoRepository.findOne({
      where: {
        atendimento: { id: atendimento.id },
        status: StatusSolicitacaoSaida.PENDENTE,
      },
    });

    if (pendente) {
      throw new BadRequestException(
        'Já existe uma solicitação de cancelamento pendente',
      );
    }

    const solicitacao = await this.solicitacaoRepository.save(
      this.solicitacaoRepository.create({
        atendimento,
        status: StatusSolicitacaoSaida.PENDENTE,
      }),
    );

    return {
      id: solicitacao.id,
      status: solicitacao.status,
      dataHoraSolicitacao: solicitacao.dataHoraSolicitacao,
      profissional: atendimento.profissional
        ? {
            id: atendimento.profissional.id,
            nome: atendimento.profissional.nome,
          }
        : null,
    };
  }
}
