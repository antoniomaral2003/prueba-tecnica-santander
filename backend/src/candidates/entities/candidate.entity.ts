import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('candidates')
export class Candidate {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    surname: string;

    @Column({
        type: 'varchar',
        length: 50,
        enum: ['junior', 'senior']
    })
    seniority: string;

    @Column({ type: 'int' })
    years: number;

    @Column({ type: 'boolean', default: true})
    availability: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}