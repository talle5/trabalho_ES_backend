import { Controller, Post, Get, Body } from '@nestjs/common';

import { PacientesService } from './pacientes.service.js';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  criar(
    @Body() dados: { nome: string; identificador: string; telefone?: string },
  ) {
    return this.pacientesService.criar(dados);
  }

  @Get()
  listar() {
    return this.pacientesService.listar();
  }
}
