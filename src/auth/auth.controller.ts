import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dados: { email: string; senha: string }) {
    return this.authService.login(dados.email, dados.senha);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  perfil(@Req() req: { usuarioId: number }) {
    return this.authService.perfil(req.usuarioId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  atualizarPerfil(
    @Req() req: { usuarioId: number },
    @Body()
    dados: {
      nome?: string;
      email?: string;
      telefone?: string;
      nomeSocial?: string;
    },
  ) {
    return this.authService.atualizarPerfil(req.usuarioId, dados);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('senha')
  alterarSenha(
    @Req() req: { usuarioId: number },
    @Body() dados: { senhaAtual: string; novaSenha: string },
  ) {
    return this.authService.alterarSenha(
      req.usuarioId,
      dados.senhaAtual,
      dados.novaSenha,
    );
  }
}
