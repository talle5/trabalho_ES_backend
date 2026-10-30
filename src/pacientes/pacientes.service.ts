import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  async listar() {
    return this.pacienteRepository.find();
  }
}
