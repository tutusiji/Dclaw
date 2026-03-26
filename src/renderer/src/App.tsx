import { useEffect, useState } from 'react';
import type { EnvironmentInfo } from '@shared/types';
import { DesktopSidebar } from './components/DesktopSidebar';
import { InspirationDetailModal } from './components/InspirationDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { BrandMark } from './components/BrandMark';
import { HOME_LAUNCH_CARDS, INSPIRATION_ITEMS, type InspirationCategoryId, type SettingsSectionId } from './ui-shell-data';
import { useI18n } from './i18n';
import { BridgePage } from './pages/BridgePage';
import { AutomationPage } from './pages/AutomationPage';
import { ReportsPage } from './pages/ReportsPage';
import { RuntimePage } from './pages/RuntimePage';
import { ConversationHomePage } from './pages/ConversationHomePage';
import { InspirationSquarePage } from './pages/InspirationSquarePage';
import { ScheduleCenterPage } from './pages/ScheduleCenterPage';
import { StudioPage, type StudioSection } from './pages/StudioPage';
import { getAiTemplateLabel } from './reporting';
import { useAutomationWorkspace } from './hooks/useAutomationWorkspace';
import { useClientRuntime } from './hooks/useClientRuntime';
import { useConversationCenter } from './hooks/useConversationCenter';
import { useFileDialogActions } from './hooks/useFileDialogActions';
import { useGitReports } from './hooks/useGitReports';
import { useOpenClawBridge } from './hooks/useOpenClawBridge';
import { useTaskRunner } from './hooks/useTaskRunner';

type MainSection = 'conversation' | 'inspiration' | 'schedule';
type ConversationTab = 'dialogue' | 'studio';

const CONVERSATION_BUCKET_ORDER = ['today', 'week', 'month'] as const;

export function App() {
  const { locale, setLocale, t } = useI18n();
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);
  const [mainSection, setMainSection] = useState<MainSection>('conversation');
  const [conversationTab, setConversationTab] = useState<ConversationTab>('dialogue');
  const [studioSection, setStudioSection] = useState<StudioSection>('runtime');
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [selectedInspirationId, setSelectedInspirationId] = useState<string | null>(null);
  const [selectedInspirationCategory, setSelectedInspirationCategory] = useState<InspirationCategoryId>('all');
  const [scheduleDraft, setScheduleDraft] = useState('');
  const [settingsSection, setSettingsSection] = useState<SettingsSectionId>('general');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const taskRunner = useTaskRunner({ locale, t });
  const fileDialogs = useFileDialogActions();
  const openClawBridge = useOpenClawBridge({ t, runTask: taskRunner.runTask });
  const automation = useAutomationWorkspace({ t, runTask: taskRunner.runTask });
  const clientRuntime = useClientRuntime({
    environment,
    setEnvironment,
    t,
    setActivity: taskRunner.setActivity,
    runTask: taskRunner.runTask
  });
  const reports = useGitReports({
    locale,
    t,
    runTask: taskRunner.runTask,
    openClawConfig: openClawBridge.openClawConfig,
    openClawAgentId: openClawBridge.openClawAgentId,
    openClawThinking: openClawBridge.openClawThinking,
    openClawTimeoutSeconds: openClawBridge.openClawTimeoutSeconds,
    openClawLocal: openClawBridge.openClawLocal,
    setOpenClawResult: openClawBridge.setOpenClawResult
  });
  const conversationCenter = useConversationCenter({
    locale,
    t,
    runTask: taskRunner.runTask,
    openClawConfig: openClawBridge.openClawConfig,
    openClawAgentId: openClawBridge.openClawAgentId,
    openClawSessionId: openClawBridge.openClawSessionId,
    openClawThinking: openClawBridge.openClawThinking,
    openClawLocal: openClawBridge.openClawLocal,
    openClawTimeoutSeconds: openClawBridge.openClawTimeoutSeconds,
    setOpenClawResult: openClawBridge.setOpenClawResult
  });

  useEffect(() => {
    void bootstrap();
  }, []);

  const conversationSearch = sidebarQuery.trim().toLowerCase();
  const visibleConversations = conversationSearch
    ? conversationCenter.conversations.filter((conversation) => {
        const haystack = `${conversation.title}\n${conversation.messages.map((message) => message.content).join('\n')}`.toLowerCase();
        return haystack.includes(conversationSearch);
      })
    : conversationCenter.conversations;

  const groupedConversations = CONVERSATION_BUCKET_ORDER.map((bucket) => ({
    bucket,
    items: visibleConversations.filter((conversation) => conversation.bucket === bucket)
  })).filter((group) => group.items.length > 0);

  const selectedInspirationItem = INSPIRATION_ITEMS.find((item) => item.id === selectedInspirationId) ?? null;
  const workspaceLabel = environment?.cwd ?? t('shell.app.workspaceLoading');

  async function bootstrap() {
    await taskRunner.runTask('task.loadingEnvironment', async () => {
      const [environmentSnapshot, config, office, skills, agents, workflows, taskTemplates, installations, taskRuns] = await Promise.all([
        window.dclaw.app.getEnvironment(),
        window.dclaw.openclaw.getConfig(),
        window.dclaw.office.getCapabilities(),
        window.dclaw.client.listSkills(),
        window.dclaw.client.listAgents(),
        window.dclaw.client.listWorkflows(),
        window.dclaw.client.listTaskTemplates(),
        window.dclaw.client.listInstallations(),
        window.dclaw.client.listTaskRuns(8)
      ]);

      setEnvironment(environmentSnapshot);
      automation.setCapabilities(office);
      openClawBridge.hydrateConfig(config);
      clientRuntime.hydrateRuntime({
        skills,
        agents,
        workflows,
        taskTemplates,
        installations,
        taskRuns
      });
    });
  }

  function openConversationCenter() {
    setMainSection('conversation');
    setConversationTab('dialogue');
  }

  function openStudioSection(nextSection: StudioSection) {
    setMainSection('conversation');
    setConversationTab('studio');
    setStudioSection(nextSection);
  }

  function openSettings(section: SettingsSectionId = 'general') {
    setSettingsSection(section);
    setSettingsOpen(true);
  }

  function getSectionTitle(section: MainSection) {
    if (section === 'inspiration') {
      return t('shell.app.section.inspiration');
    }

    if (section === 'schedule') {
      return t('shell.app.section.schedule');
    }

    return t('shell.app.section.conversation');
  }

  function getHeaderEyebrow() {
    if (mainSection === 'inspiration') {
      return t('shell.inspiration.page.eyebrow');
    }

    if (mainSection === 'schedule') {
      return t('shell.schedule.page.eyebrow');
    }

    return conversationTab === 'studio' ? t('shell.studio.page.eyebrow') : t('shell.home.eyebrow');
  }

  function getHeaderTitle() {
    if (mainSection === 'conversation') {
      return conversationTab === 'studio' ? t('shell.app.tab.studio') : t('shell.app.section.conversation');
    }

    return getSectionTitle(mainSection);
  }

  function getHeaderDescription() {
    if (mainSection === 'inspiration') {
      return t('shell.inspiration.page.description');
    }

    if (mainSection === 'schedule') {
      return t('shell.schedule.page.description');
    }

    return conversationTab === 'studio' ? t('shell.studio.page.description') : t('shell.home.emptyDescription');
  }

  function handleLaunchCardAction(launchCardId: string) {
    if (launchCardId === 'install-skill') {
      openStudioSection('bridge');
      return;
    }

    if (launchCardId === 'file-organize') {
      openStudioSection('automation');
      return;
    }

    if (launchCardId === 'schedule') {
      setMainSection('schedule');
      return;
    }

    if (launchCardId === 'mobile-office') {
      conversationCenter.applyPrompt(t('shell.app.prompt.mobileOffice'));
      openConversationCenter();
      return;
    }

    if (launchCardId === 'send-mail') {
      conversationCenter.applyPrompt(t('shell.app.prompt.mailWorkflow'));
      openConversationCenter();
    }
  }

  function handleUsePrompt(prompt: string) {
    conversationCenter.applyPrompt(prompt);
    setSelectedInspirationId(null);
    setScheduleDraft('');
    openConversationCenter();
  }

  function handleConversationSelect(conversationId: string) {
    conversationCenter.setSelectedConversationId(conversationId);
    openConversationCenter();
  }

  function handleCreateConversation() {
    conversationCenter.createConversation();
    openConversationCenter();
  }

  function handleScheduleSubmit() {
    const prompt = scheduleDraft.trim();
    if (!prompt) {
      return;
    }

    handleUsePrompt(prompt);
  }

  function renderStudioContent() {
    if (studioSection === 'runtime') {
      return (
        <RuntimePage
          environment={environment}
          busy={taskRunner.busy}
          taskTemplates={clientRuntime.taskTemplates}
          selectedTaskTemplateId={clientRuntime.selectedTaskTemplateId}
          taskInputsText={clientRuntime.taskInputsText}
          taskResult={clientRuntime.taskResult}
          taskRuns={clientRuntime.taskRuns}
          skills={clientRuntime.skills}
          agents={clientRuntime.agents}
          workflows={clientRuntime.workflows}
          installations={clientRuntime.installations}
          onTemplateChange={clientRuntime.handleTemplateChange}
          onTaskInputsChange={clientRuntime.setTaskInputsText}
          onRunTemplate={clientRuntime.runTemplate}
          onRefreshRuntime={clientRuntime.refreshRuntime}
          onResetInputs={clientRuntime.resetInputs}
          onUseCurrentWorkspace={clientRuntime.useCurrentWorkspaceForTask}
          onPickReportSource={() => clientRuntime.pickTaskDirectoryInput('sourcePath')}
          onPickFolder={() => clientRuntime.pickTaskDirectoryInput('path')}
          onPickExcelFiles={clientRuntime.pickTaskFilesInput}
          onPickOutputPath={clientRuntime.pickTaskOutputPath}
        />
      );
    }

    if (studioSection === 'automation') {
      return (
        <AutomationPage
          busy={taskRunner.busy}
          capabilities={automation.capabilities}
          directoryPath={automation.directoryPath}
          setDirectoryPath={automation.setDirectoryPath}
          directoryEntries={automation.directoryEntries}
          textFilesText={automation.textFilesText}
          setTextFilesText={automation.setTextFilesText}
          textSeparator={automation.textSeparator}
          setTextSeparator={automation.setTextSeparator}
          textOutputPath={automation.textOutputPath}
          setTextOutputPath={automation.setTextOutputPath}
          textMergePreview={automation.textMergePreview}
          csvFilesText={automation.csvFilesText}
          setCsvFilesText={automation.setCsvFilesText}
          csvOutputPath={automation.csvOutputPath}
          setCsvOutputPath={automation.setCsvOutputPath}
          csvDedupeKeys={automation.csvDedupeKeys}
          setCsvDedupeKeys={automation.setCsvDedupeKeys}
          csvPreview={automation.csvPreview}
          excelFilesText={automation.excelFilesText}
          setExcelFilesText={automation.setExcelFilesText}
          excelOutputPath={automation.excelOutputPath}
          setExcelOutputPath={automation.setExcelOutputPath}
          excelResult={automation.excelResult}
          wordTitle={automation.wordTitle}
          setWordTitle={automation.setWordTitle}
          wordParagraphsText={automation.wordParagraphsText}
          setWordParagraphsText={automation.setWordParagraphsText}
          wordOutputPath={automation.wordOutputPath}
          setWordOutputPath={automation.setWordOutputPath}
          wordResult={automation.wordResult}
          pptTitle={automation.pptTitle}
          setPptTitle={automation.setPptTitle}
          pptBulletsText={automation.pptBulletsText}
          setPptBulletsText={automation.setPptBulletsText}
          pptOutputPath={automation.pptOutputPath}
          setPptOutputPath={automation.setPptOutputPath}
          pptResult={automation.pptResult}
          onPickDirectory={fileDialogs.pickDirectoryInto}
          onPickFiles={fileDialogs.pickFilesInto}
          onPickSavePath={fileDialogs.pickSavePathInto}
          onScanDirectory={automation.scanDirectory}
          onMergeTextFiles={automation.mergeTextFiles}
          onMergeCsvFiles={automation.mergeCsvFiles}
          onRefreshOfficeCapabilities={automation.refreshOfficeCapabilities}
          onMergeExcel={automation.mergeExcel}
          onGenerateWord={automation.generateWord}
          onGeneratePpt={automation.generatePpt}
        />
      );
    }

    if (studioSection === 'reports') {
      return (
        <ReportsPage
          busy={taskRunner.busy}
          gitSourceMode={reports.gitSourceMode}
          setGitSourceMode={reports.setGitSourceMode}
          gitSourcePath={reports.gitSourcePath}
          setGitSourcePath={reports.setGitSourcePath}
          gitDepth={reports.gitDepth}
          setGitDepth={reports.setGitDepth}
          gitPreset={reports.gitPreset}
          setGitPreset={reports.setGitPreset}
          gitStartDate={reports.gitStartDate}
          setGitStartDate={reports.setGitStartDate}
          gitEndDate={reports.gitEndDate}
          setGitEndDate={reports.setGitEndDate}
          gitAuthor={reports.gitAuthor}
          setGitAuthor={reports.setGitAuthor}
          gitReportPath={reports.gitReportPath}
          setGitReportPath={reports.setGitReportPath}
          gitRepositories={reports.gitRepositories}
          gitReport={reports.gitReport}
          gitAiTemplate={reports.gitAiTemplate}
          setGitAiTemplate={reports.setGitAiTemplate}
          gitAiContext={reports.gitAiContext}
          setGitAiContext={reports.setGitAiContext}
          gitAiOutputPath={reports.gitAiOutputPath}
          setGitAiOutputPath={reports.setGitAiOutputPath}
          gitAiMarkdown={reports.gitAiMarkdown}
          openClawAgents={openClawBridge.openClawAgents}
          openClawAgentId={openClawBridge.openClawAgentId}
          setOpenClawAgentId={openClawBridge.setOpenClawAgentId}
          openClawConfig={openClawBridge.openClawConfig}
          onPickDirectory={fileDialogs.pickDirectoryInto}
          onPickSavePath={fileDialogs.pickSavePathInto}
          onFindGitRepositories={reports.findGitRepositories}
          onGenerateGitReport={reports.generateGitReport}
          onSaveGitReport={reports.saveGitReport}
          onGenerateOpenClawGitReport={reports.generateOpenClawGitReport}
          onSaveOpenClawGitReport={reports.saveOpenClawGitReport}
          getAiTemplateLabel={(template, report) => getAiTemplateLabel(locale, template, report)}
        />
      );
    }

    return (
      <BridgePage
        busy={taskRunner.busy}
        openClawConfig={openClawBridge.openClawConfig}
        setOpenClawConfig={openClawBridge.setOpenClawConfig}
        defaultArgsText={openClawBridge.defaultArgsText}
        setDefaultArgsText={openClawBridge.setDefaultArgsText}
        openClawAgents={openClawBridge.openClawAgents}
        openClawAgentId={openClawBridge.openClawAgentId}
        setOpenClawAgentId={openClawBridge.setOpenClawAgentId}
        openClawSessionId={openClawBridge.openClawSessionId}
        setOpenClawSessionId={openClawBridge.setOpenClawSessionId}
        openClawRecipient={openClawBridge.openClawRecipient}
        setOpenClawRecipient={openClawBridge.setOpenClawRecipient}
        openClawChannel={openClawBridge.openClawChannel}
        setOpenClawChannel={openClawBridge.setOpenClawChannel}
        openClawThinking={openClawBridge.openClawThinking}
        setOpenClawThinking={openClawBridge.setOpenClawThinking}
        openClawTimeoutSeconds={openClawBridge.openClawTimeoutSeconds}
        setOpenClawTimeoutSeconds={openClawBridge.setOpenClawTimeoutSeconds}
        openClawMessage={openClawBridge.openClawMessage}
        setOpenClawMessage={openClawBridge.setOpenClawMessage}
        openClawLocal={openClawBridge.openClawLocal}
        setOpenClawLocal={openClawBridge.setOpenClawLocal}
        openClawDeliver={openClawBridge.openClawDeliver}
        setOpenClawDeliver={openClawBridge.setOpenClawDeliver}
        openClawRequestPath={openClawBridge.openClawRequestPath}
        setOpenClawRequestPath={openClawBridge.setOpenClawRequestPath}
        openClawMethod={openClawBridge.openClawMethod}
        setOpenClawMethod={openClawBridge.setOpenClawMethod}
        openClawPayload={openClawBridge.openClawPayload}
        setOpenClawPayload={openClawBridge.setOpenClawPayload}
        openClawArgsText={openClawBridge.openClawArgsText}
        setOpenClawArgsText={openClawBridge.setOpenClawArgsText}
        openClawResult={openClawBridge.openClawResult}
        onSyncLocalInstall={openClawBridge.syncLocalInstall}
        onSaveConfig={openClawBridge.saveConfig}
        onCheckHealth={openClawBridge.checkHealth}
        onInspectStatus={openClawBridge.inspectStatus}
        onLoadAgents={openClawBridge.loadAgents}
        onRunAgent={openClawBridge.runAgent}
        onExecuteTask={openClawBridge.executeTask}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f9ede1_0%,#f3e5da_42%,#eee4da_100%)] p-5 text-[#241914]">
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-[#ffd9b8]/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[300px] w-[300px] rounded-full bg-[#ffe5d2]/38 blur-3xl" />

      <div className="relative mx-auto flex h-[calc(100vh-2.5rem)] max-w-[1660px] overflow-hidden rounded-[44px] border border-white/74 bg-[#f9efe4]/90 shadow-[0_34px_96px_rgba(78,53,29,0.18)] backdrop-blur-xl">
        <DesktopSidebar
          mainSection={mainSection}
          sidebarQuery={sidebarQuery}
          groupedConversations={groupedConversations}
          selectedConversationId={conversationCenter.selectedConversationId}
          workspaceLabel={workspaceLabel}
          activity={taskRunner.activity}
          busy={taskRunner.busy}
          onSidebarQueryChange={setSidebarQuery}
          onSelectConversation={handleConversationSelect}
          onCreateConversation={handleCreateConversation}
          onSelectSection={(section) => {
            if (section === 'conversation') {
              openConversationCenter();
              return;
            }

            setMainSection(section);
          }}
          onOpenSettings={() => openSettings('general')}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#fffcf8_0%,#f9f0e7_100%)]">
          <header className="relative overflow-hidden border-b border-[#eddcc8] bg-white/28 px-6 py-5 backdrop-blur-md">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),transparent)]" />

            <div className="relative flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#ead7c5] bg-white/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a684c] shadow-[0_8px_18px_rgba(147,104,65,0.06)]">
                    <BrandMark size="sm" className="h-8 w-8 rounded-[14px] shadow-none" iconClassName="h-3.5 w-3.5" />
                    Dclaw Client
                  </span>
                  <span className="rounded-full border border-[#edd9c6] bg-[#fff6eb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a58468]">
                    {getHeaderEyebrow()}
                  </span>
                </div>

                <div className="grid w-full gap-3 lg:w-auto lg:grid-cols-[minmax(250px,280px)_minmax(300px,360px)_auto]">
                  <div className="flex min-w-0 items-center gap-3 rounded-[24px] border border-[#ead7c5] bg-white/86 px-4 py-3 shadow-[0_10px_20px_rgba(147,104,65,0.06)]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[#fff1e2] text-[#b36d33]">
                      <span className="i-lucide-folder-tree h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a08267]">{t('shell.app.workspaceLabel')}</div>
                      <div className="truncate text-sm font-semibold text-[#241914]">{workspaceLabel}</div>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 rounded-[24px] border border-[#ead7c5] bg-white/86 px-4 py-3 shadow-[0_10px_20px_rgba(147,104,65,0.06)]">
                    <span className={['h-2.5 w-2.5 shrink-0 rounded-full', taskRunner.busy ? 'bg-[#f3b25d]' : 'bg-[#79c685]'].join(' ')} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a08267]">{t('shell.studio.metric.runs')}</div>
                      <div className="truncate text-sm font-semibold text-[#241914]" title={taskRunner.busy ? t('shell.app.status.runningShort', { label: taskRunner.busy }) : taskRunner.activity}>
                        {taskRunner.busy ? t('shell.app.status.runningShort', { label: taskRunner.busy }) : taskRunner.activity}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-[24px] border border-[#ead7c5] bg-white/84 px-2 py-2 shadow-[0_8px_18px_rgba(147,104,65,0.06)]">
                    <div className="inline-flex rounded-full bg-[#f8efe7] p-1">
                      <button
                        type="button"
                        onClick={() => setLocale('zh-CN')}
                        className={[
                          'rounded-full px-4 py-2 text-sm font-semibold transition',
                          locale === 'zh-CN' ? 'bg-[#241b17] text-[#fff5ec]' : 'text-[#7a6454] hover:bg-white'
                        ].join(' ')}
                      >
                        {t('shell.locale.zh')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocale('en-US')}
                        className={[
                          'rounded-full px-4 py-2 text-sm font-semibold transition',
                          locale === 'en-US' ? 'bg-[#241b17] text-[#fff5ec]' : 'text-[#7a6454] hover:bg-white'
                        ].join(' ')}
                      >
                        {t('shell.locale.en')}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openSettings('general')}
                      className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[#ead7c5] bg-white/88 text-[#775d4c] transition hover:bg-[#fff7ef]"
                    >
                      <span className="i-lucide-settings-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="min-w-0 max-w-[58rem]">
                  <div className="text-[2rem] font-semibold tracking-[-0.04em] text-[#241914]">{getHeaderTitle()}</div>
                  <p className="mt-2 max-w-[52rem] text-sm leading-7 text-[#766352]">{getHeaderDescription()}</p>
                </div>

                {mainSection === 'conversation' ? (
                  <div className="inline-flex shrink-0 self-start rounded-full border border-[#ead7c5] bg-white/86 p-1 shadow-[0_8px_18px_rgba(147,104,65,0.08)]">
                    <button
                      type="button"
                      onClick={() => setConversationTab('dialogue')}
                      className={[
                        'whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition',
                        conversationTab === 'dialogue' ? 'bg-[#241b17] text-[#fff5ec]' : 'text-[#7a6454] hover:bg-[#fff7ef]'
                      ].join(' ')}
                    >
                      {t('shell.app.tab.dialogue')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConversationTab('studio')}
                      className={[
                        'whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition',
                        conversationTab === 'studio' ? 'bg-[#241b17] text-[#fff5ec]' : 'text-[#7a6454] hover:bg-[#fff7ef]'
                      ].join(' ')}
                    >
                      {t('shell.app.tab.studio')}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-hidden px-6 pb-6 pt-5">
            {mainSection === 'conversation' && conversationTab === 'dialogue' ? (
              <ConversationHomePage
                busy={taskRunner.busy}
                activity={taskRunner.activity}
                openClawConfig={openClawBridge.openClawConfig}
                selectedConversation={conversationCenter.selectedConversation}
                draft={conversationCenter.draft}
                launchCards={HOME_LAUNCH_CARDS}
                onDraftChange={conversationCenter.setDraft}
                onSendMessage={conversationCenter.sendMessage}
                onApplyPrompt={conversationCenter.applyPrompt}
                onActivateLaunchCard={handleLaunchCardAction}
                onOpenStudio={() => setConversationTab('studio')}
                onOpenBridge={() => openStudioSection('bridge')}
              />
            ) : null}

            {mainSection === 'conversation' && conversationTab === 'studio' ? (
              <StudioPage
                activeSection={studioSection}
                environment={environment}
                busy={taskRunner.busy}
                activity={taskRunner.activity}
                clientSkillCount={clientRuntime.skills.length}
                clientAgentCount={clientRuntime.agents.length}
                taskRunCount={clientRuntime.taskRuns.length}
                openClawAgentCount={openClawBridge.openClawAgents.length}
                openClawMode={openClawBridge.openClawConfig.mode}
                onSelectSection={setStudioSection}
                onRefreshRuntime={clientRuntime.refreshRuntime}
                onLoadAgents={openClawBridge.loadAgents}
                onCheckOpenClaw={openClawBridge.checkHealth}
              >
                {renderStudioContent()}
              </StudioPage>
            ) : null}

            {mainSection === 'inspiration' ? (
              <InspirationSquarePage
                selectedCategory={selectedInspirationCategory}
                onSelectCategory={setSelectedInspirationCategory}
                onOpenItem={setSelectedInspirationId}
                onUsePrompt={handleUsePrompt}
              />
            ) : null}

            {mainSection === 'schedule' ? (
              <ScheduleCenterPage
                busy={taskRunner.busy}
                draft={scheduleDraft}
                onDraftChange={setScheduleDraft}
                onSubmit={handleScheduleSubmit}
                onApplySuggestion={handleUsePrompt}
              />
            ) : null}
          </main>
        </div>
      </div>

      <InspirationDetailModal item={selectedInspirationItem} onClose={() => setSelectedInspirationId(null)} onUsePrompt={handleUsePrompt} />

      {settingsOpen ? (
        <SettingsModal
          activeSection={settingsSection}
          environment={environment}
          openClawConfig={openClawBridge.openClawConfig}
          clientSkillCount={clientRuntime.skills.length}
          clientAgentCount={clientRuntime.agents.length}
          taskTemplateCount={clientRuntime.taskTemplates.length}
          taskRunCount={clientRuntime.taskRuns.length}
          onSelectSection={setSettingsSection}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </div>
  );
}
