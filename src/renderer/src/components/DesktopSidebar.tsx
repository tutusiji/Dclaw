import type { ConversationBucket, ConversationRecord } from '../hooks/useConversationCenter';
import { useI18n } from '../i18n';
import { BrandMark } from './BrandMark';

interface DesktopSidebarProps {
  mainSection: 'conversation' | 'inspiration' | 'schedule';
  sidebarQuery: string;
  groupedConversations: Array<{
    bucket: ConversationBucket;
    items: ConversationRecord[];
  }>;
  selectedConversationId: string;
  workspaceLabel: string;
  activity: string;
  busy: string | null;
  onSidebarQueryChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  onSelectSection: (section: 'conversation' | 'inspiration' | 'schedule') => void;
  onOpenSettings: () => void;
}

interface QuickSectionButtonProps {
  active: boolean;
  iconClass: string;
  label: string;
  badge?: string | number;
  onClick: () => void;
}

function QuickSectionButton({ active, iconClass, label, badge, onClick }: QuickSectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-[24px] border px-4 py-3.5 text-left transition-all duration-200',
        active
          ? 'border-[#e7b784] bg-[#fff3e4] text-[#221814] shadow-[0_16px_28px_rgba(164,106,44,0.12)]'
          : 'border-[#ebdac8] bg-white/62 text-[#6f5d4f] hover:border-[#ead3bc] hover:bg-white/82'
      ].join(' ')}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,235,209,0.55),transparent_45%)]" />
      <span
        className={[
          'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] text-lg transition-colors',
          active ? 'bg-[#231b18] text-white' : 'bg-[#f4e6d9] text-[#9f6b39]'
        ].join(' ')}
      >
        <span className={`${iconClass} h-5 w-5`} />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5">{label}</span>
      </span>
      {badge !== undefined ? <span className="relative rounded-full bg-white/76 px-2.5 py-1 text-xs font-semibold text-[#8d735f]">{badge}</span> : null}
    </button>
  );
}

export function DesktopSidebar({
  mainSection,
  sidebarQuery,
  groupedConversations,
  selectedConversationId,
  workspaceLabel,
  activity,
  busy,
  onSidebarQueryChange,
  onSelectConversation,
  onCreateConversation,
  onSelectSection,
  onOpenSettings
}: DesktopSidebarProps) {
  const { t } = useI18n();
  const conversationCount = groupedConversations.reduce((total, group) => total + group.items.length, 0);

  return (
    <aside className="flex h-full w-[344px] shrink-0 flex-col overflow-hidden border-r border-[#ead7c5] bg-[linear-gradient(180deg,#fff9f4_0%,#f7eadb_42%,#f0dfce_100%)] p-5">
      <button
        type="button"
        onClick={() => onSelectSection('conversation')}
        className="flex items-center gap-3 rounded-[28px] border border-transparent bg-white/40 p-2 text-left transition hover:border-[#ead9c6] hover:bg-white/58"
      >
        <BrandMark />
        <span className="min-w-0">
          <span className="block text-[1.08rem] font-semibold tracking-[0.01em] text-[#241914]">Dclaw Client</span>
          <span className="mt-1 block text-xs tracking-[0.08em] text-[#a08168]">{t('shell.sidebar.brandSubtitle')}</span>
        </span>
      </button>

      <div className="mt-5 grid gap-2">
        <QuickSectionButton
          active={mainSection === 'conversation'}
          iconClass="i-lucide-message-square-more"
          label={t('shell.app.section.conversation')}
          badge={conversationCount}
          onClick={() => onSelectSection('conversation')}
        />

        <div className="grid grid-cols-2 gap-2">
          <QuickSectionButton
            active={mainSection === 'inspiration'}
            iconClass="i-lucide-lightbulb"
            label={t('shell.sidebar.inspiration.label')}
            onClick={() => onSelectSection('inspiration')}
          />
          <QuickSectionButton
            active={mainSection === 'schedule'}
            iconClass="i-lucide-calendar-clock"
            label={t('shell.sidebar.schedule.label')}
            onClick={() => onSelectSection('schedule')}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-[22px] border border-[#ecd8c4] bg-white/76 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <span className="i-lucide-search h-4 w-4 text-[#a58369]" />
        <input
          value={sidebarQuery}
          onChange={(event) => onSidebarQueryChange(event.target.value)}
          placeholder={t('shell.sidebar.searchPlaceholder')}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[#2a1e18] outline-none placeholder:text-[#b29680]"
        />
      </div>

      <button
        type="button"
        onClick={onCreateConversation}
        className="mt-4 flex items-center justify-center gap-2 rounded-[22px] border border-[#e5b787] bg-[linear-gradient(135deg,#241b17_0%,#3a2a1d_100%)] px-4 py-3.5 text-sm font-semibold text-[#fff5ec] shadow-[0_18px_30px_rgba(49,31,20,0.22)] transition hover:translate-y-[-1px]"
      >
        <span className="i-lucide-square-pen h-4 w-4" />
        {t('shell.sidebar.newConversation')}
      </button>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a08467]">{t('shell.sidebar.recentConversations')}</span>
          <span className="rounded-full bg-white/62 px-2.5 py-1 text-xs text-[#8d735f]">{conversationCount}</span>
        </div>

        {conversationCount === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#e5ccb3] bg-white/46 px-4 py-5 text-sm leading-6 text-[#8b7460]">
            {t('shell.sidebar.emptyState')}
          </div>
        ) : (
          groupedConversations.map((group) => (
            <section key={group.bucket} className="mb-5">
              <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#ae8c70]">{t(`shell.bucket.${group.bucket}`)}</div>
              <div className="space-y-2">
                {group.items.map((conversation) => {
                  const latestMessage = conversation.messages[conversation.messages.length - 1];
                  const active = mainSection === 'conversation' && selectedConversationId === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => onSelectConversation(conversation.id)}
                      className={[
                        'w-full rounded-[22px] border px-4 py-3.5 text-left transition-all duration-200',
                        active
                          ? 'border-[#efbf8a] bg-[#fff1e0] shadow-[0_16px_26px_rgba(177,114,54,0.11)]'
                          : 'border-transparent bg-white/60 hover:border-[#ead6c1] hover:bg-white/84'
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3">
                        <span className={['mt-1 h-2.5 w-2.5 rounded-full', active ? 'bg-[#d97c2d]' : 'bg-[#d7b49a]'].join(' ')} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#241914]">{conversation.title}</span>
                          <span className="mt-1 block truncate text-xs text-[#8c7560]">{latestMessage?.content ?? t('shell.sidebar.noPreview')}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}

        <div className="mt-6 rounded-[30px] bg-[linear-gradient(180deg,#2a231e_0%,#39291d_100%)] p-4 text-[#fff8f0] shadow-[0_24px_40px_rgba(44,31,21,0.24)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#f3c58c]">
            <span className="i-lucide-sparkles h-4 w-4" />
            {t('shell.sidebar.updateLabel')}
          </div>
          <h3 className="mt-3 text-lg font-semibold">{t('shell.sidebar.updateTitle')}</h3>
          <p className="mt-2 text-sm leading-6 text-[#dcccbc]">{t('shell.sidebar.updateDescription')}</p>
          <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-white/8 px-3 py-3 text-xs text-[#f7efe6]">
            <span className={['h-2.5 w-2.5 rounded-full', busy ? 'bg-[#ffbf66]' : 'bg-[#8be3a8]'].join(' ')} />
            <span className="truncate">{busy ? t('shell.app.status.runningShort', { label: busy }) : activity}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-[26px] border border-[#e8d4bf] bg-white/72 p-3 shadow-[0_12px_24px_rgba(154,112,74,0.08)]">
        <BrandMark size="sm" className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[#241914]">{t('shell.sidebar.assistantName')}</span>
          <span className="mt-1 block truncate text-xs text-[#9a806b]">{workspaceLabel}</span>
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-[#edd9c4] bg-white/84 text-[#775d4c] transition hover:bg-[#fff5eb]"
        >
          <span className="i-lucide-settings-2 h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
