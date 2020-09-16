`http2` 模块提供了 HTTP/2 协议的实现。 使用方法如下：
```js
const http2 = require('http2');
```

## 核心 API
核心 API 提供了专门针对支持 HTTP/2 协议的特性而设计的底层接口。 它不是专门设计为与现有的 HTTP/1 模块 API 兼容。 当然，也有兼容的 API。

`http2` 核心 API 在客户端和服务器之间比 http API 更加对称。 例如，大多数事件，比如 `'error'`、 `'connect'` 和 `'stream'`，都可以由客户端代码或服务器端代码触发。

### 服务器端示例
以下举例说明了一个使用核心 API 的简单的 HTTP/2 服务器。 由于没有已知的浏览器支持未加密的 HTTP/2，因此在与浏览器客户端进行通信时必须使用 `http2.createSecureServer()`。
```js
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('密钥.pem'),
  cert: fs.readFileSync('证书.pem')
});
server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
  // 流是一个双工流。
  stream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200
  });
  stream.end('<h1>你好世界</h1>');
});

server.listen(8443);
```

要生成此示例的证书和密钥，可以运行：

```js
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \ -keyout 密钥.pem -out 证书.pem
```

### 客户端示例

以下示例说明了一个 HTTP/2 客户端：

```js
const http2 = require('http2');
const fs = require('fs');
const client = http2.connect('https://localhost:8443', {
  ca: fs.readFileSync('证书.pem')
});
client.on('error', (err) => console.error(err));

const req = client.request({ ':path': '/' });

req.on('response', (headers, flags) => {
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`);
  }
});

req.setEncoding('utf8');
let data = '';
req.on('data', (chunk) => { data += chunk; });
req.on('end', () => {
  console.log(`\n${data}`);
  client.close();
});
req.end();
```

## Http2Session 类

新增于: v8.4.0
- 继承自: `<EventEmitter>`

`http2.Http2Session` 类的实例代表了 HTTP/2 客户端与服务器之间的一个活跃的通信会话。 此类的实例不是由用户代码直接地构造。

每个 `Http2Session` 实例会有略有不同的行为，这取决于它是作为服务器还是客户端运行。 `http2session.type` 属性可用于判断 `Http2Session` 的运行模式。 在服务器端上，用户代码应该很少有机会直接与 `Http2Session` 对象一起使用，大多数操作通常是通过与 `Http2Server` 或 `Http2Stream` 对象的交互来进行的。

用户代码不会直接地创建 `Http2Session` 实例。 当接收到新的 HTTP/2 连接时，服务器端的 `Http2Session` 实例由 `Http2Server` 实例创建。 客户端的 `Http2Session` 实例是使用`http2.connect()` 方法创建的。

### Http2Session 与 Socket

每个 `Http2Session` 实例在创建时都会与一个 `net.Socket` 或 `tls.TLSSocket` 关联。 当 `Socket` 或 `Http2Session` 被销毁时，两者都将会被销毁。

由于 HTTP/2 协议强加了特定的序列化和处理要求，因此不建议用户代码从绑定到 `Http2Session` 的 `Socket` 实例读取数据或向其写入数据。 这样做会使 HTTP/2 会话进入不确定的状态，从而导致会话和套接字变得不可用。

一旦将 `Socket` 绑定到 `Http2Session`，则用户代码应仅依赖于 `Http2Session` 的 API。


### 'close' 事件

新增于: v8.4.0

The 'close' event is emitted once the Http2Session has been destroyed. Its listener does not expect any arguments.

### 'connect' 事件

新增于: v8.4.0

session` <Http2Session>`
socket `<net.Socket>`
The 'connect' event is emitted once the Http2Session has been successfully connected to the remote peer and communication may begin.

User code will typically not listen for this event directly.
