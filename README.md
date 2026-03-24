# Dclaw

Dclaw 是一个面向定制化 OpenClaw 开发的 Electron 桌面壳。它将可配置的 OpenClaw 桥接能力、本地文件自动化、面向 Office 的任务执行器，以及基于 Git 的工作报告生成功能整合在一起。

## 功能组成

- 基于 `electron-vite`、`React` 和 `TypeScript` 构建的 Electron 桌面壳
- 可配置的 OpenClaw 桥接层
  - 面向本地已安装 gateway 和 agent 的 OpenClaw CLI 模式
  - 面向本地 OpenClaw API 端点的 HTTP 模式
  - 面向本地包装脚本或 CLI 启动器的命令模式
- 运行在 Electron 主进程中的本地自动化服务
  - 目录检查
  - 文本合并
  - 支持可选去重键的 CSV 合并
  - Markdown 保存流水线
- Office 桥接服务
  - 通过 `xlsx` 进行 Excel 合并
  - 通过 `docx` 生成 Word 摘要
  - 通过 `pptxgenjs` 生成 PPT 摘要
- Git 报告生成器
  - 扫描工作区中的仓库
  - 生成从本周一到当前时间的周报
  - 生成从本月第一天到当前时间的月报
  - 生成自定义时间范围报告
  - 按作者筛选提交
  - 调用 OpenClaw agent，将原始 Git 活动整理成中文周报或月报

## 项目结构

```text
src/
  main/
    index.ts                 Electron 主进程
    ipc.ts                   IPC 注册层
    services/
      file-service.ts        本地文件合并与保存逻辑
      git-report-service.ts  Git 扫描与周报/月报生成
      office-service.ts      Excel / Word / PPT 集成
      openclaw-bridge.ts     OpenClaw HTTP / 命令适配层
      process-utils.ts       共享命令执行器
  preload/
    index.ts                 暴露给渲染进程的安全桥接层
  renderer/
    index.html
    src/
      App.tsx                主工作台界面
      components/Panel.tsx   通用面板封装
      styles.css             UI 主题
  shared/
    types.ts                 跨层共享契约
```

## 开发

```bash
pnpm install
pnpm dev
```

构建：

```bash
pnpm build
```

打包：

```bash
pnpm package
```

### 打包本地 OpenClaw 运行时

在打包之前，Dclaw 现在会先将捆绑的 OpenClaw 运行时预置到 `vendor/openclaw-runtime`：

```bash
pnpm stage:openclaw-runtime
```

`package` 脚本会在执行 `electron-builder` 之前自动运行这一步。

## 如何接入真实的 OpenClaw

### CLI 模式

这是当前的主要接入方式。

Dclaw 可以：

- 检测已安装的 `openclaw` 可执行文件
- 读取本地 OpenClaw 配置文件
- 通过 `openclaw gateway status --json` 推断当前活跃的 gateway 端口
- 通过 `openclaw agents list --json` 列出已配置的 agents
- 通过 `openclaw agent --json` 执行真实的 agent 调用
- 通过所选 OpenClaw agent，根据 Git 活动生成中文周报、月报或领导风格报告

在当前机器上，活跃中的 gateway 服务地址是 `ws://127.0.0.1:6917`，因此 Dclaw 会在需要时把探测到的 gateway 端口注入到 CLI 调用中。

## 捆绑式 sidecar 运行时

Dclaw 现在支持捆绑式本地 OpenClaw sidecar 运行时：

- 打包产物会将 `vendor/openclaw-runtime` 作为 `extraResources` 一并带上
- Electron 主进程可以通过 `ELECTRON_RUN_AS_NODE=1` 启动捆绑运行时
- 捆绑的 gateway 会运行在 Electron `userData` 下由 Dclaw 管理的状态目录中
- 如果捆绑运行时缺失，Dclaw 会回退到系统里的 `openclaw` CLI

这是迈向目标架构的第一步：

`Dclaw local client + bundled local OpenClaw runtime + intranet central services`

### HTTP 模式

将 Dclaw 指向一个正在运行的、兼容 OpenClaw 的本地 API：

- `Base URL`：例如 `http://127.0.0.1:6917`
- `Request path`：例如 `/api/tasks`
- `Payload`：目标服务所需的任意 JSON 请求体

### 命令模式

将 Dclaw 指向一个本地包装脚本或二进制程序：

- `Binary path`：你的 OpenClaw 启动器路径
- `Working directory`：仓库目录或运行时目录
- `Default args`：每次执行时都会附带的固定参数

在命令模式下运行时，Dclaw 会把任务载荷注入到 `DCLAW_TASK_PAYLOAD` 中，这样包装脚本就可以解析它并将其转发给真实的 OpenClaw 进程。

## 建议的后续工作

- 用真实的 OpenClaw API 协议替换当前通用的 `/api/tasks` 请求
- 为文件解析、批量转换、数据清洗等本地能力添加插件式任务注册机制
- 为周报、月报和项目专项报告补充更丰富的模板
- 将 Word/PPT 生成功能直接接到 Git 报告输出上，实现一键导出报告
- 如果桌面客户端将面向非技术用户，增加权限提示或白名单机制

## 说明

- Office 功能依赖 `package.json` 中列出的可选包。
- 如果你希望 Dclaw 通过平台原生自动化能力而不是文件生成库来控制 Word、Excel 或 PowerPoint，可以在 Electron 主进程中将这部分能力作为独立的能力提供者接入。
- 当前工作区中不包含 OpenClaw 主仓库，因此现有桥接层是有意保持通用的，便于你后续接入实际使用的 OpenClaw API 或启动器。
