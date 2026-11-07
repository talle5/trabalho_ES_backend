import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Paciente } from '../entities/paciente.entity.js';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
  ) {}

  async criar(dados: {
    nome: string;
    identificador: string;
    telefone?: string;
  }) {
    const paciente = this.pacienteRepository.create(dados);

    return this.pacienteRepository.save(paciente);
  }

  // Lista todos ou filtra por nome/CPF (identificador)
  async listar(busca?: string) {
    const termo = busca?.trim();

    if (!termo) {
      return this.pacienteRepository.find({ order: { nome: 'ASC' } });
    }

    return this.pacienteRepository.find({
      where: [
        { nome: ILike(`%${termo}%`) },
        { identificador: ILike(`%${termo}%`) },
      ],
      order: { nome: 'ASC' },
    });
  }
}
