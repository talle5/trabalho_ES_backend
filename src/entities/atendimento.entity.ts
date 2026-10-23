import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Paciente } from './paciente.entity.js';

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

  @ManyToOne(() => Paciente, (paciente) => paciente.atendimentos, {
    nullable: false,
  })
  paciente: Paciente;
}
