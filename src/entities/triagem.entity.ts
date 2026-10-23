import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Profissional } from './profissional.entity.js';
import { Atendimento } from './atendimento.entity.js';

@Entity('triagens')
export class Triagem {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'data_hora' })
  dataHora: Date;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @ManyToOne(() => Profissional, { nullable: false })
  profissional: Profissional;

  @OneToOne(() => Atendimento, { nullable: false })
  @JoinColumn({ name: 'atendimento_id' })
  atendimento: Atendimento;
}
