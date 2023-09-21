import {Entity, model, property} from '@loopback/repository';

@model()
export class Login extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  codigo2fa?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  estadoCodigo: boolean;

  @property({
    type: 'string',
  })
  token?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  estadoToken: boolean;


  constructor(data?: Partial<Login>) {
    super(data);
  }
}

export interface LoginRelations {
  // describe navigational properties here
}

export type LoginWithRelations = Login & LoginRelations;
