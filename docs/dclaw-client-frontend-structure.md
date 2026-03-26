# Dclaw Client Frontend Structure

## 目标

当前 `Dclaw Client` 前端已经按“工作台壳层 + 页面模块 + 语言包”做了第一轮拆分，目标是让后续继续扩展 Agent、Skill、Task、Hub 等能力时，页面结构和国际化都能持续维护，而不是把逻辑重新堆回单个 `App.tsx`。

## 目录约定

- `src/renderer/src/App.tsx`
  负责页面级状态编排、动作分发、页面切换和各模块之间的数据流。
- `src/renderer/src/components/`
  放通用展示组件，例如侧边栏、面板等。
- `src/renderer/src/pages/`
  放具体工作台页面，例如：
  - `ChatPage.tsx`
  - `OverviewPage.tsx`
  - `RuntimePage.tsx`
  - `BridgePage.tsx`
  - `AutomationPage.tsx`
  - `ReportsPage.tsx`
- `src/renderer/src/i18n/`
  放国际化运行时和语言包：
  - `index.tsx`：`I18nProvider`、`useI18n`、`getMessage`
  - `zh-CN.json`
  - `en-US.json`
- `src/renderer/src/hooks/`
  放按业务域拆分的状态与动作逻辑，例如：
  - `useClientRuntime.ts`
  - `useOpenClawBridge.ts`
  - `useAutomationWorkspace.ts`
  - `useGitReports.ts`
  - `useAgentChat.ts`
  - `useTaskRunner.ts`
- `src/renderer/src/reporting.ts`
  放报告模板标签、AI prompt 拼装等和“报告域”相关的纯逻辑。
- `src/renderer/src/app-utils.ts`
  放页面共用的小型工具函数和文件对话框默认配置。

## 国际化规则

后续新增或修改页面文案时，统一遵循下面这条规则：

1. 所有用户可见文案都优先写入 `src/renderer/src/i18n/*.json`。
2. 组件、页面、工具函数中只使用 `lang key`，不要直接写中文或英文原文。
3. 如果一个字符串会出现在文件选择器、保存对话框、报告 prompt、错误提示、空状态里，也视为用户可见文案，同样放进 JSON。
4. 新增语言时，复制一份现有 JSON 并补齐相同 key 即可。

## 推荐实践

- 页面组件只关心展示和交互，不直接承载过多跨模块业务逻辑。
- `App.tsx` 继续只做“状态中心”和“动作编排层”。
- 顶部语言切换只保留右上角 `En/中`，不要把语言按钮分散到多个功能区。
- `ChatPage` 作为首页主入口，优先承接“自然语言发起任务”这类核心使用方式。
- 如果后面状态再继续增多，优先把动作按领域拆成 hooks，例如：
  - `useClientRuntimeActions`
  - `useOpenClawBridgeActions`
  - `useAutomationActions`
  - `useReportsActions`

## 新增文案示例

以新增一个“Hub 商店”页面为例：

1. 在 `zh-CN.json` 和 `en-US.json` 中新增：
   - `hub.title`
   - `hub.subtitle`
   - `hub.install`
   - `hub.empty`
2. 在 `pages/HubPage.tsx` 中通过 `const { t } = useI18n()` 获取文案。
3. 在 `App.tsx` 里注册页面和导航项，不直接写中文或英文标题。

这样后面无论是继续加日文、韩文，还是把 Hub 做成官方能力与用户私有技能并存的商店，前端结构都能继续平稳扩展。
