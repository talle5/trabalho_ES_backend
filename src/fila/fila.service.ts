import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import {
  Atendimento,
  StatusAtendimento,
} from '../entities/atendimento.entity.js';

import { Paciente } from '../entities/paciente.entity.js';

@Injectable()
export class FilaService {
  constructor(
    @InjectRepository(Atendimento)
    private readonly atendimentoRepository: Repository<Atendimento>,

    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
  ) {}

  // Lista os atendimentos ativos da fila
  async listarFila() {
    return this.atendimentoRepository.find({
      where: {
        status: In([
          StatusAtendimento.AGUARDANDO,
          StatusAtendimento.EM_TRIAGEM,
          StatusAtendimento.EM_ATENDIMENTO,
        ]),
      },
      relations: { paciente: true },
      order: {
        dataHoraChegada: 'ASC',
      },
    });
  }

  // Busca um atendimento pelo ID
  async buscarAtendimento(id: number) {
    const atendimento = await this.atendimentoRepository.findOne({
      where: { id },
      relations: { paciente: true },
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

  // Cria um novo atendimento para um paciente
  async criarAtendimento(dados: { pacienteId: number; senha: string }) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id: dados.pacienteId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const atendimento = this.atendimentoRepository.create({
      paciente,
      senha: dados.senha,
      status: StatusAtendimento.AGUARDANDO,
    });

    return this.atendimentoRepository.save(atendimento);
  }
}
