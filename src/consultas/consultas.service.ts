import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';

import {
  Atendimento,
  StatusAtendimento,
} from '../entities/atendimento.entity.js';
import { Paciente } from '../entities/paciente.entity.js';
import { Profissional } from '../entities/profissional.entity.js';

@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(Atendimento)
    private readonly atendimentoRepository: Repository<Atendimento>,

    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,

    @InjectRepository(Profissional)
    private readonly profissionalRepository: Repository<Profissional>,
  ) {}

  // Lista as consultas do dia (data no formato AAAA-MM-DD; padrão: hoje)
  async listar(profissionalId?: number, data?: string) {
    const dia =
      data ??
      new Date().toLocaleDateString('en-CA', { timeZone: 'America/Fortaleza' });

    const inicio = new Date(`${dia}T00:00:00-03:00`);
    const fim = new Date(`${dia}T23:59:59.999-03:00`);

    const atendimentos = await this.atendimentoRepository.find({
      where: {
        status: Not(StatusAtendimento.CANCELADO),
        dataHoraChegada: Between(inicio, fim),
        ...(profissionalId ? { profissional: { id: profissionalId } } : {}),
      },
      relations: { paciente: true, profissional: true },
      order: { dataHoraChegada: 'ASC' },
    });

    return atendimentos.map((atendimento) => ({
      id: atendimento.id,
      status: atendimento.status,
      horario: atendimento.dataHoraChegada,
      paciente: {
        nome: atendimento.paciente?.nome,
        cpf: atendimento.paciente?.identificador,
      },
      profissional: atendimento.profissional
        ? {
            id: atendimento.profissional.id,
            nome: atendimento.profissional.nome,
          }
        : null,
    }));
  }

  // Cadastra uma nova consulta (cria um atendimento com senha automática)
  async criar(dados: { pacienteId: number; profissionalId: number }) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id: dados.pacienteId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const profissional = await this.profissionalRepository.findOne({
      where: { id: dados.profissionalId },
    });

    if (!profissional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const atendimento = this.atendimentoRepository.create({
      paciente,
      profissional,
      senha: `C${Date.now().toString().slice(-9)}`,
      status: StatusAtendimento.AGUARDANDO,
    });

    return this.atendimentoRepository.save(atendimento);
  }
}
