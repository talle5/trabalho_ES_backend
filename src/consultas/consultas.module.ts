import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConsultasController } from './consultas.controller.js';
import { ConsultasService } from './consultas.service.js';
import { Atendimento } from '../entities/atendimento.entity.js';
import { Paciente } from '../entities/paciente.entity.js';
import { Profissional } from '../entities/profissional.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Atendimento, Paciente, Profissional])],
  controllers: [ConsultasController],
  providers: [ConsultasService],
})
export class ConsultasModule {}
