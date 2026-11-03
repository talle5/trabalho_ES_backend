import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { Atendimento } from './atendimento.entity.js';

export enum StatusSolicitacaoSaida {
  PENDENTE = 'PENDENTE',
  ACEITA = 'ACEITA',
}

@Entity('solicitacoes_saida')
export class SolicitacaoSaida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: StatusSolicitacaoSaida.PENDENTE,
  })
  status: StatusSolicitacaoSaida;

  @CreateDateColumn({ name: 'data_hora_solicitacao' })
  dataHoraSolicitacao: Date;

  @ManyToOne('Atendimento', { nullable: false })
  @JoinColumn({ name: 'atendimento_id' })
  atendimento: Atendimento;
}
