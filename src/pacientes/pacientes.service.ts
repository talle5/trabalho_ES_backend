import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { ILike, Repository } from 'typeorm';

import { Paciente } from '../entities/paciente.entity.js';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
  ) {}

  // O atendente cadastra o paciente e já define a senha de acesso ao app
  async criar(dados: {
    nome: string;
    identificador: string;
    telefone?: string;
    email?: string;
    dataNascimento?: string;
    endereco?: string;
    senha?: string;
  }) {
    if (dados.senha && dados.senha.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }

    const paciente = this.pacienteRepository.create({
      nome: dados.nome.trim(),
      identificador: dados.identificador.trim(),
      telefone: dados.telefone?.trim() || null,
      email: dados.email?.trim().toLowerCase() || null,
      dataNascimento: dados.dataNascimento || null,
      endereco: dados.endereco?.trim() || null,
      senhaHash: dados.senha ? await hash(dados.senha, 10) : null,
    });

    const salvo = await this.pacienteRepository.save(paciente);
    salvo.senhaHash = null; // nunca devolver o hash

    return salvo;
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
