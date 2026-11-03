import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import {
  Atendimento,
  StatusAtendimento,
} from '../entities/atendimento.entity.js';
import { Paciente } from '../entities/paciente.entity.js';
import { Profissional } from '../entities/profissional.entity.js';

@Injectable()
export class FilaService {
  constructor(
    @InjectRepository(Atendimento)
    private readonly atendimentoRepository: Repository<Atendimento>,

    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,

    @InjectRepository(Profissional)
    private readonly profissionalRepository: Repository<Profissional>,
  ) {}

  // Lista os profissionais (abas da tela de fila)
  async listarProfissionais() {
    return this.profissionalRepository.find({ order: { nome: 'ASC' } });
  }

  // Lista a fila, com posição, filtro por profissional e busca
  async listarFila(profissionalId?: number, busca?: string) {
    const atendimentos = await this.atendimentoRepository.find({
      where: {
        status: In([
          StatusAtendimento.AGUARDANDO,
          StatusAtendimento.EM_TRIAGEM,
          StatusAtendimento.EM_ATENDIMENTO,
        ]),
        ...(profissionalId ? { profissional: { id: profissionalId } } : {}),
      },
      relations: { paciente: true, profissional: true },
      order: { dataHoraChegada: 'ASC' },
    });

    // A posição é calculada antes da busca, para não mudar com o filtro
    const comPosicao = atendimentos.map((atendimento, indice) => ({
      ...atendimento,
      posicao: indice + 1,
    }));

    if (!busca) {
      return comPosicao;
    }

    const termo = busca.toLowerCase();
    return comPosicao.filter(
      (item) =>
        item.paciente?.nome?.toLowerCase().includes(termo) ||
        item.profissional?.nome?.toLowerCase().includes(termo),
    );
  }

  // Busca um atendimento pelo ID
  async buscarAtendimento(id: number) {
    const atendimento = await this.atendimentoRepository.findOne({
      where: { id },
      relations: { paciente: true, profissional: true },
    });

    if (!atendimento) {
      throw new NotFoundException('Atendimento não encontrado');
    }

    return atendimento;
  }

  // Atualiza o status de um atendimento
  async atualizarStatus(id: number, status: StatusAtendimento) {
    const atendimento = await this.buscarAtendimento(id);

    atendimento.status = status;

    return this.atendimentoRepository.save(atendimento);
  }

  // "Remover paciente": marca como CANCELADO e não apaga o registro
  async removerDaFila(id: number) {
    return this.atualizarStatus(id, StatusAtendimento.CANCELADO);
  }

  // Cria um novo atendimento para um paciente
  async criarAtendimento(dados: {
    pacienteId: number;
    senha: string;
    profissionalId?: number;
  }) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id: dados.pacienteId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    let profissional: Profissional | null = null;

    if (dados.profissionalId) {
      profissional = await this.profissionalRepository.findOne({
        where: { id: dados.profissionalId },
      });

      if (!profissional) {
        throw new NotFoundException('Profissional não encontrado');
      }
    }

    const atendimento = this.atendimentoRepository.create({
      paciente,
      profissional,
      senha: dados.senha,
      status: StatusAtendimento.AGUARDANDO,
    });

    return this.atendimentoRepository.save(atendimento);
  }
}
