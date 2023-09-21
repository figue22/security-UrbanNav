import {Entity, model, property} from '@loopback/repository';

@model()
export class Variables extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nombreVariable: string;

  @property({
    type: 'string',
    required: true,
  })
  valorVariable: string;


  constructor(data?: Partial<Variables>) {
    super(data);
  }
}

export interface VariablesRelations {
  // describe navigational properties here
}

export type VariablesWithRelations = Variables & VariablesRelations;
