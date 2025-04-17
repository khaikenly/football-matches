import { omit } from 'lodash';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { convertPropsToObject } from '@/utils';

export abstract class AbstractEntity<TEntity> extends BaseEntity {
  constructor(partial?: Partial<TEntity>) {
    super();
    if (partial) Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column('uuid', {
    unique: true,
  })
  uuid: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date;

  getProps() {
    const clone = {
      ...omit(this, ['id']),
    };
    return Object.freeze(clone);
  }

  toObject() {
    const clone = convertPropsToObject(this.getProps());

    const result = {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...clone,
    };
    return Object.freeze(result);
  }
}
