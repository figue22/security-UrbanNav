import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {Credenciales, FactorDeAutenticacionPorCodigo, Usuario} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
const jwt = require('jsonwebtoken');
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository)
    public repositorioUsuario: UsuarioRepository,

    @repository(LoginRepository)
    public repositorioLogin: LoginRepository,
  ) { }

  /**
   * Metodo que sirve para crear una clave aleatoria.
   * @returns cadena aleatoria de n caracteres
   */
  crearTextoAleatorio(n: number): string {
    const clave = generator.generate({
      length: n,
      numbers: true,
    });
    return clave;
  }

  /**
   * Cifrar una cadena con metodo md5
   * @param cadena texto a cifrar
   * @returns cadena cifrada con md5
   */

  cifrarTexto(cadena: string): string {
    const cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

  /**
   * Se busca un usuario por sus credenciales de acceso
   * @param credenciales crdenciales del usuario
   * @returns usuario encontrado o null
   */

  async identificarUsuario(
    credenciales: Credenciales,
  ): Promise<Usuario | null> {
    const usuario = await this.repositorioUsuario.findOne({
      where: {
        correo: credenciales.correo,
        clave: credenciales.clave,
      },
    });
    return usuario as Usuario;
  }

  /**
   * Valida un codigo de 2fa para un usuario
   * @param credenciales2fa credenciales del usuario con el codigo del 2fa
   * @returns un usuario o null
   */
  async validarCodigo2fa(
    credenciales2fa: FactorDeAutenticacionPorCodigo,
  ): Promise<Usuario | null> {
    const login = await this.repositorioLogin.findOne({
      where: {
        usuarioId: credenciales2fa.usuarioId,
        codigo2fa: credenciales2fa.codigo2fa,
        estadoCodigo2fa: false,
      },
    });
    if (login) {
      const usuario = await this.repositorioUsuario.findById(
        credenciales2fa.usuarioId,
      );
      return usuario;
    }
    return null;
  }

  /**
   * Generacion del jwt
   * @param usuario informacion del usuario
   * @returns token
   */
  crearToken(usuario: any, usuarioLogica: any): string {
    const datos = {
      name: `${usuarioLogica.primerNombre}`,
      role: `${usuario.rolId}`,
      email: `${usuario.correo}`,
      idMongoDB: `${usuarioLogica.idMongoDB}`
    };
    const token = jwt.sign(datos, ConfiguracionSeguridad.claveJWT);
    return token;
  }

  /**
   *Valida y obtiene el rol de un token
   * @param tk el token
   * @returns el _id del rol
   */
  obtenerRolDesdeToken(tk: string): string {
    const obj = jwt.verify(tk, ConfiguracionSeguridad.claveJWT);
    return obj.role;
  }

  /**
   *
   * @param correo el correo del usuario
   * @returns una cadena aleatoria de 6 caracteres
   */
  async recuperarContrasena(correo: string): Promise<string> {
    const clave = this.crearTextoAleatorio(6);
    const claveCifrada = this.cifrarTexto(clave);
    await this.repositorioUsuario.updateAll(
      {clave: claveCifrada},
      {correo: correo},
    );
    return claveCifrada;
  }


  /**
   *
   * @param mongoId el mongoID del admin
   * @param usuarioLogica el admin que se va a crear la logica
   * @returns el admin creado en la logica
   */
  async crearAdministradorLogica(mongoId: string, usuarioLogica: any) {
    console.log({
      mongoId,
      usuarioLogica
    })
    const administradorLogica = {
      primerNombre: usuarioLogica.primerNombre,
      segundoNombre: usuarioLogica.segundoNombre,
      primerApellido: usuarioLogica.primerApellido,
      segundoApellido: usuarioLogica.segundoApellido,
      idMongoDB: mongoId
    }
    const response = await axios.post(`${ConfiguracionSeguridad.urlMicroservicioLogica}/administrador`, administradorLogica)
    return response.data
  }

  /**
   *
   * @param mongoId el mongoID del cliente
   * @param usuarioLogica  el cliente que se va a crear la logica
   * @returns el cliente creado en la logica
   */
  async crearClienteLogica(mongoId: string, usuarioLogica: any) {
    console.log({
      mongoId,
      usuarioLogica
    })
    const clienteLogica = {
      primerNombre: usuarioLogica.primerNombre,
      segundoNombre: usuarioLogica.segundoNombre,
      primerApellido: usuarioLogica.primerApellido,
      segundoApellido: usuarioLogica.segundoApellido,
      celular: usuarioLogica.celular,
      urlFoto: usuarioLogica.urlFoto,
      correoPanico: usuarioLogica.correoPanico,
      fechaNacimiento: usuarioLogica.fechaNacimiento,
      estado: usuarioLogica.estado,
      descripcion: usuarioLogica.estado,
      idMongoDB: mongoId
    }
    const response = await axios.post(`${ConfiguracionSeguridad.urlMicroservicioLogica}/cliente`, clienteLogica)
    return response.data
  }

  /**
   *
   * @param mongoId el mongoID del conductor
   * @param usuarioLogica  el conductor que se va a crear la logica
   * @returns  el conductor creado en la logica
   */
  async crearConductorLogica(mongoId: string, usuarioLogica: any) {
    console.log({
      mongoId,
      usuarioLogica
    })
    //crear el vehiculo
    const vehiculo = {
      placa: usuarioLogica.placa,
      marca: usuarioLogica.marca,
      modelo: usuarioLogica.modelo,
      soat: usuarioLogica.soat,
      tecno: usuarioLogica.tecno,
    }

    const vehiculoCreado = await axios.post(`${ConfiguracionSeguridad.urlMicroservicioLogica}/vehiculo`, vehiculo)

    //crear el conductor
    const conductorLogica = {
      primerNombre: usuarioLogica.primerNombre,
      segundoNombre: usuarioLogica.segundoNombre,
      primerApellido: usuarioLogica.primerApellido,
      segundoApellido: usuarioLogica.segundoApellido,
      celular: usuarioLogica.celular,
      estado: usuarioLogica.estado,
      urlFoto: usuarioLogica.urlFoto,
      fechaNacimiento: usuarioLogica.fechaNacimiento,
      documentoIdentidad: usuarioLogica.documentoIdentidad,
      estadoServicio: usuarioLogica.estadoServicio,
      idMongoDB: mongoId,
      vehiculoId: vehiculoCreado.data.idVehiculo,
      barrioId: usuarioLogica.barrioId
    }

    const response = await axios.post(`${ConfiguracionSeguridad.urlMicroservicioLogica}/conductor`, conductorLogica)
    return response.data;

  }

  /**
   *
   * @param id el id de Mongo del usuario a buscar en lógica
   * @param rol el rol del usuario a buscar en lógica (ADMINISTRADOR, CLIENTE, CONDUCTOR)
   * @returns la información del usuario en lógica
   */
  async obtenerInformacionUsuarioEnLogica(id: string, rol: string) {
    console.log(id, rol)
    //TODO: HACER UNA LLAMADA A LÓGICA PARA OBTENER LA INFORMACION DE UN USUARIO POR SU IDMONGO
    if (rol === "CLIENTE") {
      const response = await axios.get(`${ConfiguracionSeguridad.urlMicroservicioLogica}/cliente/mongo/${id}`)
      return response.data
    }
    if (rol === "CONDUCTOR") {
      const response = await axios.get(`${ConfiguracionSeguridad.urlMicroservicioLogica}/conductor/mongo/${id}`)
      return response.data
    }
    if (rol === "ADMINISTRADOR") {
      const response = await axios.get(`${ConfiguracionSeguridad.urlMicroservicioLogica}/administrador/mongo/${id}`)
      return response.data
    }
  }

  /**
   *
   * @param usuarios los usuarios a los que se les va a obtener la información en lógica
   * @returns  los usuarios con la información en lógica
   */
  async obtenerInformacionUsuariosEnLogica(usuarios: Usuario[]) {

    let usuariosCompletos = usuarios.map(async (usuario) => {

      if (usuario.rolId == ConfiguracionSeguridad.idClienteRol) {
        const usuarioLogica = await this.obtenerInformacionUsuarioEnLogica(
          usuario._id!,
          "CLIENTE"
        )
        return {
          usuario,
          usuarioLogica: usuarioLogica ? usuarioLogica : null
        }
      }

      if (usuario.rolId == ConfiguracionSeguridad.idConductorRol) {
        const usuarioLogica = await this.obtenerInformacionUsuarioEnLogica(
          usuario._id!,
          "CONDUCTOR"
        )

        return {
          usuario,
          usuarioLogica: usuarioLogica ? usuarioLogica : null
        }
      }

      if (usuario.rolId == ConfiguracionSeguridad.idAdminRol) {
        const usuarioLogica = await this.obtenerInformacionUsuarioEnLogica(
          usuario._id!,
          "ADMINISTRADOR"
        )
        return {
          usuario,
          usuarioLogica: usuarioLogica ? usuarioLogica : null
        }
      }

    })

    return Promise.all(usuariosCompletos)

  }
}
