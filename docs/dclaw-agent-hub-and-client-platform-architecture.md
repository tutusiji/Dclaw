# Dclaw 作为 Agent 调度中心与 Hub 生态平台的目标架构

## 文档目的

这份文档不再讨论“当前仓库已经实现了什么”，而是明确 Dclaw 的目标产品形态：

- Dclaw 客户端未来应该做成什么
- 为什么需要再拆出一个独立的 Hub 工程
- `agent`、`skill`、`workflow`、`task` 在这个体系中分别扮演什么角色
- 哪些对象适合被发布到 Hub，哪些对象只应该存在于本地运行时
- 这个方向如何兼容官方能力、开发者能力，以及普通业务用户自己配置并发布的能力包

本文描述的是推荐目标架构，不代表当前仓库已经全部实现。

## 结论先行

推荐将整个产品体系拆成两个互相配合的工程：

- `Dclaw Client`
  本地 AI 工作助手，也是实际执行任务的 `agent orchestration runtime`
- `Dclaw Hub`
  能力包商店与分发中心，负责发布、发现、安装、升级、评论、评分、私有共享、公有共享

这两个工程的关系可以概括为：

```text
Hub 负责“分发与协作”
Client 负责“执行与调度”
```

从产品表达上看，Dclaw 对用户应当是一个“本地 AI 工作助手”。

从系统内核上看，Dclaw 应当是一个“可调度多 agent、多 skill、多 workflow 的本地运行中心”。

也就是说：

- 内核应当是 `agent hub / orchestration hub`
- 界面不应该长成纯工程后台
- 用户优先看到的是聊天、任务、文件、报表、图片处理
- `agent`、`skill`、`workflow`、`permission policy` 等概念应尽量收敛到高级配置层

## 一、目标产品定位

推荐将 Dclaw 定义成：

```text
一个可安装、可调度、可扩展的本地 AI 工作助手，
配套一个支持官方、团队和社区能力分发的 Hub 商店。
```

这一定义包含四层意思：

- Dclaw 不是单一模型聊天壳
- Dclaw 不是单一 agent runtime 的桌面封装
- Dclaw 的核心资产是本地执行能力、调度能力和可安装能力
- Hub 生态将成为能力增长和协作分发的关键来源

对应到用户价值上，Dclaw 应当支持：

- 一个统一的聊天界面，用自然语言驱动任务
- 读取电脑上的文件和文件夹
- 执行本地文件处理、Office 处理、图片处理、报表生成
- 创建一次性任务和定时任务
- 安装官方能力包
- 安装团队私有能力包
- 安装社区共享能力包

## 二、总体架构

## 总体结构图

```text
┌──────────────────────────────────────────────────────────────┐
│ Dclaw Hub                                                   │
│ Package Registry / Search / Reviews / Ratings / Teams       │
│ Publisher Identity / Artifact Storage / Moderation          │
└───────────────┬──────────────────────────────────────────────┘
                │ publish / search / install / upgrade
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│ Dclaw Client                                                 │
│ Chat UI / Tasks / Skills / Runs / Settings                  │
└───────────────┬──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│ Local Orchestration Runtime                                  │
│ Agent Registry / Skill Registry / Workflow Engine           │
│ Scheduler / Permission Policy / Run Log / Model Router      │
└───────────────┬──────────────────────────────────────────────┘
                │
                ├─ Local Skills
                │  filesystem / office / git / image / report
                │
                ├─ External Agent Adapters
                │  OpenClaw / NemoClaw / HTTP agent / custom agent
                │
                ├─ Model Providers
                │  OpenAI compatible / local model / enterprise endpoint
                │
                └─ Local OS Resources
                   files / folders / processes / schedules / output files
```

## 这套结构的核心思想

- Hub 不参与每一次任务执行
- Client 不负责公开市场、评论、评分、发布流程
- 能力包可以从 Hub 安装到 Client
- Client 本地安装完成后，应尽量支持离线执行
- 运行日志、任务上下文、权限确认、调度状态都应当留在本地

## 三、为什么需要拆成两个工程

如果把 Hub 能力直接塞进客户端，会遇到几个问题：

- 客户端和商店后端会强耦合
- 本地执行逻辑与发布逻辑会互相污染
- 权限边界会变得不清楚
- 后续做团队组织、私有市场、审核后台时会变得很难扩展

所以更合理的拆分是：

## 工程 A：Dclaw Client

负责：

- 聊天界面
- 任务执行
- 本地权限管理
- 本地 skill 运行
- 本地 agent 调度
- workflow 编排
- 定时任务
- 运行日志
- 本地安装、卸载、升级能力包

## 工程 B：Dclaw Hub

负责：

- 发布者体系
- 包注册与版本管理
- 搜索与发现
- 官方推荐
- 私有共享
- 团队共享
- 公有市场
- 评论、评分、下载统计
- 审核与风险标识

## 四、对外产品形态

从用户视角看，不建议把整个产品直接暴露成“agent 控制台”。

推荐的 UI 结构应当是：

- `聊天`
  自然语言入口，自动选择 agent、skill 和 workflow
- `任务`
  可复用任务模板、定时任务、最近执行
- `技能`
  已安装能力、可授权目录、版本、来源
- `运行记录`
  每次执行的日志、输入、输出、产物、错误
- `商店`
  浏览、安装、升级来自 Hub 的能力包
- `设置`
  模型、权限、默认目录、组织与账号

对于大多数用户来说：

- “我想做什么” 比 “我想调用哪个 agent” 更重要
- “执行结果”和“是否安全” 比 “底层 runtime 名字” 更重要

因此推荐原则是：

```text
内核复杂，界面简单
```

## 五、核心领域模型

为了避免后续概念混乱，建议把平台的一等公民对象先定义清楚。

## 1. Publisher

`Publisher` 表示发布者身份。

可能的类型包括：

- `official`
- `developer`
- `organization`
- `user`

它负责承载：

- 发布者名称
- 头像和简介
- 认证状态
- 组织归属
- 公钥或签名信息

## 2. Package

`Package` 是 Hub 中统一的上架包抽象。

建议支持的包类型：

- `skill`
- `agent`
- `workflow`
- `task_template`
- `connector`
- `template`

其中：

- `skill` 是单项能力
- `agent` 是带角色与调用策略的执行单元
- `workflow` 是多步编排
- `task_template` 是面向业务用户的单次任务模板
- `connector` 是连接外部系统或外部 agent runtime 的适配器
- `template` 可以承载提示词模板、表单模板或页面模板

## 3. PackageVersion

`PackageVersion` 表示一个包的版本快照。

它应当承载：

- 版本号
- manifest
- 下载物或制品地址
- 兼容性信息
- 依赖列表
- 审核状态
- 签名状态
- 发布时间

## 4. SkillDefinition

`SkillDefinition` 表示一个可直接调用的能力单元。

典型例子：

- 读取文本文件
- 列目录
- 写文件
- 合并 Excel
- 生成周报
- OCR 图片
- 图片压缩
- 调用本地命令

一个 skill 的关键属性通常包括：

- 输入参数结构
- 输出结果结构
- 运行入口
- 权限声明
- 可见性
- 是否需要模型
- 是否允许联网

## 5. AgentDefinition

`AgentDefinition` 表示一个可被调度的助手单元。

它更像是：

- 角色描述
- 系统提示词
- 可用 skill 列表
- 默认模型策略
- 上下文策略
- 回复风格
- 是否支持长时任务

例如：

- 文件助手
- 报表助手
- 图像助手
- 行政文员助手
- 团队知识库助手

## 6. WorkflowDefinition

`WorkflowDefinition` 表示一个由多个步骤组成的可复用流程。

例如：

- 扫描 Git 提交并生成周报
- 读取某目录下所有 Excel 并汇总输出
- 扫描图片并生成说明文档
- 从聊天输入中提取任务参数并保存产物

workflow 的存在能把“技能集合”提升为“可复用业务流程”。

## 7. TaskTemplate

`TaskTemplate` 适合承载业务用户最常用的“一键任务”。

例如：

- 每周工作周报
- 每月工作月报
- 合同资料批量整理
- 图片批量压缩并导出

这类模板通常比 workflow 更偏产品层，也更适合给普通业务用户使用。

## 8. TaskRun

`TaskRun` 表示一次真实执行记录。

它不适合上架到 Hub，而应当保存在客户端本地。

一个 `TaskRun` 至少应包含：

- 触发来源
- 使用了哪个 agent
- 使用了哪些 skill
- 使用了哪个 workflow 或 task template
- 输入参数
- 输出结果
- 生成文件
- 运行日志
- 错误信息
- 开始时间和结束时间

## 9. Schedule

`Schedule` 表示定时触发配置。

例如：

- 每周五 18:00
- 每月最后一个工作日 17:30
- 每天早上 9:00 扫描目录并整理文件

Schedule 建议保存在本地客户端，而不是直接托管到 Hub。

## 10. Installation

`Installation` 表示某个客户端已安装了哪个包、哪个版本、授权了哪些权限。

它至少要包含：

- package id
- version
- install source
- install time
- enabled 状态
- granted permissions
- local config overrides

## 11. Review

`Review` 表示用户对包的评价。

可先支持：

- 星级评分
- 文本评论
- 是否推荐
- 版本相关反馈

## 12. PermissionPolicy

`PermissionPolicy` 是整个体系的安全关键对象。

它至少应覆盖：

- 文件系统读写范围
- 是否允许联网
- 是否允许执行系统命令
- 是否允许调用模型
- 是否允许访问图片或 Office 处理能力
- 是否允许长时后台运行

## 六、为什么要把 task 拆成模板与运行记录

如果直接把 `task` 当作 Hub 可上架对象，会出现一个问题：

- 一部分 `task` 是“模板”
- 一部分 `task` 是“运行中的实例”

这两者生命周期完全不同。

因此推荐明确拆开：

```text
Hub 里分发的是 task_template
Client 本地持久化的是 task_run
```

这样做的好处是：

- 商店里的对象更稳定
- 评论和评分有明确对象
- 本地日志和输入输出不会混进公共包定义
- 调度系统更容易扩展

## 七、客户端内部推荐架构

当前仓库未来如果往“agent 调度中心”演进，建议在客户端内部收敛成下面这几个核心模块。

## 1. UI Layer

负责：

- 聊天
- 任务模板页
- 商店页
- 已安装能力页
- 运行记录页
- 设置页

## 2. Orchestrator

这是客户端的核心内核。

它负责：

- 接收聊天请求或任务请求
- 选择 agent
- 选择 skill
- 选择 workflow
- 组合执行计划
- 处理权限检查
- 管理结果回传

## 3. Agent Registry

负责管理：

- 已安装 agent
- 内置 agent
- 来自外部 runtime 的 agent adapter

## 4. Skill Registry

负责管理：

- 已安装 skill
- 内置 skill
- skill manifest
- skill entry
- skill capability metadata

## 5. Workflow Engine

负责：

- 编排多步流程
- 执行前置校验
- 处理中间结果
- 失败重试和中断恢复

## 6. Scheduler

负责：

- 一次性任务
- cron 类任务
- 周期任务
- 开机恢复
- 失败重试

## 7. Permission Gate

负责：

- 安装时权限确认
- 执行时二次确认
- 路径白名单限制
- 联网域名限制
- 命令执行限制

## 8. Run Log Store

负责：

- 保存运行历史
- 保存错误日志
- 关联生成产物
- 支持回放与审计

## 八、Hub 推荐架构

Hub 不只是一个包下载站，更像一个“能力注册中心 + 社区层 + 信任系统”。

推荐拆成这些模块：

## 1. Package Registry Service

负责：

- 包元数据
- 版本管理
- 依赖关系
- 兼容性校验

## 2. Artifact Storage

负责：

- manifest
- 包文件
- 预览图
- 发布附件

## 3. Search and Discovery

负责：

- 搜索
- 分类
- 标签
- 推荐
- 官方精选

## 4. Identity and Organization

负责：

- 用户账号
- 发布者身份
- 团队
- 组织
- 私有共享空间

## 5. Review and Rating

负责：

- 星级评分
- 文本评论
- 使用反馈
- 举报和下架流程

## 6. Moderation and Trust

负责：

- 审核状态
- 风险标识
- 官方认证
- 发布者认证
- 包签名验证

## 7. Distribution API

负责：

- 客户端搜索
- 客户端拉取
- 版本更新检查
- 安装元数据下发

## 九、包清单 manifest 建议

每个可分发能力包都应当带一份标准清单。

推荐的最小结构如下：

```json
{
  "schemaVersion": "1.0",
  "id": "official.skill.weekly-report",
  "name": "Weekly Report Generator",
  "type": "skill",
  "version": "1.2.0",
  "publisher": {
    "id": "official",
    "name": "Dclaw Official"
  },
  "description": "Generate weekly reports from git history and local notes.",
  "entry": {
    "runtime": "node",
    "module": "./dist/index.js",
    "export": "run"
  },
  "permissions": {
    "filesystem": {
      "read": true,
      "write": true,
      "pathScopes": [
        "~/Documents",
        "~/Desktop"
      ]
    },
    "network": {
      "enabled": false,
      "domains": []
    },
    "model": {
      "enabled": true
    },
    "command": {
      "enabled": false
    }
  },
  "inputs": [
    {
      "name": "sourcePath",
      "type": "string",
      "required": true
    }
  ],
  "outputs": [
    {
      "name": "markdown",
      "type": "string"
    },
    {
      "name": "outputPath",
      "type": "string"
    }
  ],
  "dependencies": [],
  "tags": [
    "report",
    "git",
    "weekly"
  ],
  "visibility": "public",
  "signature": {
    "algorithm": "ed25519",
    "value": "..."
  }
}
```

## 这份 manifest 解决的核心问题

- 客户端知道如何加载包
- 安装前可以明确展示权限
- 运行时可以做兼容性检查
- Hub 可以做搜索和分类
- 企业版可以做签名和审核

## 十、权限模型建议

如果未来允许开发者和普通用户上传 skill，权限模型必须优先设计，而不是最后补。

推荐从一开始就把权限声明标准化。

建议先定义这些能力域：

- `filesystem:read`
- `filesystem:write`
- `filesystem:watch`
- `office:excel`
- `office:word`
- `office:ppt`
- `image:read`
- `image:process`
- `git:read`
- `model:invoke`
- `network:http`
- `system:command`
- `schedule:create`
- `background:run`

安装时应至少做到：

- 显示权限说明
- 显示目录或域名范围
- 显示发布者与签名状态
- 显示风险标签

运行时应至少做到：

- 路径白名单
- 运行日志
- 敏感操作确认
- 对外联网控制
- 可撤销授权

## 十一、面向开发者与业务用户的双轨创作模式

你希望文员也可以按自己的要求编写并分享 skill，这一点很有价值，但不建议让所有用户都直接写代码。

推荐从产品上支持两种创作方式：

## 1. 代码型能力包

适合：

- 开发者
- 自动化工程师
- 高级用户

特点：

- 自定义运行入口
- 可以编写复杂逻辑
- 可以集成更多第三方库

## 2. 低代码能力包

适合：

- 文员
- 行政
- 运营
- 业务人员

特点：

- 通过表单定义输入输出
- 通过可视化流程组合内置动作
- 可以调用模型
- 可以挂定时任务
- 可以直接发布为私有、团队或公有能力包

低代码能力包的本质仍然应当导出为标准 package + manifest。

这样做的好处是：

- 平台统一安装与执行逻辑
- Hub 不需要区分前台入口
- 评论、评分、版本升级都可以共用

## 十二、发布范围模型

建议从一开始就支持三层可见性：

- `private`
  只有作者自己可见
- `team`
  作者所属团队或组织内可见
- `public`
  面向公共市场开放

这比只有“私有”和“公有”更合理，因为企业和团队场景通常需要中间态。

## 十三、推荐的包生命周期

一个能力包的理想生命周期如下：

```text
创建
  -> 本地测试
  -> 打包
  -> 发布到 Hub
  -> 审核或签名校验
  -> 上架
  -> 被其他用户安装
  -> 本地授权
  -> 执行
  -> 用户评分评论
  -> 发布新版本
  -> 客户端升级
```

## 十四、当前仓库如何演进到这个目标架构

当前仓库已经有一些可以直接复用的部分。

## 已有可复用能力

- `src/main/services/file-service.ts`
  可以演进为内置 `filesystem skill`
- `src/main/services/office-service.ts`
  可以演进为内置 `office skill`
- `src/main/services/git-report-service.ts`
  可以演进为内置 `report skill`
- `src/main/services/openclaw-bridge.ts`
  可以演进为一个外部 `agent connector`
- `src/main/services/openclaw-sidecar.ts`
  可以演进为一个特定 runtime 的启动器

## 需要逐步弱化的概念

- 直接把产品表达成 OpenClaw 配置面板
- 把 `profile`、`channel`、`gateway` 作为用户主界面的一等概念
- 把外部 runtime 的配置细节暴露给普通用户

## 需要新增的内核能力

- package registry
- local installation manager
- manifest loader
- permission policy engine
- agent registry
- skill registry
- workflow engine
- schedule engine
- run log store

## 十五、工程拆分建议

推荐至少拆成两个仓库：

- `dclaw-client`
  现有 Electron 客户端工程继续演进
- `dclaw-hub`
  新建 Hub 服务端与 Web 控制台

如果后续官方能力越来越多，还可以再拆出：

- `dclaw-packages-official`
  官方能力包仓库

这样做的好处是：

- 客户端和市场独立演进
- 官方能力包可以独立版本化
- 以后接私有镜像或企业内部 Hub 也更自然

## 十六、推荐的落地阶段

为了避免一次性把系统做得过重，建议分阶段推进。

## 第一阶段：本地平台化

目标：

- 把客户端先做成真正的本地调度中心
- 暂时不依赖完整的公共 Hub

范围：

- agent registry
- skill registry
- workflow registry
- 本地安装与卸载
- 本地 manifest
- 聊天与任务页
- 运行日志
- 定时任务

这一阶段结束时，产品已经应当可以：

- 本地安装 skill
- 本地执行 workflow
- 用聊天触发任务
- 定时生成周报或月报

## 第二阶段：团队 Hub

目标：

- 让团队内部可以共享和安装能力包

范围：

- Hub 基础用户体系
- 包发布
- 私有和团队可见性
- 版本管理
- 客户端安装与升级

这一阶段结束时，产品已经应当可以：

- 团队共享 skill
- 团队共享 agent
- 团队共享 workflow 模板
- 团队内部升级与回滚

## 第三阶段：公共 Hub

目标：

- 建立公开生态

范围：

- 公共市场
- 搜索推荐
- 评论评分
- 官方认证
- 风险标识
- 发布者主页

这一阶段结束时，产品才真正具备平台生态能力。

## 十七、MVP 建议

如果只做一个最小可用版本，推荐先实现下面这套组合：

- 一个聊天页
- 一个任务页
- 一个技能页
- 一个运行记录页
- 一个本地安装器
- 三类内置 skill
- 三个内置 agent

推荐的三类内置 skill：

- 文件系统 skill
- Office skill
- Git 报表 skill

推荐的三个内置 agent：

- 通用助手
- 文件助手
- 报表助手

这套 MVP 已经足以验证：

- 本地调度是否合理
- skill 抽象是否稳定
- agent 与 workflow 的关系是否顺手
- 将来接入 Hub 是否自然

## 十八、最终建议

对于 Dclaw 的长期方向，推荐坚持以下原则：

- 不要把产品绑定成单一 OpenClaw 客户端
- 要把外部 agent runtime 视为可接入的 connector
- 要把 skill、agent、workflow 视为真正的平台资产
- 要把 Hub 视为独立工程，而不是客户端里的一个页面
- 要优先设计 manifest、权限、签名和安装安全
- 要支持官方、开发者、团队和普通用户四类发布者

可以把最终方向概括成一句话：

```text
Dclaw Client 是本地 AI 工作助手与执行内核，
Dclaw Hub 是能力包市场与协作分发中心。
```

这条路线最适合逐步沉淀出真正可复用、可协作、可商业化的 agent 平台能力。
