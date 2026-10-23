import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Atendimento } from './atendimento.entity.js';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 20, nullable: true })
  telefone: string | null;

  @Column({ length: 50, unique: true })
  identificador: string;

  @OneToMany(() => Atendimento, (atendimento) => atendimento.paciente)
  atendimentos: Atendimento[];
}
