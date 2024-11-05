import { Buffer } from 'buffer'
import BufferUtils from '../buffer-utils'
import { FC } from '../codes/index'
import { BooleanArray } from '../constants/index'
import ReadDiscreteInputsRequestBody from '../request/read-discrete-inputs'
import UserRequest from '../user-request'
import ModbusReadResponseBody from './read-response-body'

const {
  bufferToArrayStatus,
  arrayStatusToBuffer
} = BufferUtils

/** Read Discrete Inputs Response Body (Function Code 0x02)
 * @extends ModbusResponseBody
 * @class
 */
export default class ReadDiscreteInputsResponseBody extends ModbusReadResponseBody {

  /** Coils */
  get discrete () {
    return this._discrete
  }

  get valuesAsArray () {
    return this._valuesAsArray
  }

  get valuesAsBuffer () {
    return this._valuesAsBuffer
  }

  /** Length */
  get numberOfBytes () {
    return this._numberOfBytes
  }

  get byteCount () {
    return this._numberOfBytes + 2
  }

  /** Create ReadDiscreteInputsResponseBody from Request
   * @param {ReadDiscreteInputsRequestBody} request
   * @param {Buffer} discreteInputs
   * @returns ReadDiscreteInputsResponseBody
   */
  public static fromRequest (requestBody: ReadDiscreteInputsRequestBody, discreteInputs: Buffer) {
    const discreteStatus = bufferToArrayStatus(discreteInputs)

    const start = requestBody.start
    const end = start + requestBody.count

    // Extract the segment of coils status
    const segmentStatus = discreteStatus.slice(start, end)

    return new ReadDiscreteInputsResponseBody(segmentStatus, Math.ceil(segmentStatus.length / 8))
  }

  /** Create ReadDiscreteInputsResponseBody from Buffer
   * @param {Buffer} buffer
   * @returns ReadDiscreteInputsResponseBody
   */
  public static fromBuffer (buffer: Buffer) {
    try {
      const fc = buffer.readUInt8(0)
      const byteCount = buffer.readUInt8(1)
      const coilStatus = buffer.slice(2, 2 + byteCount)

      if (coilStatus.length !== byteCount) {
        return null
      }

      if (fc !== FC.READ_DISCRETE_INPUT) {
        return null
      }

      return new ReadDiscreteInputsResponseBody(coilStatus, byteCount)
    } catch (e) {
      return null
    }
  }
  protected _valuesAsArray: BooleanArray
  protected _valuesAsBuffer: Buffer
  private _discrete: BooleanArray | Buffer
  private _numberOfBytes: number

  /** Creates a ReadDiscreteInputsResponseBody
   * @param {Array} discrete Array with Boolean values
   * @param {Number} length Quantity of Coils
   */
  constructor (discrete: BooleanArray | Buffer, numberOfBytes: number) {
    super(FC.READ_DISCRETE_INPUT)
    this._discrete = discrete
    this._numberOfBytes = numberOfBytes

    if (discrete instanceof Array) {
      this._valuesAsArray = discrete
      this._valuesAsBuffer = arrayStatusToBuffer(discrete)
    } else if (discrete instanceof Buffer) {
      this._valuesAsBuffer = discrete
      this._valuesAsArray = bufferToArrayStatus(discrete)
    } else {
      throw new Error('InvalidType_MustBeBufferOrArray')
    }
  }

  public createPayload () {
    const payload = Buffer.alloc(this.byteCount)

    payload.writeUInt8(this._fc, 0)
    payload.writeUInt8(this._numberOfBytes, 1)

    this._valuesAsBuffer.copy(payload, 2)

    return payload
  }
}
