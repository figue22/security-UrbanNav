import {authenticate} from '@loopback/authentication';
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
import axios from 'axios';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {
  AdministradorLogica,
  ClienteLogica,
  ConductorLogica,
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
  ) { }

  //? USUARIO NORMAL (NO ADMIN, NO CLIENTE, NO CONDUCTOR) <---- No usar
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
  }

  @post('/usuario/verificar-token')
  @response(200, {
    description: 'Usuario model instance',
  })
  async verificarToken(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {
                type: 'string',
              }
            }
          }
        }
      }
    })
    data: any,
  ): Promise<any> {
    console.log(data.token)
    const resp = await this.servicioSeguridad.verificarToken(data.token)
    return resp
  }



  @post('/usuario/admin')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(AdministradorLogica)}},
  })
  async createAdmin(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AdministradorLogica)
        }
      }
    })
    usuario: AdministradorLogica,
  ): Promise<any> {
    console.log("USUARIO", usuario)
    // crear la clave}
    const clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    //cifrar la clave
    const claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    //asignar la clave cifrada al usuario
    usuario.clave = claveCifrada;
    //enviar correo electronico de notificacion
    const usuarioCreado = await this.usuarioRepository.create({
      correo: await this.servicioSeguridad.verificarCorreo(usuario.correo),
      clave: usuario.clave,
      rolId: ConfiguracionSeguridad.idAdminRol
    });

    const usuarioLogica = await this.servicioSeguridad.crearAdministradorLogica(usuarioCreado._id!, usuario)

    //Llamar a notrificaciones para enviar correo de bienvenida y contraseña
    axios.post('http://localhost:8080/enviar-correo', {
      to: usuario.correo,
      name: usuarioLogica.primerNombre,
      content: `Bienvenido a UrbanNav, tu clave es: ${clave}`,
      subject: "Bienvenido a UrbanNav"
    })

    return {
      usuario: usuarioCreado,
      usuarioLogica
    }
  }

  @post('/usuario/cliente')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(ClienteLogica)}},
  })
  async createCliente(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClienteLogica)
        }
      }
    })
    usuario: ClienteLogica,
  ): Promise<any> {
    console.log("USUARIO", usuario)
    // crear la clave}
    const clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    //cifrar la clave
    const claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    //asignar la clave cifrada al usuario
    usuario.clave = claveCifrada;
    //enviar correo electronico de notificacion
    const usuarioCreado = await this.usuarioRepository.create({
      correo: await this.servicioSeguridad.verificarCorreo(usuario.correo),
      clave: usuario.clave,
      rolId: ConfiguracionSeguridad.idClienteRol
    });

    const usuarioLogica = await this.servicioSeguridad.crearClienteLogica(usuarioCreado._id!, usuario)

    //Llamar a notrificaciones para enviar correo de bienvenida y contraseña
    axios.post('http://localhost:8080/enviar-correo', {
      to: usuario.correo,
      name: usuarioLogica.primerNombre,
      content: `Bienvenido a UrbanNav, tu clave es: ${clave}`,
      subject: "Bienvenido a UrbanNav"
    })

    return {
      usuario: usuarioCreado,
      usuarioLogica
    }
  }

  @post('/usuario/conductor')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(ConductorLogica)}},
  })
  async createConductor(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ConductorLogica)
        }
      }
    })
    usuario: ConductorLogica,
  ): Promise<any> {
    console.log("USUARIO", usuario)
    // crear la clave}
    const clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    //cifrar la clave
    const claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    //asignar la clave cifrada al usuario
    usuario.clave = claveCifrada;
    //enviar correo electronico de notificacion
    const usuarioCreado = await this.usuarioRepository.create({
      correo: await this.servicioSeguridad.verificarCorreo(usuario.correo),
      clave: usuario.clave,
      rolId: ConfiguracionSeguridad.idConductorRol
    });

    const usuarioLogica = await this.servicioSeguridad.crearConductorLogica(usuarioCreado._id!, usuario)

    //Llamar a notrificaciones para enviar correo de bienvenida y contraseña
    axios.post('http://localhost:8080/enviar-correo', {
      to: usuario.correo,
      name: usuarioLogica.primerNombre,
      content: `Bienvenido a UrbanNav, tu clave es: ${clave}`,
      subject: "Bienvenido a UrbanNav"
    })

    return {
      usuario: usuarioCreado,
      usuarioLogica
    }
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
  ): Promise<any[]> {

    let usuarios = await this.usuarioRepository.find(filter);
    let usuariosCompletos = await this.servicioSeguridad.obtenerInformacionUsuariosEnLogica(usuarios)

    return usuariosCompletos;
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
  ): Promise<any> {
    const usuario = await this.usuarioRepository.findById(id, filter);

    if (usuario.rolId == ConfiguracionSeguridad.idClienteRol) {
      const usuarioEnLogica = await this.servicioSeguridad.obtenerInformacionUsuarioEnLogica(usuario._id!, "CLIENTE")
      return {
        usuario,
        usuarioEnLogica
      }
    }

    if (usuario.rolId == ConfiguracionSeguridad.idConductorRol) {
      const usuarioEnLogica = await this.servicioSeguridad.obtenerInformacionUsuarioEnLogica(usuario._id!, "CONDUCTOR")
      return {
        usuario,
        usuarioEnLogica
      }
    }

    if (usuario.rolId == ConfiguracionSeguridad.idAdminRol) {
      const usuarioEnLogica = await this.servicioSeguridad.obtenerInformacionUsuarioEnLogica(usuario._id!, "ADMINISTRADOR")
      return {
        usuario,
        usuarioEnLogica
      }
    }
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
      //TODO: notificar al usuario
      //llamar al microservicio de notificaciones para enviar el codigo2fa
      axios.post('http://localhost:8080/enviar-correo', {
        to: usuario.correo,
        name: "Amig@",
        content: `El código de verificación de UrbanNav es: ${codigo2fa}`,
        subject: "Código de verificación UrbanNav"
      })

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
      console.log(usuario)
      let usuarioLogica = null

      if (usuario.rolId == ConfiguracionSeguridad.idClienteRol) {
        usuarioLogica = await this.servicioSeguridad.obtenerInformacionUsuarioEnLogica(usuario._id!, "CLIENTE")
      }
      if (usuario.rolId == ConfiguracionSeguridad.idConductorRol) {
        usuarioLogica = await this.servicioSeguridad.obtenerInformacionUsuarioEnLogica(usuario._id!, "CONDUCTOR")
      }
      if (usuario.rolId == ConfiguracionSeguridad.idAdminRol) {
        usuarioLogica = await this.servicioSeguridad.obtenerInformacionUsuarioEnLogica(usuario._id!, "ADMINISTRADOR")
      }

      console.log("--- usuario en lógica ---------")
      console.log(usuarioLogica)

      const token = this.servicioSeguridad.crearToken(usuario, usuarioLogica);
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

        return {
          user: usuario,
          usuarioLogica,
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
      //Llamar a notrificaciones para enviar correo con la nueva contraseña
      axios.post('http://localhost:8080/enviar-correo', {
        to: recuperacionClave.correo,
        name: "Amig@",
        content: `Tu nueva clave es: ${nuevaClave}`,
        subject: "Nueva clave UrbanNav"
      })

      return {
        mensaje: `La nueva clave ha sido generada, usuario: ${usuarioEncontrado.correo}`,
        nuevaClave
      };
    }
    return new HttpErrors[401]('No existe un usuario con el correo definido');
  }
}
