import {Model, model, property} from '@loopback/repository';

@model()
export class ConductorLogica extends Model {

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
  estado: string;

  @property({
    type: 'date',
    required: true,
  })
  fechaNacimiento: string;

  @property({
    type: 'string',
    required: true,
  })
  documentoIdentidad: string;

  @property({
    type: 'string',
    required: true,
  })
  estadoServicio: string;

  @property({
    type: 'string',
    required: true,
  })
  placa: string;

  @property({
    type: 'string',
    required: true,
  })
  marca: string;

  @property({
    type: 'string',
    required: true,
  })
  modelo: string;

  @property({
    type: 'string',
    required: true,
  })
  soat: string;

  @property({
    type: 'string',
    required: true,
  })
  tecno: string;

  @property({
    type: 'number',
    required: true,
  })
  barrioId: number;

  constructor(data?: Partial<ConductorLogica>) {
    super(data);
  }
}

export interface ConductorLogicaRelations {
  // describe navigational properties here
}

export type ConductorLogicaWithRelations = ConductorLogica & ConductorLogicaRelations;
