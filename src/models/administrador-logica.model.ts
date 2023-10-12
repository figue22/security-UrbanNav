import {Model, model, property} from '@loopback/repository';

@model()
export class AdministradorLogica extends Model {
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
  correo: string;

  @property({
    type: 'string',
  })
  clave?: string;


  constructor(data?: Partial<AdministradorLogica>) {
    super(data);
  }
}

export interface AdministradorLogicaRelations {
  // describe navigational properties here
}

export type AdministradorLogicaWithRelations = AdministradorLogica & AdministradorLogicaRelations;
