`tty` 模块提供了 `tty.ReadStream` 和 `tty.WriteStream` 类。 在大多数情况下，不需要也不可能直接地使用此模块。 但是，可以使用以下方法访问它：

```js
const tty = require('tty');
```

当 Node.js 检测到它被运行时附加了一个文本终端（TTY），则默认情况下，`process.stdin` 会被初始化为 `tty.ReadStream` 的实例，`process.stdout` 和 `process.stderr` 会被初始化为 `tty.WriteStream` 的实例。 判断 Node.js 是否被运行在一个 `TTY` 上下文中的首选方法是检查 `process.stdout.isTTY` 属性的值是否为 `true`：

```js
$ node -p -e "Boolean(process.stdout.isTTY)"
true
$ node -p -e "Boolean(process.stdout.isTTY)" | cat
false
```

在大多数情况下，应用程序几乎没有理由手动地创建 `tty.ReadStream` 和 `tty.WriteStream` 类的实例。

## tty.ReadStream 类

新增于: v0.5.8
-继承自: `<net.Socket>`
表示 TTY 的可读端。 在正常情况中，`process.stdin` 将会是 Node.js 进程中唯一的 `tty.ReadStream` 实例，并且没有理由创建其他的实例。

### readStream.isRaw

新增于: v0.7.7
一个 `boolean`，如果 TTY 当前被配置为作为原始设备运行，则为 `true`。 默认为 `false`。

### readStream.isTTY

新增于: v0.5.8
一个 `boolean`，对于 `tty.ReadStream` 实例始终为 `true`。

### readStream.setRawMode(mode)

新增于: v0.7.7
`mode <boolean>` 如果为 `true`，则将 `tty.ReadStream` 配置为作为原始设备运行。 如果为 `false`，则将 `tty.ReadStream` 配置为以其默认模式运行。 `readStream.isRaw` 属性将会按最终的模式设置。
返回: `<this> `读取流的实例。
允许配置 `tty.ReadStream`，使其作为原始设备运行。

在原始模式中，输入始终可以逐个字符，但不包括修饰符。 此外，终端对字符的所有特殊处理都会被禁用，包括回显的输入字符。 在此模式中， `CTRL+C` 将不再产生 `SIGINT`。


## tty.WriteStream 类

新增于: v0.5.8
继承自: `<net.Socket>`
表示 TTY 的可写端。 在正常情况中，`process.stdout` 和 `process.stderr` 将会是为 Node.js 进程创建的唯一的 `tty.WriteStream` 实例，并且没有理由创建其他的实例。


### 'resize' 事件

新增于: v0.7.7
每当 `writeStream.columns` 或 `writeStream.rows` 属性发生变化时，则触发 'resize' 事件。 当调用时，没有参数传给监听器回调。

```js
process.stdout.on('resize', () => {
  console.log('屏幕大小已改变');
  console.log(`${process.stdout.columns}x${process.stdout.rows}`);
});
```

### writeStream.clearLine(dir[, callback])

- dir `<number>`
  - -1: 从光标向左。
  - 1: 从光标向右。
  - 0: 整行。
- callback `<Function>` 当操作完成时调用。
- 返回: `<boolean>` 如果流期望调用的代码在继续写入其他数据之前等待 'drain' 事件触发，则为 `false`，否则为 `true`。

`writeStream.clearLine()` 会以 `dir` 指定的方向清理此 `WriteStream` 的当前行。

### writeStream.clearScreenDown([callback])

- callback `<Function>` 当操作完成时调用。
- 返回: `<boolean>` 如果流期望调用的代码在继续写入其他数据之前等待 'drain' 事件触发，则为 `false`，否则为 `true`。

`writeStream.clearScreenDown()` 会从当前的光标向下清理此 `WriteStream`。

### writeStream.columns

新增于: v0.7.7
一个 `number`，表明 TTY 当前具有的列数。 每当 `'resize'` 事件被触发时，此属性会被更新。

# writeStream.cursorTo(x[, y][, callback])

- x `<number>`
- y `<number>`
- callback <Function> 当操作完成时调用。
- 返回: <boolean> 如果流期望调用的代码在继续写入其他数据之前等待 'drain' 事件触发，则为 false，否则为 true。

`writeStream.cursorTo()` 会将 `WriteStream` 的光标移动到指定的位置。

### writeStream.getColorDepth([env])

新增于: v9.9.0
- env `<Object>` 包含要检查的环境变量的对象。这使得能够模拟特定终端的使用。默认值: `process.env`。
- 返回: `<number>`
返回:

- 1 表示支持 2 种颜色，
- 4 表示支持 16 种颜色，
- 8 表示支持 256 种颜色，
- 24 表示支持 16,777,216 种颜色。

使用此函数可以检测终端支持的颜色数。 鉴于终端中颜色的特性，可能存在假的正数或假的负数。 这取决于进程信息与环境变量（可能会隐瞒使用的终端）。 可以传入 `env` 对象来模拟特定终端的使用。 这对于检查特定环境设置的行为很有用。

如果要强制执行特定的颜色支持，则使用以下的环境设置之一。

- 2 种颜色: FORCE_COLOR = 0 (禁用颜色)
- 16 种颜色: FORCE_COLOR = 1
- 256 种颜色: FORCE_COLOR = 2
- 16,777,216 种颜色: FORCE_COLOR = 3

也可以使用 NO_COLOR 和 NODE_DISABLE_COLORS 环境变量来禁用颜色支持。

### writeStream.getWindowSize()
新增于: v0.7.7
- 返回:` <number[]>`

`writeStream.getWindowSize()` 会返回与此 `WriteStream` 对应的 `TTY` 的大小。 该数组的类型为 `[numColumns, numRows]`，其中 `numColumns` 和 `numRows` 分别表示对应的 `TTY` 中的列数和行数。

### writeStream.hasColors([count][, env])

新增于: v11.13.0, v10.16.0
- count `<integer>` 要求的颜色数（最小为 2）。默认值: 16。
- env `<Object>` 包含要检查的环境变量的对象。这使得能够模拟特定终端的使用。默认值: `process.env`。
- 返回: `<boolean>`

如果 `writeStream` 支持至少与 `count` 中提供的颜色数一样多，则返回 `true`。 最小的支持为 2（黑色和白色）。

这也存在与 `writeStream.getColorDepth()` 中描述的相同的假正数或假负数。

```js
process.stdout.hasColors();
// 返回 true 或 false，取决于 `stdout` 是否支持至少 16 种颜色。
process.stdout.hasColors(256);
// 返回 true 或 false，取决于 `stdout` 是否支持至少 256 种颜色。
process.stdout.hasColors({ TMUX: '1' });
// 返回 true。
process.stdout.hasColors(2 ** 24, { TMUX: '1' });
// 返回 false (环境设置假设支持 2 ** 8 种颜色)。
```

### writeStream.isTTY
新增于: v0.5.8
一个 `boolean`，始终为 `true`。

### writeStream.moveCursor(dx, dy[, callback])

- dx `<number>`
- dy `<number>`
- callback `<Function>` 当操作完成时调用。
- 返回: `<boolean>` 如果流期望调用的代码在继续写入其他数据之前等待 `'drain'` 事件触发，则为 `false`，否则为 `true`。

`writeStream.moveCursor()` 会将 `WriteStream` 的光标相对于其当前的位置移动。


### writeStream.rows

新增于: v0.7.7
一个 `number`，表明 `TTY` 当前具有的行数。 每当 `'resize'` 事件被触发时，此属性会被更新。

### tty.isatty(fd)

新增于: v0.5.8
- fd `<number>` 数字型的文件描述符。
- 返回: `<boolean>`

如果给定的 `fd` 与 `TTY` 相关联，则 `tty.isatty()` 方法返回 `true`，否则返回 `false`（包括当 `fd` 不是一个非负整数时）。