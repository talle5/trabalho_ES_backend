import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Atendimento } from '../entities/atendimento.entity.js';
import { FilaController } from './fila.controller.js';
import { FilaService } from './fila.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Atendimento])],
  controllers: [FilaController],
  providers: [FilaService],
  exports: [FilaService],
})
export class FilaModule {}
