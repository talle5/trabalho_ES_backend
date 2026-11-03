import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { Paciente } from './paciente.entity.js';
import type { Profissional } from './profissional.entity.js';

export enum StatusAtendimento {
  AGUARDANDO = 'AGUARDANDO',
  EM_TRIAGEM = 'EM_TRIAGEM',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

@Entity('atendimentos')
export class Atendimento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  senha: string;

  @Column({
    type: 'enum',
    enum: StatusAtendimento,
    default: StatusAtendimento.AGUARDANDO,
  })
  status: StatusAtendimento;

  @CreateDateColumn({ name: 'data_hora_chegada' })
  dataHoraChegada: Date;

  @ManyToOne('Paciente', 'atendimentos', {
    nullable: false,
  })
  paciente: Paciente;

  @ManyToOne('Profissional', { nullable: true })
  @JoinColumn({ name: 'profissional_id' })
  profissional: Profissional | null;
}
