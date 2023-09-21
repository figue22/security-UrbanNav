import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Variables, VariablesRelations} from '../models';

export class VariablesRepository extends DefaultCrudRepository<
  Variables,
  typeof Variables.prototype._id,
  VariablesRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Variables, dataSource);
  }
}
