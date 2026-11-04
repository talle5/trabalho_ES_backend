import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilaController } from './fila.controller.js';
import { FilaService } from './fila.service.js';
import { Atendimento } from '../entities/atendimento.entity.js';
import { Paciente } from '../entities/paciente.entity.js';
import { Profissional } from '../entities/profissional.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Atendimento, Paciente, Profissional])],
  controllers: [FilaController],
  providers: [FilaService],
})
export class FilaModule {}
