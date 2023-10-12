import {Model, model, property} from '@loopback/repository';

@model()
export class ClienteLogica extends Model {

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
  })
  clave?: string;

  @property({
    type: 'string',
    required: true,
  })
  primerNombre: string;

  @property({
    type: 'string',
  })
  segundoNombre?: string;

  @property({
    type: 'string',
    required: true,
  })
  primerApellido: string;

  @property({
    type: 'string',
  })
  segundoApellido?: string;

  @property({
    type: 'string',
    required: true,
  })
  celular: string;

  @property({
    type: 'string',
  })
  urlFoto?: string;

  @property({
    type: 'string',
    required: true,
  })
  correoPanico: string;

  @property({
    type: 'date',
    required: true,
  })
  fechaNacimiento: string;

  @property({
    type: 'string',
    required: true,
  })
  estado: string;

  @property({
    type: 'string',
  })
  descripcion?: string;


  constructor(data?: Partial<ClienteLogica>) {
    super(data);
  }
}

export interface ClienteLogicaRelations {
  // describe navigational properties here
}

export type ClienteLogicaWithRelations = ClienteLogica & ClienteLogicaRelations;
