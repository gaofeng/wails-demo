import { DuplexStream } from 'app/modbus/DuplexStream';
import { EventsOff, EventsOn } from 'app/wailsjs/runtime/runtime'
import {Buffer} from 'buffer';
import { SendData } from 'app/wailsjs/go/main/SerialManager';

export class SerialStream extends DuplexStream {
  public PortName: string;
  constructor(portName: string) {
    super();
    this.PortName = portName;
  }
  start() {
    const eventName = `serial-data-${this.PortName}`;
    EventsOn(eventName, (base64Str) => {
      try{
        const binaryStr = atob(base64Str);
        const numberArray = [];
        for (let i = 0; i < binaryStr.length; i++) {
          numberArray.push(binaryStr.charCodeAt(i));
        }
        const buf = Buffer.from(numberArray);
        this.emit('data', buf);
      } catch (e) {
        console.error('Error parsing base64', e);
      }
    });
    EventsOn(`serial-error-${this.PortName}`, (error) => {
      this.emit('error', error);
    });
  }
  stop() {
    EventsOff(`serial-data-${this.PortName}`);
  }

  write(chunk: Buffer, _callback?: (error?: Error | null) => void) {
    if (!Buffer.isBuffer(chunk)) {
      throw new Error('chunk must be a Buffer');
    }
    // debug_log('send data', chunk.length)
    const data = Array.from(chunk);
    SendData(this.PortName, data).then(() => {
      if (_callback != null) {
        _callback();
      }
    });
    // 返回 true 表示可以继续写入
    return true;
  }
}



