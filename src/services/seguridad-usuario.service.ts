import { /* inject, */ BindingScope, injectable} from '@loopback/core';
var generator = require('generate-password');
const MD5 = require("crypto-js/md5");

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */

  /**
   * Metodo que sirve para crear una clave aleatoria.
   * @returns cadena aleatoria de n caracteres
   */

  crearClave(): string {
    let clave = generator.generate({
      length: 10,
      numbers: true
    });
    return clave
  }

  /**
  * Cifrar una cadena con metodo md5
  * @param cadena texto a cifrar
  * @returns cadena cifrada con md5
  */

  cifrarTexto(cadena: string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada
  }
}



