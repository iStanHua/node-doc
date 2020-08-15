`child_process` 模块提供了衍生子进程（以一种与 popen(3) 类似但不相同的方式）的能力。 此功能主要由 child_process.spawn() 函数提供：

```js
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});
```

默认情况下，`stdin`、`stdout` 和 `stderr` 的管道会在父 Node.js 进程和衍生的子进程之间建立。
这些管道具有有限的（且平台特定的）容量。
如果子进程写入 stdout 时超出该限制且没有捕获输出，则子进程会阻塞并等待管道缓冲区接受更多的数据。
这与 shell 中的管道的行为相同。
如果不消费输出，则使用 `{ stdio: 'ignore' }` 选项。

如果传入 `options` 对象，则会使用 `options.env.PATH` 环境变量来执行命令查找，否则会使用 `process.env.PATH`。
考虑到 Windows 的环境变量不区分大小写，Node.js 会按字典顺序对所有 `env` 的键进行排序，并且不区分大小写地选择第一个匹配的 `PATH` 来执行命令查找。
当传给 `env` 选项的对象具有多个 `PATH` 变量时，在 Windows 上可能会出现问题。

[`child_process.spawn()`] 方法会异步地衍生子进程，且不阻塞 Node.js 事件循环。
[`child_process.spawnSync()`] 函数则以同步的方式提供了等效的功能，但会阻塞事件循环直到衍生的进程退出或被终止。

为方便起见，`child_process` 模块提供了 [`child_process.spawn()`] 和 [`child_process.spawnSync()`] 的一些同步和异步的替代方法。
这些替代方法中的每一个都是基于 [`child_process.spawn()`] 或 [`child_process.spawnSync()`] 实现的。

  * [`child_process.exec()`]: 衍生 shell 并且在 shell 中运行命令，当完成时则将 `stdout` 和 `stderr` 传给回调函数。
  * [`child_process.execFile()`]: 类似于 [`child_process.exec()`]，但是默认情况下它会直接衍生命令而不先衍生 shell。
  * [`child_process.fork()`]: 衍生新的 Node.js 进程，并调用指定的模块，该模块已建立了 IPC 通信通道，可以在父进程与子进程之间发送消息。
  * [`child_process.execSync()`]: [`child_process.exec()`] 的同步版本，会阻塞 Node.js 事件循环。
  * [`child_process.execFileSync()`]: [`child_process.execFile()`] 的同步版本，会阻塞 Node.js 事件循环。

对于某些用例，例如自动化的 shell 脚本，[同步的方法][synchronous counterparts]可能更方便。
但是在大多数情况下，同步的方法会对性能产生重大的影响，因为会暂停事件循环直到衍生的进程完成。


# 创建异步的进程

`child_process.spawn()`、`child_process.fork()`、`child_process.exec()` 和 `child_process.execFile()` 方法都遵循其他 Node.js API 惯用的异步编程模式。

每个方法都返回一个 `ChildProcess` 实例。 这些对象实现了 Node.js 的 EventEmitter API，允许父进程注册监听器函数，在子进程的生命周期中当发生某些事件时会被调用。

`child_process.exec()` 和 `child_process.execFile()` 方法还允许指定可选的 callback 函数，当子进程终止时会被调用。

## 在 Windows 上衍生 .bat 和 .cmd 文件

`child_process.exec()` 和 `child_process.execFile()` 之间区别的重要性可能因平台而异。 在 Unix 类型的操作系统（Unix、Linux、macOS）上，`child_process.execFile()` 可以更高效，因为默认情况下它不会衍生 shell。

但是在 Windows 上， .bat 和 .cmd 文件在没有终端的情况下不能自行执行，因此无法使用 `child_process.execFile()` 启动。

当在 Windows 上运行时，要调用 .bat 和 .cmd 文件，可以使用设置了 shell 选项的` child_process.spawn()`、或 `child_process.exec()`、或衍生 cmd.exe 并将 .bat 或 .cmd 文件作为参数传入（也就是 shell 选项和 `child_process.exec()` 所做的）。

 在任何情况下，如果脚本的文件名包含空格，则需要加上引号。

 ```js
 // 仅在 Windows 上。
const { spawn } = require('child_process');
const bat = spawn('cmd.exe', ['/c', 'my.bat']);

bat.stdout.on('data', (data) => {
  console.log(data.toString());
});

bat.stderr.on('data', (data) => {
  console.error(data.toString());
});

bat.on('exit', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});
 ```

 ```js
 // 或：
const { exec, spawn } = require('child_process');
exec('my.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

// 文件名中包含空格的脚本：
const bat = spawn('"my script.cmd"', ['a', 'b'], { shell: true });
// 或：
exec('"my script.cmd" a b', (err, stdout, stderr) => {
  // ...
});
 ```

## child_process.exec(command[, options][, callback])

* `command` {string} 要运行的命令，参数使用空格分隔。
* `options` {Object}
  * `cwd` {string} 子进程的当前工作目录。
    **默认值:** `null`。
  * `env` {Object} 环境变量的键值对。
    **默认值:** `process.env`。
  * `encoding` {string} **默认值:** `'utf8'`。
  * `shell` {string} 用于执行命令。
    参见 [shell 的要求][Shell Requirements]和[默认的 Windows shell][Default Windows Shell]。
     **默认值:** Unix 上是 `'/bin/sh'`，Windows 上是 `process.env.ComSpec`。
  * `timeout` {number} **默认值:** `0`。
  * `maxBuffer` {number} stdout 或 stderr 上允许的最大数据量（以字节为单位）。
    如果超过限制，则子进程会被终止，并且输出会被截断。
    参见 [maxBuffer 和 Unicode][`maxBuffer` and Unicode] 的注意事项。
    **默认值:** `1024 * 1024`。
  * `killSignal` {string|integer} **默认值:** `'SIGTERM'`。
  * `uid` {number} 设置进程的用户标识，参见 setuid(2)。
  * `gid` {number} 设置进程的群组标识，参见 setgid(2)。
  * `windowsHide` {boolean} 隐藏子进程的控制台窗口（在 Windows 系统上通常会创建）。
    **默认值:** `false`。
* `callback` {Function} 当进程终止时调用并传入输出。
  * `error` {Error}
  * `stdout` {string|Buffer}
  * `stderr` {string|Buffer}
* 返回: {ChildProcess}

衍生 shell，然后在 shell 中执行 `command`，并缓冲任何产生的输出。
传给 exec 函数的 `command` 字符串会被 shell 直接处理，特殊字符（因 [shell][shell special characters] 而异）需要被相应地处理：

```js
exec('"/目录/空 格/文件.sh" 参数1 参数2');
// 使用双引号，使路径中的空格不会被解释为多个参数的分隔符。

exec('echo "\\$HOME 变量为 $HOME"');
// $HOME 变量在第一个实例中会被转义，但是第二个则不会。
```

**切勿将未经过处理的用户输入传给此函数。
包含 shell 元字符的任何输入都可用于触发任意命令的执行。**

如果提供了 `callback` 函数，则调用时会传入参数 `(error, stdout, stderr)`。
当成功时，则 `error` 会为 `null`。
当报错时，则 `error` 会是 [`Error`] 的实例。
`error.code` 属性是子进程的退出码，`error.signal` 会被设为终止进程的信号。
除 `0` 以外的任何退出码都会被视为错误。

传给回调的 `stdout` 和 `stderr` 参数会包含子进程的 stdout 和 stderr 输出。
默认情况下，Node.js 会将输出解码为 UTF-8 并将字符串传给回调。
`encoding` 选项可用于指定字符编码（用于解码 stdout 和 stderr 输出）。
如果 `encoding` 是 `'buffer'` 或无法识别的字符编码，则传给回调的会是 `Buffer` 对象。

```js
const { exec } = require('child_process');
exec('cat *.js 文件 | wc -l', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行的错误: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
```

如果 `timeout` 大于 `0`，则当子进程运行时间超过 `timeout` 毫秒时，父进程会发送由 `killSignal` 属性（默认为 `'SIGTERM'`）标识的信号。

与 exec(3) 的 POSIX 系统调用不同，`child_process.exec()` 不会替换现有的进程，而是使用 shell 来执行命令。

如果调用此方法的 [`util.promisify()`] 版本，则返回 `Promise`（会传入具有 `stdout` 和 `stderr` 属性的 `Object`）。
返回的 `ChildProcess` 实例会作为 `child` 属性附加到 `Promise`。
如果出现错误（包括导致退出码不为 0 的任何错误），则返回 reject 的 promise，并传入与回调中相同的 `error` 对象，但是还有两个额外的属性 `stdout` 和 `stderr`。

```js
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function lsExample() {
  const { stdout, stderr } = await exec('ls');
  console.log('stdout:', stdout);
  console.error('stderr:', stderr);
}
lsExample();
```


## child_process.execSync(command[, options])

* `command` {string} 要运行的命令。
* `options` {Object}
  * `cwd` {string} 子进程的当前工作目录。
  * `input` {string|Buffer|TypedArray|DataView} 该值会作为 stdin 传给衍生的进程。
    提供此值会覆盖 `stdio[0]`。
  * `stdio` {string|Array} 子进程的 stdio 配置。
    除非指定了 `stdio`，否则 `stderr` 默认会被输出到父进程的 stderr。
    **默认值:** `'pipe'`。
  * `env` {Object} 环境变量的键值对。
    **默认值:** `process.env`。
  * `shell` {string} 用于执行命令。
    参见 [shell 的要求][Shell Requirements]和[默认的 Windows shell][Default Windows Shell]。
    **默认值:** Unix 上是 `'/bin/sh'`，Windows 上是 `process.env.ComSpec`。
  * `uid` {number} 设置进程的用户标识，参见 setuid(2)。
  * `gid` {number} 设置进程的群组标识，参见 setgid(2)。
  * `timeout` {number} 允许进程运行的最长时间，以毫秒为单位。
    **默认值:** `undefined`。
  * `killSignal` {string|integer} 当衍生的进程被杀死时使用的信号值。
    **默认值:** `'SIGTERM'`。
  * `maxBuffer` {number} stdout 或 stderr 上允许的最大数据量（以字节为单位）。
    如果超过限制，则子进程会被终止，并且输出会被截断。
    参见 [maxBuffer 和 Unicode][`maxBuffer` and Unicode] 的注意事项。
    **默认值:** `1024 * 1024`。
  * `encoding` {string} 用于所有 stdio 输入和输出的字符编码。
    **默认值:** `'buffer'`。
  * `windowsHide` {boolean} 隐藏子进程的控制台窗口（在 Windows 系统上通常会创建）。
    **默认值:** `false`。
* 返回: {Buffer|string} 命令的 stdout。

`child_process.execSync()` 方法通常与 [`child_process.exec()`] 相同，但该方法在子进程完全关闭之前不会返回。
当遇到超时并且已发送 `killSignal` 时，该方法也需等到进程完全退出后才返回。
如果子进程拦截并处理了 `SIGTERM` 信号但未退出，则父进程会等待直到子进程退出。

如果进程超时或具有非零的退出码，则此方法会抛出错误。
[`Error`] 对象会包含 [`child_process.spawnSync()`] 的完整结果。

**切勿将未经过处理的用户输入传给此函数。
包含 shell 元字符的任何输入都可用于触发任意命令的执行。**

