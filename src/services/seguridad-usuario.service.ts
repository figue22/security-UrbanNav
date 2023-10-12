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
  /*
   * Add service methods here
   */

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

  async recuperarContrasena(correo: string): Promise<string> {
    const clave = this.crearTextoAleatorio(6);
    const claveCifrada = this.cifrarTexto(clave);
    await this.repositorioUsuario.updateAll(
      {clave: claveCifrada},
      {correo: correo},
    );
    return claveCifrada;
  }

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
    const response = await axios.post("http://localhost:3000/administrador", administradorLogica)
    return response.data
  }

  async obtenerInformacionUsuarioEnLogica(id: string, rol: string) {
    console.log("entroooooooooooooo")
    //TODO: HACER UNA LLAMADA A LÓGICA PARA OBTENER LA INFORMACION DE UN USUARIO POR SU IDMONGO
    if (rol === "CLIENTE") {
      const response = await axios.get(`http://localhost:3000/cliente/mongo/${id}`)
      return response.data
    }
    if (rol === "CONDUCTOR") {
      const response = await axios.get(`http://localhost:3000/conductor/mongo/${id}`)
      return response.data
    }
    if (rol === "ADMINISTRADOR") {
      const response = await axios.get(`http://localhost:3000/administrador/mongo/${id}`)
      return response.data
    }
  }

  async obtenerInformacionUsuariosEnLogica(usuarios: Usuario[]) {

    let idRolCliente = "65243b86591891311c031c97"
    let idRolConductor = "65243b9b591891311c031c98"
    let idRolAdministrador = "65145f6950ef6641e8e8d370"

    let usuariosCompletos = usuarios.map(async (usuario) => {

      if (usuario.rolId == idRolCliente) {
        const usuarioLogica = await this.obtenerInformacionUsuarioEnLogica(
          usuario._id!,
          "CLIENTE"
        )
        return {
          usuario,
          usuarioLogica: usuarioLogica ? usuarioLogica : null
        }
      }

      if (usuario.rolId == idRolConductor) {
        const usuarioLogica = await this.obtenerInformacionUsuarioEnLogica(
          usuario._id!,
          "CONDUCTOR"
        )

        return {
          usuario,
          usuarioLogica: usuarioLogica ? usuarioLogica : null
        }
      }

      if (usuario.rolId == idRolAdministrador) {
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
