import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { SolicitacoesSaidaService } from './solicitacoes-saida.service.js';

@Controller('solicitacoes-saida')
export class SolicitacoesSaidaController {
  constructor(private readonly service: SolicitacoesSaidaService) {}

  @Get()
  listarPendentes(
    @Query('profissionalId', new ParseIntPipe({ optional: true }))
    profissionalId?: number,
  ) {
    return this.service.listarPendentes(profissionalId);
  }

  @Get('total')
  contarPendentes() {
    return this.service.contarPendentes();
  }

  @Post()
  criar(@Body('atendimentoId', ParseIntPipe) atendimentoId: number) {
    return this.service.criar(atendimentoId);
  }

  @Patch(':id/aceitar')
  aceitar(@Param('id', ParseIntPipe) id: number) {
    return this.service.aceitar(id);
  }
}
