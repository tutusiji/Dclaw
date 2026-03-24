# Dclaw 与 OpenClaw 内网部署架构分析

## 背景

当前目标不是做一个单纯的 OpenClaw Web 外壳，而是要做一个企业内网可部署的桌面客户端 `Dclaw`，并让它具备以下能力：

- 以桌面应用的方式承载 OpenClaw 能力
- 调用本地文件系统
- 处理 Word、Excel、PPT
- 读取本地 Git 仓库历史
- 生成周报、月报等工作材料
- 后续可接入企业内网模型、权限、审计、知识库等统一能力

因此，架构重点不只是“如何显示 OpenClaw”，而是“如何让 OpenClaw 安全、稳定地和本地桌面能力协作”。

## 当前 Dclaw 现状

当前版本的 Dclaw 并不是把 OpenClaw 源码真正内嵌进 Electron 中，而是采用了“Electron 桌面壳 + 本地桥接”的方式。

### 当前实现方式

- Dclaw 的界面是本地打包后的 Electron 前端页面，不是远程网页
- Electron 主进程负责管理本地能力和 OpenClaw 调用
- 渲染层不能直接访问 Node，只能通过 preload 暴露的安全 API 访问主进程
- OpenClaw 目前通过 `OpenClawBridge` 进行桥接
- `OpenClawBridge` 当前默认优先调用本机已经安装的 `openclaw` CLI
- Dclaw 通过 CLI 获取本地 OpenClaw 配置、gateway 状态、agents 列表，并发起 agent 调用

### 当前调用链

当前调用关系可以理解为：

```text
Dclaw UI
  -> Electron preload
  -> Electron main IPC
  -> OpenClawBridge
  -> 本机已安装的 openclaw CLI / gateway
```

### 当前版本的特点

- OpenClaw 没有被打包进 Dclaw 安装包
- Dclaw 依赖目标机器上已经安装好了 OpenClaw
- Dclaw 当前主要负责桌面 UI、本地文件能力、Git 报告、Office 文件生成和对 OpenClaw 的桥接
- OpenClaw 当前仍然是一个外部运行时，而不是 Dclaw 自己管理的内置 sidecar

### 当前版本适合的场景

- 开发期
- 原型验证
- 单机测试
- 已经有 OpenClaw 运行环境的机器

### 当前版本不适合直接作为企业内网正式版的原因

- 对目标机器有前置要求，必须提前安装 OpenClaw
- OpenClaw 生命周期不受 Dclaw 完整管理
- 配置目录、运行目录、升级策略、日志策略还没有企业化
- 还没有统一对接企业内网模型网关、审计、权限体系
- 部署和运维边界还比较松散

## 方案候选分析

这里讨论三种典型方案。

## 方案一：将整个 OpenClaw 源码粗暴内嵌进 Dclaw

这里的“粗暴内嵌”指的是把 OpenClaw 和 Dclaw 完全揉成一个大应用，不区分运行时边界。

### 优点

- 理论上看起来“一体化”
- 交付时只有一个产品名义上的主体
- 可以做深度定制

### 问题

- Electron UI 层、本地能力层、OpenClaw runtime 层会强耦合
- 后续升级 OpenClaw 会很痛
- 维护成本高
- 边界不清晰，后续定位问题困难
- 不利于企业内网长期演进

### 结论

不推荐把 OpenClaw 源码直接揉进 Dclaw 的 UI 工程里。

如果未来确实要深度改 OpenClaw，推荐的是：

- 代码仓库层面可以 fork 或 vendor OpenClaw
- 运行时层面仍然把它当作一个独立 sidecar 或 runtime 维护

## 方案二：在内网部署一套 OpenClaw，然后 Dclaw 只加载网页

这个方案的本质是：

- Dclaw 更像一个浏览器壳
- 真正的 OpenClaw UI 和逻辑主要在内网服务端
- Electron 只是加载远程网页

### 优点

- 中心化部署容易
- Web 更新方便
- 客户端逻辑较轻

### 问题

- 不适合强本地能力场景
- 本地文件、Office、Git 仓库访问会变得绕
- 如果远程网页要调用本地高权限能力，安全边界会很差
- 远程页面动态更新意味着它可以影响本地执行逻辑
- 企业内网里这类权限模型通常不好过审

### 适合的场景

- 纯聊天
- 纯控制台
- 纯监控面板
- 本地资源访问需求很弱的轻客户端

### 结论

不适合作为 Dclaw 的主方案。

因为 Dclaw 的核心价值之一就是本地自动化和本地数据处理，而不是只展示远程 OpenClaw 页面。

## 方案三：Dclaw 本地客户端 + 本地 OpenClaw sidecar/runtime + 内网中心服务

这是当前最推荐的目标架构。

### 方案定义

- Dclaw 是本地 Electron 桌面客户端
- OpenClaw 作为本地 sidecar 或 runtime 随 Dclaw 一起交付
- OpenClaw gateway 默认只监听本机 localhost 或受控地址
- Dclaw 通过 IPC 和本地 OpenClaw runtime 交互
- 企业内网中心服务负责模型网关、配置分发、审计、权限、知识库、插件治理等统一能力

### 架构图

```text
Dclaw Electron Client
  - 本地 UI
  - 本地文件/Office/Git 能力
  - 本地权限控制
  - 本地缓存
  - 本地日志
        |
        v
Local OpenClaw Sidecar / Runtime
  - gateway
  - agent runtime
  - session
  - memory / plugin runtime
        |
        v
Intranet Central Services
  - 企业模型网关
  - 统一认证鉴权
  - 审计日志
  - Prompt / 模板管理
  - 企业知识库
  - 插件与策略分发
  - 版本更新与运维控制
```

### 为什么这是最适合 Dclaw 的方案

- 本地能力由本地客户端掌控，权限边界清晰
- OpenClaw 保持独立运行时，便于升级和维护
- 企业中心能力可以统一治理
- 不需要把高权限本地 API 暴露给远程网页
- 既保留桌面能力，又保留企业运维和安全治理能力

## 推荐最终方案

推荐最终方案如下：

### 最终方案名称

`Dclaw 本地客户端 + 本地 OpenClaw sidecar/runtime + 内网中心服务`

### 具体设计原则

- Dclaw 前端页面始终本地打包，不依赖远程网页作为主界面
- OpenClaw runtime 随 Dclaw 安装包一起分发，不要求用户手工安装
- Dclaw 主进程负责拉起、监控、停止、重启本地 OpenClaw sidecar
- OpenClaw gateway 默认只监听本机
- 本地文件、Word、Excel、PPT、Git 仓库能力只通过 Dclaw 本地 IPC 提供，不直接暴露给远程网页
- 模型、模板、知识库、审计等统一接入公司内网中心服务

## 当前现状与最终方案的区别

下面是“当前版本”和“目标企业版”的核心区别。

| 维度 | 当前现状 | 推荐最终方案 |
| --- | --- | --- |
| OpenClaw 交付方式 | 依赖机器已安装 OpenClaw | Dclaw 安装包内置 OpenClaw runtime |
| OpenClaw 生命周期 | 由外部系统或用户自己维护 | 由 Dclaw 主进程自动启动、监控、重启、退出 |
| UI 加载方式 | 本地打包 UI | 仍然是本地打包 UI |
| OpenClaw 调用方式 | 调用系统 `openclaw` CLI / 已有 gateway | 调用 Dclaw 自带的本地 OpenClaw sidecar |
| 配置目录 | 当前仍偏向使用用户现有 OpenClaw 配置 | 拆分为 Dclaw 自己的企业配置目录与运行目录 |
| 本地能力控制 | 已有 IPC 桥接，但未做企业化治理 | 本地能力白名单、审批、审计、策略控制 |
| 企业模型接入 | 还没有统一内网模型网关接入 | 统一接入公司内网模型网关 |
| 审计与权限 | 暂无完整企业化能力 | 企业统一认证、审计、权限体系 |
| 部署方式 | 更适合开发和测试 | 适合公司内网标准化部署 |
| 安全边界 | 基本可用，但未做完整内网收敛 | 本地权限清晰，远程治理集中 |

## 当前现状和“只加载内网页面”方案的区别

| 维度 | 当前 Dclaw | 内网页面壳方案 |
| --- | --- | --- |
| 主界面 | 本地 Electron 页面 | 远程内网页面 |
| 本地文件访问 | 通过 Electron IPC 原生处理 | 需要桥接给远程页面，风险更高 |
| Office 能力 | 本地主进程执行 | 远程页面难以安全直接使用 |
| Git 仓库访问 | 直接读本地仓库 | 要么远程代管仓库，要么本地暴露更多权限 |
| 安全边界 | 相对清晰 | 远程页面控制本地能力，风险偏高 |
| 可审计性 | 可逐步补充本地审计 | 页面与本地能力混合，边界更复杂 |
| 适配桌面助手场景 | 强 | 弱 |

## 对公司内网部署的建议

### 不建议的方式

- 不建议把 Dclaw 主要做成“加载内网 OpenClaw 网页”的壳
- 不建议把 OpenClaw 源码完全揉进 Electron 前端工程

### 建议采用的方式

- Dclaw 作为本地桌面客户端交付
- OpenClaw runtime 作为本地 sidecar 一起随客户端安装
- 企业内部部署统一模型网关、审计服务、知识库、模板服务、插件治理服务
- Dclaw 本地能力只开放给本地打包 UI，不开放给远程动态网页

## 落地分阶段建议

### 第一阶段

- 保持当前 Dclaw 的本地 UI 架构
- 将“依赖系统已安装 OpenClaw”改为“Dclaw 自带 OpenClaw runtime”
- 在 Electron 主进程中增加 OpenClaw sidecar 启停管理

### 第二阶段

- 将配置目录、日志目录、缓存目录切换为 Dclaw 企业版路径
- 接入公司内网模型网关
- 增加本地能力白名单和审计日志

### 第三阶段

- 加入企业级权限、审批、策略下发
- 加入统一模板管理、知识库管理、插件分发
- 做标准化安装、升级、运维方案

## 结论

对于 Dclaw 这种强调本地文件、Office、Git、报告生成的企业桌面助手产品，最合适的架构不是“远程网页壳”，也不是“把所有源码揉成一个巨型工程”，而是：

`Dclaw 本地客户端 + 本地 OpenClaw sidecar/runtime + 内网中心服务`

这个方案能够同时满足：

- 本地能力调用
- 安全边界清晰
- 企业内网统一治理
- 后续长期可维护性

## 当前建议的下一步实施项

- 将 OpenClaw runtime 打进 Dclaw 安装包
- 由 Dclaw 自动拉起和监管本地 OpenClaw gateway
- 将当前系统安装依赖切换为 Dclaw 自带运行时
- 设计企业内网模型网关和审计接入点
