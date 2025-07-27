declare module 'ws' {
  import { EventEmitter } from 'events';
  
  export default class WebSocket extends EventEmitter {
    constructor(address: string, options?: any);
    static WebSocketServer: any;
  }
}