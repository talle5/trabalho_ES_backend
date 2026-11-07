import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Atendimento } from './atendimento.entity.js';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @Column({ length: 50, unique: true })
  identificador: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  email: string | null;

  // select: false impede que o hash apareça em listagens e na fila
  @Column({
    name: 'senha_hash',
    type: 'varchar',
    length: 100,
    nullable: true,
    select: false,
  })
  senhaHash: string | null;

  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endereco: string | null;

  @OneToMany(() => Atendimento, (atendimento) => atendimento.paciente)
  atendimentos: Atendimento[];
}
