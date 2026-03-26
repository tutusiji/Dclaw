# Dclaw Client MVP 设计与实施方案

## 文档目的

这份文档聚焦 `Dclaw Client` 本身，而不是 Hub 商店。

目标是回答下面这些问题：

- Dclaw Client 在第一阶段到底要做成什么
- 哪些功能应该优先进入 MVP
- 哪些能力先不做，避免范围失控
- 客户端内部需要哪些核心模块
- 当前仓库如何从“OpenClaw 桌面壳”逐步迁移成“本地 AI 工作助手 + Agent 调度中心”

本文描述的是推荐的 MVP 方案，不代表当前仓库已经全部实现。

## 结论先行

当前阶段最重要的不是先做 Hub，而是先把 `Dclaw Client` 做成一个真正可运行的本地调度中心。

第一阶段的产品目标不是“做出一个完整生态”，而是先验证以下四件事：

- 用户能否通过一个简单界面完成聊天、任务、文件处理和报表生成
- 客户端能否本地安装和管理 `skill / agent / workflow`
- 调度内核能否稳定地执行本地能力，并记录运行日志
- 权限模型、运行记录和任务调度是否足够清晰，为后续接入 Hub 做准备

可以把这阶段的目标概括成一句话：

```text
先做成一个可安装、可调度、可记录、可扩展的本地 AI 工作助手，
再把它接到未来的 Hub 生态里。
```

## 一、MVP 的产品定义

第一阶段的 Dclaw Client 应当是：

- 一个桌面端 AI 工作助手
- 一个本地任务执行与调度中心
- 一个可安装本地能力包的运行容器

它应当支持：

- 聊天式任务入口
- 本地文件与文件夹操作
- 周报、月报等报表生成
- Office 文件相关能力
- 定时任务
- 本地安装与管理技能包
- 运行记录与错误排查

它不应当在第一阶段承担：

- 公共市场
- 评论评分
- 团队共享
- 多人协作工作流
- 复杂审批流
- 企业级远程控制台

这些能力属于后续 `Dclaw Hub` 阶段。

## 二、MVP 成功标准

如果第一阶段做得对，至少应满足下面这些标准：

- 用户可以在一个聊天界面里提出任务
- 系统可以自动调用本地 skill 完成至少一类真实工作
- 用户可以创建一个定时任务，例如每周五自动生成周报
- 用户可以查看每一次运行的输入、输出、日志和错误
- 用户可以安装一个本地 skill 包并授权其权限
- 项目结构已经从“特定 OpenClaw 面板”演进成“通用本地助手架构”

更具体一点，MVP 完成后，最好能够稳定跑通这些真实场景：

- 读取一个目录下的文本文件并生成汇总
- 扫描 Git 仓库生成周报或月报
- 合并 Excel 文件并导出结果
- 将结果保存为 Markdown、Word 或 PPT
- 通过定时任务自动执行其中至少一种

## 三、第一阶段不做什么

为了保证 MVP 可落地，建议明确排除以下内容：

- 不做完整公共 Hub
- 不做复杂社交功能
- 不做多租户企业权限后台
- 不做太多外部 runtime 适配
- 不做图形化 workflow 编辑器
- 不做低代码 skill 编辑器
- 不做在线审核系统
- 不做跨设备同步

第一阶段可以允许存在一些占位能力，但不建议让这些能力阻塞主路径。

## 四、目标用户

第一阶段建议优先服务三类用户。

## 1. 个人知识工作者

典型需求：

- 生成工作周报、月报
- 汇总文件
- 处理本地 Office 文档
- 用聊天方式触发任务

## 2. 团队内部高频执行者

典型需求：

- 周期性生成固定格式文档
- 批量处理目录和文件
- 在固定目录中导入、导出结果
- 保留可审计的运行记录

## 3. 开发者或自动化搭建者

典型需求：

- 安装和配置 skill
- 接入外部 agent runtime
- 编写或调试内部能力
- 验证运行日志和权限声明

从产品策略上，MVP 应优先兼顾：

- 普通用户的可用性
- 高级用户的扩展能力

## 五、产品主界面建议

第一阶段推荐收敛成五个主页面。

## 1. 聊天

作用：

- 作为用户最自然的主入口
- 接收自然语言需求
- 自动触发 agent、skill 或 workflow

页面最小元素：

- 对话输入框
- 模型选择
- 附件区
- 执行结果区
- 本次调用的 skill 和产物摘要

这页的产品定位不是“纯聊天”，而是“会调用本地能力的任务工作台”。

## 2. 任务

作用：

- 管理任务模板
- 管理定时任务
- 查看最近执行状态

页面最小元素：

- 推荐任务模板
- 我创建的任务
- 定时任务列表
- 启用、暂停、立即运行按钮

## 3. 技能

作用：

- 管理已安装 skill
- 查看权限
- 查看版本和来源
- 本地导入和安装包

页面最小元素：

- 已安装技能列表
- 内置技能列表
- 安装按钮
- 升级按钮
- 权限说明面板

## 4. 运行记录

作用：

- 查看所有运行历史
- 排查失败原因
- 查看输入输出和产物

页面最小元素：

- 时间线或表格列表
- 状态筛选
- 错误信息
- 日志详情
- 打开输出文件

## 5. 设置

作用：

- 管理模型与默认行为
- 管理本地权限边界
- 管理默认输出目录
- 管理外部 connector

页面最小元素：

- 模型提供商
- 默认模型
- API Key / Base URL
- 允许访问的目录
- 默认输出目录
- 外部 agent connector 开关

## 六、MVP 用户路径

第一阶段最重要的是先把用户路径做短，而不是做全。

推荐优先打磨这三条路径。

## 路径 A：聊天触发本地任务

```text
用户输入自然语言
  -> Orchestrator 选择 agent
  -> agent 选择 skill 或 workflow
  -> 执行
  -> 展示结果与产物
  -> 写入运行记录
```

## 路径 B：任务模板执行

```text
用户进入任务页
  -> 选择周报或月报模板
  -> 填写少量参数
  -> 执行
  -> 输出文件
  -> 记录运行日志
```

## 路径 C：定时任务执行

```text
用户创建定时任务
  -> Scheduler 到点触发
  -> 本地执行 workflow
  -> 输出文件
  -> 写入 run log
  -> 如果失败则标记并可重试
```

## 七、MVP 领域模型

第一阶段建议在客户端先稳定下面这些本地对象。

## 1. SkillDefinition

表示一个可以被调用的本地能力单元。

建议最小字段：

- `id`
- `name`
- `description`
- `version`
- `source`
- `entry`
- `permissions`
- `inputSchema`
- `outputSchema`
- `enabled`

## 2. AgentDefinition

表示一个可被调度的助手定义。

建议最小字段：

- `id`
- `name`
- `description`
- `systemPrompt`
- `availableSkills`
- `defaultModel`
- `routingPolicy`
- `enabled`

## 3. WorkflowDefinition

表示一个由多个步骤组成的流程定义。

建议最小字段：

- `id`
- `name`
- `description`
- `steps`
- `requiredSkills`
- `inputSchema`
- `outputSchema`
- `enabled`

## 4. TaskTemplate

表示一个面向业务用户的一键任务模板。

建议最小字段：

- `id`
- `name`
- `description`
- `workflowId`
- `defaultInputs`
- `formSchema`
- `category`

## 5. TaskRun

表示一次真实执行。

建议最小字段：

- `id`
- `sourceType`
- `sourceId`
- `status`
- `startedAt`
- `finishedAt`
- `inputs`
- `outputs`
- `artifacts`
- `logs`
- `error`

## 6. Schedule

表示定时任务配置。

建议最小字段：

- `id`
- `taskTemplateId`
- `cron`
- `timezone`
- `enabled`
- `lastRunAt`
- `nextRunAt`

## 7. Installation

表示某个包已被安装到本地。

建议最小字段：

- `packageId`
- `version`
- `installSource`
- `installedAt`
- `grantedPermissions`
- `enabled`

## 八、客户端内部架构建议

推荐将客户端内部划分成下面几层。

## 1. Presentation Layer

负责：

- React 页面
- 用户输入
- 结果展示
- 调用状态反馈

建议收纳：

- `chat`
- `tasks`
- `skills`
- `runs`
- `settings`

## 2. Application Layer

负责：

- 执行用例
- 状态流转
- 页面之间的协调
- UI 与运行内核之间的边界适配

建议收纳：

- `sendChatMessage`
- `runTaskTemplate`
- `installPackage`
- `grantPermissions`
- `createSchedule`

## 3. Orchestration Layer

这是 MVP 的核心。

负责：

- 路由请求到正确的 agent
- 决定调用 skill 还是 workflow
- 管理执行过程
- 收集结果和错误

建议的核心组件：

- `Orchestrator`
- `AgentRouter`
- `WorkflowRunner`
- `ExecutionContextBuilder`

## 4. Registry Layer

负责：

- 注册和加载 agent
- 注册和加载 skill
- 注册和加载 workflow
- 注册 task template

建议的核心组件：

- `SkillRegistry`
- `AgentRegistry`
- `WorkflowRegistry`
- `TaskTemplateRegistry`

## 5. Runtime Layer

负责真实执行。

建议的核心组件：

- `SkillExecutor`
- `ConnectorExecutor`
- `Scheduler`
- `RunLogStore`
- `PermissionGate`
- `PackageManager`

## 6. Infrastructure Layer

负责：

- 文件系统
- SQLite 或 JSON 存储
- Electron IPC
- 定时器
- 模型请求
- 外部命令执行

## 九、推荐的模块关系

```text
UI
  -> Application Use Cases
  -> Orchestrator
  -> Registries
  -> Executors / Scheduler / PermissionGate / RunLogStore
  -> File / DB / IPC / External Model / Connector
```

推荐原则：

- 页面不要直接碰底层执行器
- skill 不要直接控制 UI 状态
- task run 一定要由统一入口记录
- 权限确认要走统一的 gate，而不是分散在每个 service 中

## 十、MVP 内置能力建议

第一阶段建议先内置三类 skill。

## 1. 文件系统 skill

例如：

- 列目录
- 读取文本
- 写入文本
- 合并文本
- 选择目录
- 选择文件

这些能力当前已经有部分基础，可以从现有 `file-service` 演进出来。

## 2. Office skill

例如：

- 合并 Excel
- 生成 Word
- 生成 PPT

这些能力当前已经有部分基础，可以从现有 `office-service` 演进出来。

## 3. 报表 skill

例如：

- 扫描 Git 仓库
- 生成周报
- 生成月报
- 输出 Markdown

这些能力当前已经有部分基础，可以从现有 `git-report-service` 演进出来。

## 十一、MVP 内置 agent 建议

第一阶段不需要很多 agent，建议先收敛为三个。

## 1. 通用助手

负责：

- 基础聊天理解
- 意图识别
- 将请求路由给 skill 或 workflow

## 2. 文件助手

负责：

- 文件和文件夹处理
- 目录扫描
- 批量整理

## 3. 报表助手

负责：

- 周报和月报生成
- Git 数据整合
- 输出文档

这三个 agent 足以覆盖 MVP 的主要路径。

## 十二、MVP workflow 建议

为了让系统看起来不像“技能列表”，建议第一阶段直接提供几个可运行 workflow。

推荐最少先做：

- `weekly-report`
  扫描 Git 提交并生成周报
- `monthly-report`
  生成月报
- `merge-excel`
  批量合并 Excel
- `summarize-folder`
  汇总目录中的文本文件

这几个 workflow 能快速体现平台价值，也最容易结合现有能力实现。

## 十三、模型与 Connector 策略

第一阶段建议把“外部 agent runtime”从产品主角降级成“connector”。

也就是说：

- OpenClaw 可以保留，但不再作为产品中心
- NemoClaw 如果未来接入，也应视为 connector
- HTTP agent 或其他 runtime 也应统一视为 connector

这样做的好处是：

- 客户端不会被单一 runtime 绑定
- UI 不需要暴露太多 runtime 特有配置
- 以后更容易统一调度模型和技能

MVP 阶段建议先支持两类模型来源：

- 直接模型调用
  例如 OpenAI 兼容接口
- 外部 agent connector
  例如 OpenClaw connector

## 十四、权限设计

第一阶段虽然不做完整 Hub，但权限模型必须先立起来。

建议至少支持这些权限声明：

- `filesystem.read`
- `filesystem.write`
- `git.read`
- `office.excel`
- `office.word`
- `office.ppt`
- `model.invoke`
- `network.http`
- `system.command`
- `schedule.create`

安装时要做：

- 权限说明
- 目录范围说明
- 授权确认

执行时要做：

- 敏感操作确认
- 写入前确认目标位置
- 日志记录

## 十五、本地存储建议

第一阶段建议尽量简单，但数据对象要稳定。

推荐本地存储至少分成这些类别：

- `settings`
  模型、目录、默认行为
- `installations`
  已安装包和版本
- `agents`
  已启用 agent
- `skills`
  已启用 skill
- `workflows`
  workflow 定义
- `task_templates`
  任务模板
- `schedules`
  定时任务
- `task_runs`
  运行记录

实现上可以有两条路径：

- 前期用 JSON 文件快速落地
- 稳定后逐步迁到 SQLite

如果以长期可维护为目标，我更推荐尽早用 SQLite。

## 十六、包安装流程建议

虽然 Hub 还没做，但客户端本地安装流程最好先定型。

推荐的本地安装流程：

```text
选择本地包
  -> 读取 manifest
  -> 校验 schema
  -> 展示权限
  -> 用户授权
  -> 安装到本地 package 目录
  -> 注册到 registry
  -> 可选启用
  -> 写 installation 记录
```

最开始只需要支持：

- 从本地目录安装
- 从 zip 安装

后续接 Hub 时，只是把“包来源”从本地换成远程下载。

## 十七、运行记录设计建议

`TaskRun` 是客户端里非常关键的对象，建议从第一阶段就认真设计。

一条运行记录至少应展示：

- 谁触发的
- 触发来源是什么
- 用了哪个 agent
- 用了哪些 skill
- 输入参数
- 输出结果
- 生成文件
- 开始时间和结束时间
- 错误和日志

如果这个对象早期设计得稳定，后面接 Hub、做审计、做团队协作都会容易很多。

## 十八、建议的目录演进方向

当前仓库已经有 `renderer / preload / main / services` 基础结构，可以继续用，但建议逐步收拢成更明确的模块。

推荐逐步演进到类似下面的结构：

```text
src/
  main/
    index.ts
    ipc/
    application/
    orchestration/
    registry/
    runtime/
    storage/
    permissions/
    packages/
    connectors/
    skills/
    workflows/
  preload/
    index.ts
  renderer/
    src/
      app/
      pages/
      features/
      components/
      hooks/
      state/
  shared/
    types/
    schemas/
    contracts/
```

这里的关键不是一次性重构完，而是后续新增代码时尽量往这个方向靠。

## 十九、当前仓库的迁移建议

当前仓库已经存在一些可直接复用的服务。

## 可直接复用

- `file-service`
  演进为内置文件系统 skill
- `office-service`
  演进为内置 Office skill
- `git-report-service`
  演进为内置报表 skill

## 需要降级为 connector 的部分

- `openclaw-bridge`
- `openclaw-sidecar`

这些能力不需要删除，但建议从“产品主流程”迁移成“高级设置里的 connector”。

## 需要新增的核心层

- `registry`
- `orchestration`
- `runtime`
- `packages`
- `permissions`
- `storage`
- `scheduler`

## 二十、推荐的开发顺序

建议按下面这个顺序推进，而不是边想边堆页面。

## 阶段 1：领域模型与基础骨架

目标：

- 定义核心 types
- 建好注册中心和运行内核骨架

建议交付：

- `SkillDefinition`
- `AgentDefinition`
- `WorkflowDefinition`
- `TaskTemplate`
- `TaskRun`
- `Installation`
- `Schedule`
- Registry skeleton
- Orchestrator skeleton

## 阶段 2：内置 skill 迁移

目标：

- 将已有服务收编到统一 skill 体系中

建议交付：

- 文件系统 skill
- Office skill
- 报表 skill

## 阶段 3：任务执行与运行记录

目标：

- 跑通 workflow 执行
- 跑通日志记录

建议交付：

- Workflow runner
- Run log store
- 错误展示

## 阶段 4：页面重构

目标：

- 从 OpenClaw 配置面板转成新的产品结构

建议交付：

- 聊天页
- 任务页
- 技能页
- 运行记录页
- 设置页

## 阶段 5：本地安装与定时任务

目标：

- 验证客户端真的具备平台雏形

建议交付：

- 本地包安装器
- 权限确认流程
- Schedule 管理

## 二十一、第一阶段里程碑建议

为了更容易推进，我建议把第一阶段再切成三个可验收里程碑。

## Milestone A：内核可跑

标志：

- 有 registry
- 有 orchestrator
- 有 task run 记录
- file、office、report 三类 skill 可跑

## Milestone B：产品可用

标志：

- 聊天页可用
- 任务页可用
- 运行记录可用
- 用户可以完成一条真实工作路径

## Milestone C：平台雏形成立

标志：

- 本地安装包可用
- 权限授权可用
- 定时任务可用
- OpenClaw 已经退到 connector 层

## 二十二、MVP 风险

第一阶段最容易踩的坑有几个。

## 1. UI 先行，内核混乱

如果先改页面，不先定 registry、orchestrator、task run，后面会越来越难收。

## 2. 继续把 OpenClaw 当产品中心

如果不把它降级成 connector，后面很难做成真正的通用平台。

## 3. 过早做 Hub

如果在 Client 还没稳定时先做 Hub，很容易分发一个自己都还没定义稳定的对象模型。

## 4. 过度追求“万能”

如果第一阶段同时做低代码、公共市场、图形化 workflow、复杂权限，会明显拖慢落地。

## 二十三、最终建议

对当前阶段最务实的建议是：

- 先把 `Dclaw Client` 做成真正的本地工作助手
- 先把 `skill / agent / workflow / task_run / installation / permission` 在本地跑顺
- 先把聊天、任务、运行记录和本地安装做成
- 先让 OpenClaw 退到 connector 层
- 等客户端模型稳定后，再启动 `Dclaw Hub`

可以把当前阶段的目标收敛成一句话：

```text
先完成 Dclaw Client 的设计和开发，
把它做成后续 Hub 生态可以稳定承载的本地运行底座。
```
