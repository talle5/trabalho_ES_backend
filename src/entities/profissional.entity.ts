import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('profissionais')
export class Profissional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 80 })
  cargo: string;

  @Column({ name: 'registro_profissional', length: 50, nullable: true })
  registroProfissional: string | null;
}
