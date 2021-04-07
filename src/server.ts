import http, { IncomingMessage, Server, ServerResponse } from 'http';

/** types */
type callback = (err?: Error) => void;
type HttpMethods = 'get' | 'post' | 'put' | 'delete';
type ServerRequestHandler = (req: HttpRequestHandler, res: HttpResponseHandler) => void;
type HttpRequest = {
  path: string,
  handler: ServerRequestHandler,
  method: HttpMethods
};

/** helper classes */
class HttpResponseHandler {
  response: ServerResponse;
  constructor(response: ServerResponse) {
    this.response = response;
  }

  status(statusCode: number) {
    this.response.statusCode === statusCode;
    return this;
  };

  send(body: string) {
    this.response.end(body);
    return this;
  };
};

class HttpRequestHandler {
  request: IncomingMessage;
  payload?: string;
  constructor(request: IncomingMessage, payload?: string) {
    this.payload = payload;
    this.request = request;
  }
};

/** custom server class */
export class HttpServer {
  private readonly _server: Server;
  private readonly _port: number;
  private readonly _request: HttpRequest[] = [];

  constructor(_port = 3000) {
    this._port = _port;
    this._server = http.createServer(this._handleRequest.bind(this));
  };

  /** checks payload and calls the handler */
  _handleRequest(req: IncomingMessage, res: ServerResponse) {
    const match = this._match(req);
    if (match) {
      switch (req.method) {
        case 'GET': {
          match.handler(
            new HttpRequestHandler(req),
            new HttpResponseHandler(res)
          );
        }
        case 'POST': this._processPost(match, req, res);
        case 'PUT': {
          console.log('put')
        }
        case 'DELETE': {
          console.log('delete')
        }
      }
    }
    if (match) match.handler(new HttpRequestHandler(req), new HttpResponseHandler(res)); //pass an instances of our classes
  };

  /** processes post data */
  _processPost(matchReq: HttpRequest, req: IncomingMessage, res: ServerResponse) {
    //https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
    let body: Buffer[] = [];
    req
      .on('data', (data: Buffer) => {
        body.push(data);
      })
      .on('end', () => {
        const payload: string = Buffer.concat(body).toString();
        return matchReq.handler(
          new HttpRequestHandler(req, payload),
          new HttpResponseHandler(res)
        );
      });
  };

  /** creates a new object and pushes all the properties of the request to the object */
  _pushRequest(path: string, method: HttpMethods, handler: ServerRequestHandler) {
    const requestObj: HttpRequest = { path, method, handler };
    this._request.push(requestObj);
  };

  /** checks url-matching */
  _match(req: IncomingMessage): HttpRequest | undefined {
    const path = req.url?.toLowerCase();
    const method = req.method?.toLowerCase();
    //create a pushRequest method to store the object
    const match = this._request.find(request => request.method === method && request.path === path);
    return match;
  };

  get(path: string, handler: ServerRequestHandler): void {
    this._pushRequest(path, 'get', handler);
  };

  post(path: string, handler: ServerRequestHandler): void {
    this._pushRequest(path, 'post', handler);
  };

  delete(path: string, handler: ServerRequestHandler): void {
    this._pushRequest(path, 'delete', handler);
  };

  put(path: string, handler: ServerRequestHandler): void {
    this._pushRequest(path, 'put', handler);
  };

  listen(cb: callback): void {
    this._server.listen(this._port, () => {
      console.log(`listening on port ${this._port}`);
    });
  };
};