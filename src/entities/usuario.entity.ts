import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ name: 'senha_hash', length: 100 })
  senhaHash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cpf: string | null;

  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @Column({ name: 'nome_social', type: 'varchar', length: 100, nullable: true })
  nomeSocial: string | null;

  @Column({ length: 30 })
  matricula: string;

  @Column({ length: 50 })
  funcao: string;

  @Column({ length: 50 })
  setor: string;

  @Column({ length: 100 })
  unidade: string;
}
