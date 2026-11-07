import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcryptjs';

import { Paciente } from '../entities/paciente.entity.js';

@Injectable()
export class PacienteAppService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,

    private readonly jwtService: JwtService,
  ) {}

  // Login com CPF (com ou sem pontuação) ou e-mail
  async login(login: string, senha: string) {
    const texto = String(login ?? '').trim();
    const cpf = texto.replace(/\D/g, '');

    if (!texto || (!texto.includes('@') && !cpf)) {
      throw new UnauthorizedException('CPF/e-mail ou senha inválidos');
    }

    const consulta = this.pacienteRepository
      .createQueryBuilder('paciente')
      .addSelect('paciente.senhaHash');

    if (texto.includes('@')) {
      consulta.where('paciente.email = :email', { email: texto.toLowerCase() });
    } else {
      consulta.where(
        "regexp_replace(paciente.identificador, '\\D', '', 'g') = :cpf",
        { cpf },
      );
    }

    const paciente = await consulta.getOne();

    const senhaCorreta = paciente?.senhaHash
      ? await compare(String(senha ?? ''), paciente.senhaHash)
      : false;

    if (!paciente || !senhaCorreta) {
      throw new UnauthorizedException('CPF/e-mail ou senha inválidos');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: paciente.id,
      tipo: 'paciente',
    });

    return { accessToken, paciente: this.montarPerfil(paciente) };
  }

  async perfil(id: number) {
    return this.montarPerfil(await this.buscar(id));
  }

  // O atendente redefine a senha do paciente (ex.: quem esqueceu)
  async redefinirSenha(id: number, novaSenha: string) {
    const paciente = await this.buscar(id);

    if (typeof novaSenha !== 'string' || novaSenha.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }

    paciente.senhaHash = await hash(novaSenha, 10);
    await this.pacienteRepository.save(paciente);

    return { mensagem: 'Senha redefinida com sucesso' };
  }

  private async buscar(id: number) {
    const paciente = await this.pacienteRepository.findOne({ where: { id } });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return paciente;
  }

  // Formato da tela "Meu perfil" do app (CPF mascarado, sem hash)
  private montarPerfil(paciente: Paciente) {
    const digitos = paciente.identificador.replace(/\D/g, '');

    return {
      id: paciente.id,
      nome: paciente.nome,
      cpf:
        digitos.length === 11
          ? `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`
          : null,
      dataNascimento: paciente.dataNascimento,
      email: paciente.email,
      telefone: paciente.telefone,
      endereco: paciente.endereco,
    };
  }
}
