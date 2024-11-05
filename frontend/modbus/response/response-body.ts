
import { Buffer } from 'buffer'
import { FunctionCode, isFunctionCode } from '../codes'
import ModbusRequestBody from '../request/request-body'

/** Modbus Response Body
 * @abstract
 */
export default abstract class ModbusBaseResponseBody {

  /** Function Code */
  get fc () {
    return this._fc
  }

  /** Number of bytes for the payload.  */
  abstract get byteCount (): number;

  get isException (): boolean {
    return false
  }

  public static fromRequest (requestBody: ModbusRequestBody, buf: Buffer): any {
    throw new TypeError('Cannot call from request from abstract class')
  }
  protected _fc: FunctionCode

  /** Create new ModbusResponseBody
   * @param {FunctionCode} fc Function Code
   * @throws {InvalidFunctionCode}
   */
  constructor (fc: FunctionCode, ignoreInvalidFunctionCode = false) {
    if (ignoreInvalidFunctionCode === false) {
      if (!isFunctionCode(fc)) {
        throw Error('InvalidFunctionCode')
      }
    }

    this._fc = fc
  }

  /** Create payload to be send over a socket.
   * @returns {Buffer}
   */
  public abstract createPayload (): Buffer

}
