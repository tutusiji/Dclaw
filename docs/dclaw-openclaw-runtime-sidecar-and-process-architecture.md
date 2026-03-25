# Dclaw 中 OpenClaw Runtime、Sidecar 与进程架构说明

## 文档目的

这份文档整理两类常见问题：

- `OpenClaw runtime` 和 `sidecar` 分别是什么意思
- 在当前 Dclaw 项目里，`renderer`、`preload`、`main`、`OpenClawBridge`、`OpenClaw sidecar`、`gateway` 分别处在什么位置

本文描述的是当前仓库已经实现的结构，不讨论更远期的企业内网目标架构。

## 问题一：OpenClaw runtime 和 sidecar 分别是什么意思

### 1. 什么是 runtime

`runtime` 指的是“能够实际运行起来的 OpenClaw 本体及其运行所需文件”，不是源码仓库这个概念。

在当前项目里，`OpenClaw runtime` 更接近下面这些内容的集合：

- `openclaw` 的可执行入口
- `openclaw.mjs`
- `dist/`
- `node_modules/`
- `extensions/`
- `skills/`
- 运行 OpenClaw CLI 和 gateway 所需的其他资源文件

在 Dclaw 的打包逻辑里，这套内容会被整理到 `vendor/openclaw-runtime/openclaw/`，并在正式打包时带入应用资源目录。

### 2. 什么是 sidecar

`sidecar` 不是另一套产品，而是一种运行方式。

在这个项目里，`sidecar` 的意思是：

- OpenClaw 不直接跑在 Electron 主进程内部
- Dclaw 主进程把 OpenClaw 当作一个独立子进程拉起
- Dclaw 负责它的启动、停止、监控和必要时重启
- Dclaw 再通过 CLI 或本地 gateway 与它交互

换句话说：

- `runtime` 是“被带上的 OpenClaw 本体”
- `sidecar` 是“这个 runtime 作为伴随 Dclaw 的独立进程运行时所扮演的角色”

### 3. 两者之间的关系

当前项目中的关系可以理解为：

```text
bundled OpenClaw runtime
  -> 被 Dclaw 主进程启动
  -> 以 sidecar 方式运行
  -> 当前主要承担 gateway 进程角色
```

所以，不要把这两个词当成并列产品名：

- `runtime` 是程序本体
- `sidecar` 是部署和运行形态

## 问题二：当前 Dclaw 的实际进程结构是什么

## 总体结构图

```text
┌──────────────────────────────────────────────────────────────┐
│ Renderer Process                                             │
│ React UI / App.tsx                                           │
│ 只负责界面、参数输入、结果展示                                │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ window.dclaw.*
                ▼
┌──────────────────────────────────────────────────────────────┐
│ Preload Process                                              │
│ contextBridge 暴露安全 API                                   │
│ 将前端调用转成 ipcRenderer.invoke(...)                       │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ IPC
                ▼
┌──────────────────────────────────────────────────────────────┐
│ Electron Main Process                                        │
│ 注册 IPC handler，管理本地文件、Office、Git、OpenClaw 能力    │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ OpenClaw 请求分发
                ▼
┌──────────────────────────────────────────────────────────────┐
│ OpenClawBridge                                               │
│ 统一适配 CLI / HTTP / Command 三种接入方式                   │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ CLI 模式优先使用 runtime override
                ▼
┌──────────────────────────────────────────────────────────────┐
│ OpenClaw Sidecar                                             │
│ 由 Dclaw 主进程拉起的独立 OpenClaw 子进程                    │
│ 当前通常以 gateway 方式运行                                  │
└──────────────────────────────────────────────────────────────┘
```

## 每一层分别做什么

### 1. Renderer

`renderer` 是 React 界面层。

它的职责只有三类：

- 展示配置项
- 收集用户输入
- 展示调用结果

它不直接访问 Node.js 能力，也不直接执行 `openclaw`。这层代码主要在 `src/renderer/src/App.tsx`。

### 2. Preload

`preload` 是安全桥接层。

它通过 `contextBridge.exposeInMainWorld('dclaw', api)` 暴露安全 API，把前端调用转换成：

- `ipcRenderer.invoke('openclaw:getConfig')`
- `ipcRenderer.invoke('openclaw:runAgentTurn', request)`
- `ipcRenderer.invoke('git:generateReport', request)`

这层代码在 `src/preload/index.ts`。

### 3. Main

`main` 是真正的本地能力中枢。

它负责：

- 注册全部 IPC handler
- 管理本地文件服务
- 管理 Office 服务
- 管理 Git 报告服务
- 管理 OpenClawBridge
- 在启动时尝试拉起 bundled OpenClaw sidecar

关键入口在 `src/main/index.ts` 和 `src/main/ipc.ts`。

### 4. OpenClawBridge

`OpenClawBridge` 是 OpenClaw 接入适配层。

它不负责界面，也不直接负责子进程生命周期，而是负责：

- 读取和归一化 OpenClaw 配置
- 统一处理 `cli`、`http`、`command` 三种模式
- 在 CLI 模式下拼装参数并执行真实命令
- 解析 `gateway status --json`、`agents list --json`、`agent --json` 结果

当前默认模式是 `cli`。

### 5. OpenClaw Sidecar

`OpenClaw sidecar` 是由 `OpenClawSidecarManager` 启动的一个独立 OpenClaw 子进程。

它的职责是：

- 使用 bundled runtime 启动本地 OpenClaw
- 以受控端口启动 gateway
- 把运行日志写到 Dclaw 自己的状态目录
- 让 Dclaw 能在“不依赖系统安装 OpenClaw”的前提下工作

这部分逻辑在 `src/main/services/openclaw-sidecar.ts`。

### 6. Gateway

在当前实现里，`gateway` 不是 Dclaw 自己实现的协议层，而是由 OpenClaw 进程启动出来的服务角色。

当前 sidecar 主要通过类似下面的命令运行：

```text
openclaw.mjs gateway --bind loopback --port 19617
```

因此可以把它理解为：

- sidecar 是“进程身份”
- gateway 是“这个进程当前承担的服务角色”

## 当前启动顺序

应用启动后的关键顺序如下：

1. Electron `app.whenReady()`
2. 创建 `OpenClawBridge`
3. 创建 `OpenClawSidecarManager`
4. 尝试启动 bundled sidecar
5. 如果启动成功，把 sidecar 的运行参数覆盖到 `OpenClawBridge`
6. 注册 IPC handler
7. 创建主窗口

也就是说，当前 Dclaw 不是先显示 UI 再慢慢连接 OpenClaw，而是在窗口创建前就尽量把 OpenClaw 接入准备好。

## 一次典型调用是怎么流转的

以“运行一次 OpenClaw agent”为例，请求链如下：

```text
Renderer
  -> window.dclaw.openclaw.runAgentTurn(...)
  -> Preload ipcRenderer.invoke(...)
  -> Main ipcMain.handle(...)
  -> OpenClawBridge.runAgentTurn(...)
  -> 执行 openclaw agent --json ...
  -> 返回 stdout / stderr / JSON 输出
  -> UI 展示结果
```

如果 bundled sidecar 已经成功接管，那么这里的 CLI 调用会优先使用 Dclaw 自己管理的 runtime 和 gateway 配置；如果 sidecar 不可用，则会回退到系统安装的 `openclaw`。

## 当前项目里容易混淆的几个点

### 1. sidecar 不是把 OpenClaw 嵌进 Electron 主进程

当前做法不是把 OpenClaw 直接 `import` 到 Electron 主进程里执行，而是启动一个独立子进程。这样做的好处是：

- 生命周期边界更清晰
- 崩溃隔离更容易
- 升级和替换 runtime 更方便

### 2. runtime 不等于源码仓库

这里的 runtime 指的是“能跑的产物和依赖集合”，不是整个 OpenClaw 源码开发仓库。

### 3. gateway 不等于整个 sidecar 体系

在当前实现里，gateway 是 sidecar 启动出来的服务形态之一，不要把“gateway”“runtime”“sidecar”当成完全同义词。

## 关键文件对应关系

- `src/main/index.ts`
  - 应用启动入口
  - 尝试拉起 sidecar
- `src/main/ipc.ts`
  - 渲染层和主进程之间的 IPC 注册
- `src/preload/index.ts`
  - `window.dclaw` 安全 API 暴露层
- `src/main/services/openclaw-bridge.ts`
  - OpenClaw CLI / HTTP / Command 适配层
- `src/main/services/openclaw-sidecar.ts`
  - bundled runtime 的 sidecar 生命周期管理器
- `scripts/stage-openclaw-runtime.mjs`
  - 将可运行的 OpenClaw runtime 预置到 `vendor/openclaw-runtime`

## 一句话总结

在当前 Dclaw 项目里：

- `OpenClaw runtime` 是被打包或预置的 OpenClaw 可运行本体
- `OpenClaw sidecar` 是这个 runtime 以独立子进程形式陪伴 Dclaw 运行时的角色
- `OpenClawBridge` 负责接入适配
- `OpenClawSidecarManager` 负责生命周期管理
- `renderer -> preload -> main -> bridge -> sidecar/gateway` 是当前的核心调用链
