import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { PacienteAuthGuard } from './paciente-auth.guard.js';
import { PacienteFilaService } from './paciente-fila.service.js';

// Rotas do app do paciente: exigem o token de paciente
@ApiBearerAuth()
@UseGuards(PacienteAuthGuard)
@Controller('paciente')
export class PacienteFilaController {
  constructor(private readonly service: PacienteFilaService) {}

  @Get('fila')
  fila(
    @Req() req: { pacienteId: number },
    @Query('profissionalId', new ParseIntPipe({ optional: true }))
    profissionalId?: number,
  ) {
    return this.service.fila(req.pacienteId, profissionalId);
  }

  @Get('consultas')
  historico(@Req() req: { pacienteId: number }) {
    return this.service.historico(req.pacienteId);
  }

  @Post('cancelamento')
  solicitarCancelamento(
    @Req() req: { pacienteId: number },
    @Body('profissionalId') profissionalId?: number,
  ) {
    return this.service.solicitarCancelamento(req.pacienteId, profissionalId);
  }
}
