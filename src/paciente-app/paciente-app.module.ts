import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module.js';
import { Atendimento } from '../entities/atendimento.entity.js';
import { Paciente } from '../entities/paciente.entity.js';
import { Profissional } from '../entities/profissional.entity.js';
import { SolicitacaoSaida } from '../entities/solicitacao-saida.entity.js';
import {
  PacienteAppController,
  PacientesSenhaController,
} from './paciente-app.controller.js';
import { PacienteAppService } from './paciente-app.service.js';
import { PacienteAuthGuard } from './paciente-auth.guard.js';
import { PacienteFilaController } from './paciente-fila.controller.js';
import { PacienteFilaService } from './paciente-fila.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Paciente,
      Atendimento,
      Profissional,
      SolicitacaoSaida,
    ]),
    AuthModule,
  ],
  controllers: [
    PacienteAppController,
    PacientesSenhaController,
    PacienteFilaController,
  ],
  providers: [PacienteAppService, PacienteAuthGuard, PacienteFilaService],
})
export class PacienteAppModule {}
