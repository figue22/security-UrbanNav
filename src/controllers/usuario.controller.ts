import {authenticate} from '@loopback/authentication/dist/decorators';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {
  Credenciales,
  FactorDeAutenticacionPorCodigo,
  Login,
  RecuperacionClave,
  Usuario,
} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
import {SeguridadUsuarioService} from '../services';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(SeguridadUsuarioService)
    public servicioSeguridad: SeguridadUsuarioService,
    @repository(LoginRepository)
    public loginRepository: LoginRepository,
  ) {}

  @post('/usuario')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    // crear la clave}
    const clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    //cifrar la clave
    const claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    //asignar la clave cifrada al usuario
    usuario.clave = claveCifrada;
    //enviar correo electronico de notificacion
    return this.usuarioRepository.create(usuario);

    let idRolCliente = "65243b86591891311c031c97"
    let idRolConductor = "65243b9b591891311c031c98"
    let idRolAdministrador = "65145f6950ef6641e8e8d370"

    if(usuario.rolId=== idRolCliente) {

    }
    if(usuario.rolId=== idRolConductor) {

    }
    if(usuario.rolId=== idRolAdministrador) {

    }


    //TODO: CREAR EL USUARIO EN EL MICROSERVICIO DE LÓGICA
    //? LLAMAR AL MICROSERVICIO DE LÓGICA Y CREARLO ALLÁ TAMBIÉN
  }

  @get('/usuario/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Usuario) where?: Where<Usuario>): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @authenticate({
    strategy: 'auth',
    options: [
      ConfiguracionSeguridad.menuUsuarioId,
      ConfiguracionSeguridad.listarAccion,
    ],
  })
  @get('/usuario')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    //TODO: LLAMAR AL MICROSERVICIO DE LÓGICA PARA OBTENER LA INFO DE TODOS
    //? LOS USUARIOS
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuario')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuario/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'})
    filter?: FilterExcludingWhere<Usuario>,
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuario/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuario/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuario/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }
  /**
   * Metodos personalizados para la API
   */

  @post('/identificar-usuario')
  @response(200, {
    description: 'Identificar un usuario por correo y clave',
    content: {'application/json': {schema: getModelSchemaRef(Credenciales)}},
  })
  async indentificarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credenciales),
        },
      },
    })
    credenciales: Credenciales,
  ): Promise<object> {
    const usuario =
      await this.servicioSeguridad.identificarUsuario(credenciales);
    if (usuario) {
      const codigo2fa = this.servicioSeguridad.crearTextoAleatorio(5);
      const login: Login = new Login();
      login.usuarioId = usuario._id!;
      login.codigo2fa = codigo2fa;
      login.estadoCodigo2fa = false;
      login.token = '';
      login.estadoToken = false;
      await this.loginRepository.create(login);
      usuario.clave = '';
      //notificar al usuario via sms

      return usuario;
    }
    return new HttpErrors[401]('Credenciales incorrectas');
  }

  @post('/verificar-2fa')
  @response(200, {
    description: 'Validar un codigo de 2fa',
  })
  async verificarCodigo2fa(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FactorDeAutenticacionPorCodigo),
        },
      },
    })
    credenciales: FactorDeAutenticacionPorCodigo,
  ): Promise<object> {
    const usuario = await this.servicioSeguridad.validarCodigo2fa(credenciales);
    if (usuario) {
      //TODO: LLAMAR AL MICROSERVICIO DE LÓGICA PARA OBTENER LA INFO DEL USUARIO
      //? Y QUE EL TOKEN TENGA TODA LA INFO DEL USUARIO
      const token = this.servicioSeguridad.crearToken(usuario);
      if (usuario) {
        usuario.clave = '';
        try {
          await this.usuarioRepository.logins(usuario._id).patch(
            {
              estadoCodigo2fa: true,
              token: token,
            },
            {
              estadoCodigo2fa: false,
            },
          );
        } catch {
          console.log(
            'No se ha almacenado el cambio del estado de token en la db',
          );
        }

        //TODO: LLAMAR AL MICROSERVICIO DE LÓGICA PARA OBTENER LA INFO DEL USUARIO

        return {
          user: usuario,
          token: token,
        };
      }
    }
    return new HttpErrors[401](
      'Codigo de 2fa invalido para el usuario definido',
    );
  }

  //Recuperar clave
  @post('/recuperar-clave')
  @response(200, {
    description: 'Recuperar clave de un usuario',
  })
  async recuperarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RecuperacionClave),
        },
      },
    })
    recuperacionClave: RecuperacionClave,
  ): Promise<object> {
    const usuarioEncontrado = await this.usuarioRepository.findOne({
      where: {
        correo: recuperacionClave.correo,
      },
    });
    if (usuarioEncontrado) {
      const nuevaClave = await this.servicioSeguridad.recuperarContrasena(
        usuarioEncontrado.correo,
      );
      //TODO: enviar correo electronico con la nueva clave al usuario
      return {
        mensaje: `La nueva clave ha sido generada, usuario: ${usuarioEncontrado.correo}`,
        nuevaClave
      };
    }
    return new HttpErrors[401]('No existe un usuario con el correo definido');
  }
}
