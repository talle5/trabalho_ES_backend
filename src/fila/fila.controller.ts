import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';

import { FilaService } from './fila.service.js';
import { StatusAtendimento } from '../entities/atendimento.entity.js';

@Controller('fila')
export class FilaController {
  constructor(private readonly filaService: FilaService) {}

  // Esta rota precisa vir antes de ':id'
  @Get('profissionais')
  listarProfissionais() {
    return this.filaService.listarProfissionais();
  }

  @Get()
  listarFila(
    @Query('profissionalId', new ParseIntPipe({ optional: true }))
    profissionalId?: number,
    @Query('busca') busca?: string,
  ) {
    return this.filaService.listarFila(profissionalId, busca);
  }

  @Get(':id')
  buscarAtendimento(@Param('id', ParseIntPipe) id: number) {
    return this.filaService.buscarAtendimento(id);
  }

  @Post()
  criarAtendimento(
    @Body()
    dados: {
      pacienteId: number;
      senha: string;
      profissionalId?: number;
    },
  ) {
    return this.filaService.criarAtendimento(dados);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', new ParseEnumPipe(StatusAtendimento))
    status: StatusAtendimento,
  ) {
    return this.filaService.atualizarStatus(id, status);
  }

  @Patch(':id/remover')
  removerDaFila(@Param('id', ParseIntPipe) id: number) {
    return this.filaService.removerDaFila(id);
  }
}
