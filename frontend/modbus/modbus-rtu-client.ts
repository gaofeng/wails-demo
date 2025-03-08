
import MBClient from './modbus-client'
import ModbusRTUClientRequestHandler from './rtu-client-request-handler'
import ModbusRTUClientResponseHandler from './rtu-client-response-handler'

import ModbusRTURequest from './rtu-request'
// import ModbusRTUResponse from './rtu-response'
import { DuplexStream } from './DuplexStream'

/** This Client must be initiated with a socket object that implements the event emitter
 * interface and fires a 'data' event with a buffer as a parameter. It also needs to
 * implement the 'write' method to send data to the socket.
 *
 * @example <caption>Create new Modbus/RTU Client</caption>
 * const Modbus = require('jsmodbus')
 * const SerialPort = require('serialport')
 * const socket = new SerialPort("/dev/tty/ttyUSB0", { "baudRate: 57600" })
 * const client = new Modbus.client.RTU(socket, address)
 *
 * @extends MBClient
 * @class
 */
export default class ModbusRTUClient extends MBClient<DuplexStream, ModbusRTURequest> {
  protected _requestHandler: ModbusRTUClientRequestHandler
  protected _responseHandler: ModbusRTUClientResponseHandler

  /** Creates a new Modbus/RTU Client.
   * @param {SerialPort} socket The serial Socket.
   * @param {number} address The address of the serial client.
   * @param {number} [timeout=5000]
   */
  constructor (socket: DuplexStream, address: number, timeout = 5000) {
    super(socket)

    this._requestHandler = new ModbusRTUClientRequestHandler(socket, address, timeout)
    this._responseHandler = new ModbusRTUClientResponseHandler()
  }

  public get slaveId () {
    return this._requestHandler.address
  }

  public get unitId () {
    return this._requestHandler.address
  }

}
