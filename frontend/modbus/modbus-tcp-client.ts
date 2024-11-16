
import MBClient from './modbus-client'
import { DuplexStream } from './DuplexStream'
import MBTCPClientRequestHandler from './tcp-client-request-handler'
import ModbusTCPClientResponseHandler from './tcp-client-response-handler'
import ModbusTCPRequest from './tcp-request'
// import ModbusTCPResponse from './tcp-response'

/** This client must be initiated with a net.Socket object. The module does not handle reconnections
 * or anything related to keep the connection up in case of an unplugged cable or a closed server. See
 * the node-net-reconnect module for these issues.
 * @extends MBClient
 * @class
 * @example <caption>Create new Modbus/TCP Client</caption>
 * const net = require('net')
 * const socket = new net.Socket()
 * const client = new Modbus.tcp.Client(socket)
 *
 * socket.connect({'host' : hostname, 'port' : 502 })
 *
 * socket.on('connect', function () {
 *
 *  client.readCoils(...)
 *
 * })
 *
 */
export default class ModbusTCPClient extends MBClient<DuplexStream, ModbusTCPRequest> {
  protected _requestHandler: MBTCPClientRequestHandler
  protected _responseHandler: ModbusTCPClientResponseHandler
  protected readonly _unitId: number
  protected readonly _timeout: number

  /**
   * Creates a new Modbus/TCP Client.
   * @param {Socket} socket The TCP Socket.
   * @param {number} [unitId=1] Unit ID
   * @param {number} [timeout=5000] Timeout for requests in ms.
   * @memberof ModbusTCPClient
   */
  constructor (socket: DuplexStream, unitId: number = 1, timeout: number = 5000) {
    super(socket)

    this._requestHandler = new MBTCPClientRequestHandler(socket, unitId, timeout)
    this._responseHandler = new ModbusTCPClientResponseHandler()

    this._unitId = unitId
    this._timeout = timeout
  }

  get slaveId () {
    return this._unitId
  }

  get unitId () {
    return this._unitId
  }
}
