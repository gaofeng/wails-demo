import { Buffer } from 'buffer';
import { EventEmitter } from 'eventemitter3';

// 定义一个抽象类 CustomStream，write 方法接受 Buffer 类型的 chunk
export abstract class CustomStream extends EventEmitter {
  constructor() {
    super();
  }

  abstract write(chunk: Buffer, callback?: (error?: Error | null) => void): boolean;
}
