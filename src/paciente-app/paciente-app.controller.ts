import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PacienteAppService } from './paciente-app.service.js';
import { PacienteAuthGuard } from './paciente-auth.guard.js';

// Rotas do app do paciente
@Controller('paciente')
export class PacienteAppController {
  constructor(private readonly service: PacienteAppService) {}

  @Post('login')
  @HttpCode(200)
  login(
    @Body()
    dados: {
      login?: string;
      email?: string;
      cpf?: string;
      senha: string;
    },
  ) {
    return this.service.login(
      dados.login ?? dados.email ?? dados.cpf ?? '',
      dados.senha,
    );
  }

  @ApiBearerAuth()
  @UseGuards(PacienteAuthGuard)
  @Get('me')
  perfil(@Req() req: { pacienteId: number }) {
    return this.service.perfil(req.pacienteId);
  }
}

// Rota do FUNCIONÁRIO: protegida, senão qualquer um trocaria a senha de um paciente
@Controller('pacientes')
export class PacientesSenhaController {
  constructor(private readonly service: PacienteAppService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/senha')
  redefinirSenha(
    @Param('id', ParseIntPipe) id: number,
    @Body('novaSenha') novaSenha: string,
  ) {
    return this.service.redefinirSenha(id, novaSenha);
  }
}
