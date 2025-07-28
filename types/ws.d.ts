declare module 'ws' {
  import { EventEmitter } from 'events';
  
  export default class WebSocket extends EventEmitter {
    constructor(address: string, options?: any);
    static WebSocketServer: any;
  }
  
  export interface ServerOptions {
    port?: number;
    host?: string;
  }
  
  export class Server extends EventEmitter {
    constructor(options?: ServerOptions);
  }
}