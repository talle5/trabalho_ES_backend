import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ParseIntPipe,
  Body,
  ParseEnumPipe,
} from '@nestjs/common';

import { FilaService } from './fila.service.js';
import { StatusAtendimento } from '../entities/atendimento.entity.js';

@Controller('fila')
export class FilaController {
  constructor(private readonly filaService: FilaService) {}

  @Get()
  listarFila() {
    return this.filaService.listarFila();
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
}
