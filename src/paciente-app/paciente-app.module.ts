import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module.js';
import { Paciente } from '../entities/paciente.entity.js';
import {
  PacienteAppController,
  PacientesSenhaController,
} from './paciente-app.controller.js';
import { PacienteAppService } from './paciente-app.service.js';
import { PacienteAuthGuard } from './paciente-auth.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente]), AuthModule],
  controllers: [PacienteAppController, PacientesSenhaController],
  providers: [PacienteAppService, PacienteAuthGuard],
})
export class PacienteAppModule {}
