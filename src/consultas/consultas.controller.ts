import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { ConsultasService } from './consultas.service.js';

@Controller('consultas')
export class ConsultasController {
  constructor(private readonly service: ConsultasService) {}

  @Get()
  listar(
    @Query('profissionalId', new ParseIntPipe({ optional: true }))
    profissionalId?: number,
    @Query('data') data?: string,
  ) {
    return this.service.listar(profissionalId, data);
  }

  @Post()
  criar(@Body() dados: { pacienteId: number; profissionalId: number }) {
    return this.service.criar(dados);
  }
}
