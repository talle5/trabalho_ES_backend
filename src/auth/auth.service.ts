import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcryptjs';

import { Usuario } from '../entities/usuario.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const emailNormalizado = String(email ?? '')
      .trim()
      .toLowerCase();

    const usuario = await this.usuarioRepository.findOne({
      where: { email: emailNormalizado },
    });

    const senhaCorreta = usuario
      ? await compare(String(senha ?? ''), usuario.senhaHash)
      : false;

    if (!usuario || !senhaCorreta) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      tipo: 'funcionario',
      email: usuario.email,
    });

    return { accessToken, usuario: this.montarPerfil(usuario) };
  }

  async perfil(id: number) {
    return this.montarPerfil(await this.buscar(id));
  }

  async atualizarPerfil(
    id: number,
    dados: {
      nome?: string;
      email?: string;
      telefone?: string;
      nomeSocial?: string;
    },
  ) {
    const usuario = await this.buscar(id);

    if (dados.email !== undefined) {
      const email = dados.email.trim().toLowerCase();
      const existente = await this.usuarioRepository.findOne({
        where: { email },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException('E-mail já está em uso');
      }

      usuario.email = email;
    }

    if (dados.nome !== undefined && dados.nome.trim()) {
      usuario.nome = dados.nome.trim();
    }

    if (dados.telefone !== undefined) {
      usuario.telefone = dados.telefone.trim() || null;
    }

    if (dados.nomeSocial !== undefined) {
      usuario.nomeSocial = dados.nomeSocial.trim() || null;
    }

    return this.montarPerfil(await this.usuarioRepository.save(usuario));
  }

  async alterarSenha(id: number, senhaAtual: string, novaSenha: string) {
    const usuario = await this.buscar(id);

    const senhaCorreta = await compare(
      String(senhaAtual ?? ''),
      usuario.senhaHash,
    );

    if (!senhaCorreta) {
      throw new BadRequestException('Senha atual incorreta');
    }

    if (typeof novaSenha !== 'string' || novaSenha.length < 8) {
      throw new BadRequestException(
        'A nova senha deve ter pelo menos 8 caracteres',
      );
    }

    usuario.senhaHash = await hash(novaSenha, 10);
    await this.usuarioRepository.save(usuario);

    return { mensagem: 'Senha alterada com sucesso' };
  }

  private async buscar(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  // Monta a resposta no formato da tela "Meu perfil" (CPF mascarado, sem hash)
  private montarPerfil(usuario: Usuario) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf ? `***.***.***-${usuario.cpf.slice(-2)}` : null,
      dataNascimento: usuario.dataNascimento,
      telefone: usuario.telefone,
      nomeSocial: usuario.nomeSocial,
      perfilAcesso: usuario.funcao.toLowerCase(),
      vinculo: {
        unidade: usuario.unidade,
        funcao: usuario.funcao,
        matricula: usuario.matricula,
        setor: usuario.setor,
      },
    };
  }
}
