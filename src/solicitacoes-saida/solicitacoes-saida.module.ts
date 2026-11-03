import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolicitacoesSaidaController } from './solicitacoes-saida.controller.js';
import { SolicitacoesSaidaService } from './solicitacoes-saida.service.js';
import { SolicitacaoSaida } from '../entities/solicitacao-saida.entity.js';
import { Atendimento } from '../entities/atendimento.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitacaoSaida, Atendimento])],
  controllers: [SolicitacoesSaidaController],
  providers: [SolicitacoesSaidaService],
})
export class SolicitacoesSaidaModule {}