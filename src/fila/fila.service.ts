import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Atendimento,
  StatusAtendimento,
} from '../entities/atendimento.entity.js';

@Injectable()
export class FilaService {
  constructor(
    @InjectRepository(Atendimento)
    private readonly atendimentoRepository: Repository<Atendimento>,
  ) {}

  async listarFila() {
    return this.atendimentoRepository.find({
      where: {
        status: In([
          StatusAtendimento.AGUARDANDO,
          StatusAtendimento.EM_TRIAGEM,
          StatusAtendimento.EM_ATENDIMENTO,
        ]),
      },
      relations: {
        paciente: true,
      },
      order: {
        dataHoraChegada: 'ASC',
      },
    });
  }

  async buscarAtendimento(id: number) {
    const atendimento = await this.atendimentoRepository.findOne({
      where: { id },
      relations: {
        paciente: true,
      },
    });

    if (!atendimento) {
      throw new NotFoundException('Atendimento não encontrado.');
    }

    return atendimento;
  }

  async atualizarStatus(id: number, status: StatusAtendimento) {
    const atendimento = await this.buscarAtendimento(id);

    atendimento.status = status;

    return this.atendimentoRepository.save(atendimento);
  }
}
