import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  SolicitacaoSaida,
  StatusSolicitacaoSaida,
} from '../entities/solicitacao-saida.entity.js';
import {
  Atendimento,
  StatusAtendimento,
} from '../entities/atendimento.entity.js';

@Injectable()
export class SolicitacoesSaidaService {
  constructor(
    @InjectRepository(SolicitacaoSaida)
    private readonly solicitacaoRepository: Repository<SolicitacaoSaida>,

    @InjectRepository(Atendimento)
    private readonly atendimentoRepository: Repository<Atendimento>,
  ) {}

  // Lista as solicitações pendentes (filtra por profissional se informado)
  async listarPendentes(profissionalId?: number) {
    const solicitacoes = await this.solicitacaoRepository.find({
      where: {
        status: StatusSolicitacaoSaida.PENDENTE,
        ...(profissionalId
          ? { atendimento: { profissional: { id: profissionalId } } }
          : {}),
      },
      relations: { atendimento: { paciente: true, profissional: true } },
      order: { dataHoraSolicitacao: 'ASC' },
    });

    return solicitacoes.map((solicitacao) => ({
      id: solicitacao.id,
      status: solicitacao.status,
      horarioSolicitacao: solicitacao.dataHoraSolicitacao,
      atendimentoId: solicitacao.atendimento.id,
      paciente: {
        nome: solicitacao.atendimento.paciente?.nome,
        cpf: solicitacao.atendimento.paciente?.identificador,
      },
      profissional: solicitacao.atendimento.profissional
        ? {
            id: solicitacao.atendimento.profissional.id,
            nome: solicitacao.atendimento.profissional.nome,
          }
        : null,
    }));
  }

  // Total de pendentes (bolinha vermelha do menu)
  async contarPendentes() {
    const total = await this.solicitacaoRepository.count({
      where: { status: StatusSolicitacaoSaida.PENDENTE },
    });

    return { total };
  }

  // O paciente pede para sair da fila
  async criar(atendimentoId: number) {
    const atendimento = await this.atendimentoRepository.findOne({
      where: { id: atendimentoId },
    });

    if (!atendimento) {
      throw new NotFoundException('Atendimento não encontrado');
    }

    const solicitacao = this.solicitacaoRepository.create({
      atendimento,
      status: StatusSolicitacaoSaida.PENDENTE,
    });

    return this.solicitacaoRepository.save(solicitacao);
  }

  // O atendente aceita: a solicitação vira ACEITA e o paciente sai da fila
  async aceitar(id: number) {
    const solicitacao = await this.solicitacaoRepository.findOne({
      where: { id },
      relations: { atendimento: true },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (solicitacao.status === StatusSolicitacaoSaida.ACEITA) {
      throw new BadRequestException('Solicitação já foi aceita');
    }

    await this.solicitacaoRepository.manager.transaction(async (manager) => {
      solicitacao.status = StatusSolicitacaoSaida.ACEITA;
      solicitacao.atendimento.status = StatusAtendimento.CANCELADO;

      await manager.save(solicitacao.atendimento);
      await manager.save(solicitacao);
    });

    return { id: solicitacao.id, status: solicitacao.status };
  }
}
