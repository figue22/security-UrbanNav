import {Entity, belongsTo, hasMany, model, property} from '@loopback/repository';
import {Login} from './login.model';
import {Rol} from './rol.model';

@model()
export class Usuario extends Entity {
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
  correo: string;

  @property({
    type: 'string',
  })
  clave?: string;

  @hasMany(() => Login)
  logins: Login[];

  @belongsTo(() => Rol)
  rolId: string;

  constructor(data?: Partial<Usuario>) {
    super(data);
  }
}

export interface UsuarioRelations {
  // describe navigational properties here
}

export type UsuarioWithRelations = Usuario & UsuarioRelations;
