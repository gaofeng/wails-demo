import { Buffer } from 'buffer'
import { FC } from '../codes/index'
import WriteMultipleCoilsRequestBody from '../request/write-multiple-coils'
import ModbusWriteResponseBody from './write-response.body'

/** WriteMultipleCoils Response Body (Function Code 0x0f)
 * @extends ModbusResponseBody
 * @class
 */
export default class WriteMultipleCoilsResponseBody extends ModbusWriteResponseBody {

  get start () {
    return this._start
  }

  get quantity () {
    return this._quantity
  }

  get count () {
    return this.quantity
  }

  get byteCount () {
    return 5
  }

  /** Create WriteMultipleCoilsResponseBody from Request
   * @param {WriteMultipleCoilsRequestBody} request
   * @param {Buffer} coil
   * @returns WriteMultipleCoilsResponseBody
   */
  public static fromRequest (requestBody: WriteMultipleCoilsRequestBody) {
    const start = requestBody.address
    const quantity = requestBody.quantity

    return new WriteMultipleCoilsResponseBody(start, quantity)
  }

  public static fromBuffer (buffer: Buffer) {
    const fc = buffer.readUInt8(0)
    const start = buffer.readUInt16BE(1)
    const quantity = buffer.readUInt16BE(3)

    if (fc !== FC.WRITE_MULTIPLE_COILS) {
      return null
    }

    return new WriteMultipleCoilsResponseBody(start, quantity)
  }
  public _start: number
  public _quantity: number

  constructor (start: number, quantity: number) {
    super(FC.WRITE_MULTIPLE_COILS)
    this._start = start
    this._quantity = quantity
  }

  public createPayload () {
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt16BE(this._start, 1)
    payload.writeUInt16BE(this._quantity, 3)

    return payload
  }
}
