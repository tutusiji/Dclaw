# Dclaw 中 OpenClaw 的开发态与打包态部署说明

## 文档目的

这份文档整理当前项目里另一个关键问题：

- 开发态和打包态分别怎么部署
- bundled runtime 在两种形态下放在哪里
- sidecar 的状态目录写到哪里
- 当前系统是如何在 bundled runtime 和系统 `openclaw` 之间做切换的

本文只说明当前仓库已经实现的行为。

## 结论先行

当前 Dclaw 不是单一部署模式，而是“双形态运行”：

- 开发态：优先使用仓库里的 `vendor/openclaw-runtime`，如果缺失则回退到系统安装的 `openclaw`
- 打包态：优先使用安装包资源目录里的 bundled runtime，并由 Dclaw 主进程以 sidecar 方式启动

这意味着：

- 开发时可以更贴近最终交付形态
- 同时也保留了对系统已安装 OpenClaw 的兼容能力

## 一、开发态部署

## 开发态整体结构

```text
源码仓库 /root/projects/Dclaw
├─ src/...
├─ vendor/openclaw-runtime/openclaw/...   <- 如果已 stage runtime
└─ Electron dev 进程

启动后：
Renderer
  -> Preload
  -> Main
  -> OpenClawBridge
  -> 优先尝试 bundled sidecar
  -> 若失败则 fallback 到系统 openclaw
```

## 开发态下 runtime 的来源

开发态不会从安装包资源目录取 runtime，而是直接从仓库中的：

```text
vendor/openclaw-runtime/openclaw
```

读取 bundled runtime。

这个路径来自 `OpenClawSidecarManager.getRuntimeRoot()` 对非打包环境的判断逻辑。

## 开发态下如何准备 bundled runtime

准备 runtime 的命令是：

```bash
pnpm stage:openclaw-runtime
```

对应脚本是 `scripts/stage-openclaw-runtime.mjs`。脚本会：

1. 优先读取 `OPENCLAW_RUNTIME_SOURCE`
2. 如果没有，就尝试从系统 `openclaw` 可执行文件反查安装目录
3. 将可运行内容拷贝到 `vendor/openclaw-runtime/openclaw`

当前脚本会拷贝的核心内容包括：

- `package.json`
- `LICENSE`
- `openclaw.mjs`
- `assets/`
- `dist/`
- `extensions/`
- `skills/`
- `node_modules/`

也就是说，开发态的 `vendor/openclaw-runtime` 不是源码副本，而是一份可运行的 OpenClaw 本地运行时。

## 开发态的两条实际运行路径

### 路径 A：开发态 + bundled runtime

如果 `vendor/openclaw-runtime` 已存在并可用，Dclaw 会在启动时拉起 bundled sidecar。

这条路径的特点是：

- 更接近最终发布包的真实运行方式
- 更适合验证 sidecar 启停、状态目录、端口绑定、fallback 逻辑

### 路径 B：开发态 + 系统 openclaw

如果 `vendor/openclaw-runtime` 不存在，或者 sidecar 启动失败，Dclaw 会回退到系统安装的 `openclaw`。

这条路径的特点是：

- 更适合快速联调已有 OpenClaw 环境
- 更适合 OpenClaw 本体还在频繁变化时的临时开发

## 二、打包态部署

## 打包态整体结构

```text
安装后的 Dclaw 应用
├─ App bundle
│  ├─ dist-electron/...
│  └─ resources/openclaw-runtime/openclaw/...   <- bundled runtime
└─ userData/openclaw-sidecar/
   ├─ openclaw.json
   ├─ workspace/
   └─ gateway.log
```

打包态和开发态的核心区别是：

- runtime 本体放在应用资源目录中
- runtime 是只读交付内容
- 可变状态不写回安装目录，而是写入 `userData`

## 打包态如何生成

当前打包脚本是：

```bash
pnpm package
```

这个命令会执行：

```text
pnpm stage:openclaw-runtime
-> npm run build
-> electron-builder
```

随后 `electron-builder` 会把：

```text
vendor/openclaw-runtime
```

作为 `extraResources` 打进安装包中。

## 打包态 runtime 的位置

打包后，`OpenClawSidecarManager` 会从：

```text
process.resourcesPath/openclaw-runtime/openclaw
```

读取 runtime。

这与开发态使用的仓库目录不同。

## 打包态状态目录位置

打包后的 sidecar 状态目录会落在 Electron `userData` 下面，由 Dclaw 自己管理。

当前实现里主要包含：

- `openclaw-sidecar/openclaw.json`
- `openclaw-sidecar/workspace/`
- `openclaw-sidecar/gateway.log`

这样设计的目的是把：

- 应用程序本体
- 用户状态
- 可变日志和工作区

明确分开，便于升级、排障和权限管理。

## 三、开发态与打包态的对照表

| 维度 | 开发态 | 打包态 |
| --- | --- | --- |
| runtime 位置 | `vendor/openclaw-runtime/openclaw` | `process.resourcesPath/openclaw-runtime/openclaw` |
| runtime 来源 | `stage-openclaw-runtime` 预置到仓库 | 由 `extraResources` 打进安装包 |
| 是否只读 | 不一定，通常属于工作区内容 | 基本视为应用资源，只读交付 |
| sidecar 状态目录 | `userData/openclaw-sidecar` | `userData/openclaw-sidecar` |
| 配置与工作区 | 由 Dclaw 在 `userData` 下准备 | 同样由 Dclaw 在 `userData` 下准备 |
| fallback 行为 | sidecar 不可用时回退系统 `openclaw` | bundled runtime 缺失或启动失败时回退系统 `openclaw` |
| 适用场景 | 开发联调、验证运行链路 | 发布交付、真实安装环境 |

## 四、当前 fallback 逻辑怎么理解

当前逻辑不是“必须内置 runtime 才能工作”，而是“优先使用内置 runtime”。

可以把当前策略概括成：

```text
优先使用 Dclaw 自带的 bundled OpenClaw runtime
  -> 如果 sidecar 能启动，就走 bundled sidecar
  -> 如果 sidecar 不可用，就回退到系统 openclaw
```

这带来的好处是：

- 既能朝最终的一体化交付形态演进
- 又不会在开发阶段把环境耦合得过死

## 五、对调试和发布的实际意义

## 调试时的建议

### 1. 如果你在调 Dclaw 与 OpenClaw 的集成链路

优先使用开发态的 bundled runtime：

- 更接近最终真实交付形态
- 更容易提前发现 sidecar、端口、状态目录、日志问题

### 2. 如果你在频繁改 OpenClaw 本体

短期内可以让 Dclaw 走系统 `openclaw` fallback：

- 更新 OpenClaw 更直接
- 不需要每次都重新 stage runtime

### 3. 如果你在做发布前验证

必须验证一次打包态：

- 确认 `extraResources` 中的 runtime 结构完整
- 确认 sidecar 能从资源目录启动
- 确认 `userData/openclaw-sidecar` 下能正常生成配置、workspace 和日志

## 发布时的建议

发布前最少检查以下几项：

1. `pnpm stage:openclaw-runtime` 是否成功
2. `vendor/openclaw-runtime/openclaw/openclaw.mjs` 是否存在
3. 打包产物是否包含 `openclaw-runtime`
4. 首次启动时 sidecar 是否能起来
5. sidecar 不可用时是否会正确 fallback
6. `gateway.log` 是否有可用于排障的信息

## 六、推荐理解方式

理解当前项目时，最容易犯的错误是把开发态和打包态混为一谈。

更准确的理解应该是：

- 开发态主要回答“工程里怎么联调”
- 打包态主要回答“最终交付给用户时怎么跑”

在这个项目里，两者共享同一套主进程、桥接层和 sidecar 管理逻辑，但 runtime 的读取位置和打包方式不同。

## 一句话总结

当前 Dclaw 的 OpenClaw 接入策略是：

- 开发态：`vendor/openclaw-runtime` 优先，系统 `openclaw` 兜底
- 打包态：应用资源中的 bundled runtime 优先，由 Dclaw 以 sidecar 方式拉起，运行状态落在 `userData/openclaw-sidecar`

这正是“开发可联调、发布可交付”的当前实现基础。
