import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Variables} from '../models';
import {VariablesRepository} from '../repositories';

export class VariablesController {
  constructor(
    @repository(VariablesRepository)
    public variablesRepository : VariablesRepository,
  ) {}

  @post('/variable')
  @response(200, {
    description: 'Variables model instance',
    content: {'application/json': {schema: getModelSchemaRef(Variables)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Variables, {
            title: 'NewVariables',
            exclude: ['_id'],
          }),
        },
      },
    })
    variable: Variables,
  ): Promise<any> {

    let variableExistente = await this.variablesRepository.findOne({where: {nombreVariable: variable.nombreVariable}});
    console.log(variableExistente)

    // si ya existe la variable, no se crea, se actualiza
    if(variableExistente){
      let variableActualizada = await this.variablesRepository.updateById(variableExistente._id!, variable);
      return variableActualizada;
    } else {
      // si no existe, se crea
      variable = await this.variablesRepository.create(variable);
      return variable;
    }
  }

  @get('/variable/count')
  @response(200, {
    description: 'Variables model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Variables) where?: Where<Variables>,
  ): Promise<Count> {
    return this.variablesRepository.count(where);
  }

  @get('/variable')
  @response(200, {
    description: 'Array of Variables model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Variables, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Variables) filter?: Filter<Variables>,
  ): Promise<Variables[]> {
    return this.variablesRepository.find(filter);
  }

  @patch('/variable')
  @response(200, {
    description: 'Variables PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Variables, {partial: true}),
        },
      },
    })
    variables: Variables,
    @param.where(Variables) where?: Where<Variables>,
  ): Promise<Count> {
    return this.variablesRepository.updateAll(variables, where);
  }

  @get('/variable/{id}')
  @response(200, {
    description: 'Variables model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Variables, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Variables, {exclude: 'where'}) filter?: FilterExcludingWhere<Variables>
  ): Promise<Variables> {
    return this.variablesRepository.findById(id, filter);
  }

  @patch('/variable/{id}')
  @response(204, {
    description: 'Variables PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Variables, {partial: true}),
        },
      },
    })
    variables: Variables,
  ): Promise<void> {
    await this.variablesRepository.updateById(id, variables);
  }

  @put('/variable/{id}')
  @response(204, {
    description: 'Variables PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() variables: Variables,
  ): Promise<void> {
    await this.variablesRepository.replaceById(id, variables);
  }

  @del('/variable/{id}')
  @response(204, {
    description: 'Variables DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.variablesRepository.deleteById(id);
  }
}
