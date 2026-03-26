import type { Dispatch, SetStateAction } from 'react';
import type { OpenClawAgentSummary, OpenClawConfig, OpenClawThinkingLevel } from '@shared/types';
import { Panel } from '../components/Panel';
import { useI18n } from '../i18n';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface BridgePageProps {
  busy: string | null;
  openClawConfig: OpenClawConfig;
  setOpenClawConfig: Dispatch<SetStateAction<OpenClawConfig>>;
  defaultArgsText: string;
  setDefaultArgsText: Dispatch<SetStateAction<string>>;
  openClawAgents: OpenClawAgentSummary[];
  openClawAgentId: string;
  setOpenClawAgentId: Dispatch<SetStateAction<string>>;
  openClawSessionId: string;
  setOpenClawSessionId: Dispatch<SetStateAction<string>>;
  openClawRecipient: string;
  setOpenClawRecipient: Dispatch<SetStateAction<string>>;
  openClawChannel: string;
  setOpenClawChannel: Dispatch<SetStateAction<string>>;
  openClawThinking: OpenClawThinkingLevel;
  setOpenClawThinking: Dispatch<SetStateAction<OpenClawThinkingLevel>>;
  openClawTimeoutSeconds: string;
  setOpenClawTimeoutSeconds: Dispatch<SetStateAction<string>>;
  openClawMessage: string;
  setOpenClawMessage: Dispatch<SetStateAction<string>>;
  openClawLocal: boolean;
  setOpenClawLocal: Dispatch<SetStateAction<boolean>>;
  openClawDeliver: boolean;
  setOpenClawDeliver: Dispatch<SetStateAction<boolean>>;
  openClawRequestPath: string;
  setOpenClawRequestPath: Dispatch<SetStateAction<string>>;
  openClawMethod: HttpMethod;
  setOpenClawMethod: Dispatch<SetStateAction<HttpMethod>>;
  openClawPayload: string;
  setOpenClawPayload: Dispatch<SetStateAction<string>>;
  openClawArgsText: string;
  setOpenClawArgsText: Dispatch<SetStateAction<string>>;
  openClawResult: string;
  onSyncLocalInstall: () => Promise<void>;
  onSaveConfig: () => Promise<void>;
  onCheckHealth: () => Promise<void>;
  onInspectStatus: () => Promise<void>;
  onLoadAgents: () => Promise<void>;
  onRunAgent: () => Promise<void>;
  onExecuteTask: () => Promise<void>;
}

export function BridgePage({
  busy,
  openClawConfig,
  setOpenClawConfig,
  defaultArgsText,
  setDefaultArgsText,
  openClawAgents,
  openClawAgentId,
  setOpenClawAgentId,
  openClawSessionId,
  setOpenClawSessionId,
  openClawRecipient,
  setOpenClawRecipient,
  openClawChannel,
  setOpenClawChannel,
  openClawThinking,
  setOpenClawThinking,
  openClawTimeoutSeconds,
  setOpenClawTimeoutSeconds,
  openClawMessage,
  setOpenClawMessage,
  openClawLocal,
  setOpenClawLocal,
  openClawDeliver,
  setOpenClawDeliver,
  openClawRequestPath,
  setOpenClawRequestPath,
  openClawMethod,
  setOpenClawMethod,
  openClawPayload,
  setOpenClawPayload,
  openClawArgsText,
  setOpenClawArgsText,
  openClawResult,
  onSyncLocalInstall,
  onSaveConfig,
  onCheckHealth,
  onInspectStatus,
  onLoadAgents,
  onRunAgent,
  onExecuteTask
}: BridgePageProps) {
  const { t } = useI18n();

  const openClawModeHint =
    openClawConfig.mode === 'cli'
      ? t('bridge.modeHint.cli')
      : openClawConfig.mode === 'http'
        ? t('bridge.modeHint.http')
        : t('bridge.modeHint.command');

  return (
    <Panel eyebrow={t('bridge.eyebrow')} title={t('bridge.title')} subtitle={t('bridge.subtitle')} className="panel--wide">
      <div className="subgrid two-up">
        <label className="field">
          <span>{t('bridge.mode')}</span>
          <select
            value={openClawConfig.mode}
            onChange={(event) =>
              setOpenClawConfig({
                ...openClawConfig,
                mode: event.target.value as OpenClawConfig['mode']
              })
            }
          >
            <option value="cli">{t('bridge.mode.cli')}</option>
            <option value="http">{t('bridge.mode.http')}</option>
            <option value="command">{t('bridge.mode.command')}</option>
          </select>
        </label>
        <div className="info-card">
          <strong>{t('bridge.hint')}</strong>
          <p>{openClawModeHint}</p>
        </div>
      </div>

      {openClawConfig.mode === 'cli' ? (
        <>
          <div className="subgrid two-up">
            <label className="field">
              <span>{t('bridge.cliPath')}</span>
              <input
                value={openClawConfig.cliPath ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    cliPath: event.target.value
                  })
                }
                placeholder={t('defaults.openClawCliPath')}
              />
            </label>
            <label className="field">
              <span>{t('bridge.profile')}</span>
              <input
                value={openClawConfig.profile ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    profile: event.target.value
                  })
                }
                placeholder={t('bridge.profilePlaceholder')}
              />
            </label>
          </div>

          <div className="subgrid three-up">
            <label className="field">
              <span>{t('bridge.gatewayPort')}</span>
              <input
                value={openClawConfig.gatewayPort?.toString() ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    gatewayPort: event.target.value ? Number(event.target.value) : undefined
                  })
                }
                placeholder={t('defaults.gatewayPort')}
              />
            </label>
            <label className="field">
              <span>{t('bridge.defaultAgent')}</span>
              <input
                value={openClawConfig.defaultAgentId ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    defaultAgentId: event.target.value
                  })
                }
                placeholder={t('defaults.openClawAgentId')}
              />
            </label>
            <label className="field">
              <span>{t('bridge.workspacePath')}</span>
              <input
                value={openClawConfig.workspacePath ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    workspacePath: event.target.value,
                    workingDirectory: event.target.value
                  })
                }
                placeholder={t('defaults.path.openClawWorkspace')}
              />
            </label>
          </div>

          <div className="subgrid two-up">
            <label className="field">
              <span>{t('bridge.configPath')}</span>
              <input
                value={openClawConfig.configPath ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    configPath: event.target.value
                  })
                }
                placeholder={t('defaults.path.openClawConfig')}
              />
            </label>
            <label className="field">
              <span>{t('bridge.gatewayUrl')}</span>
              <input
                value={openClawConfig.gatewayUrl ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    gatewayUrl: event.target.value
                  })
                }
                placeholder={t('defaults.url.openClawGatewayWs')}
              />
            </label>
          </div>
        </>
      ) : openClawConfig.mode === 'http' ? (
        <div className="subgrid two-up">
          <label className="field">
            <span>{t('bridge.baseUrl')}</span>
            <input
              value={openClawConfig.baseUrl ?? ''}
              onChange={(event) =>
                setOpenClawConfig({
                  ...openClawConfig,
                  baseUrl: event.target.value
                })
              }
              placeholder={t('defaults.url.openClawBaseUrl')}
            />
          </label>
          <label className="field">
            <span>{t('bridge.apiKey')}</span>
            <input
              value={openClawConfig.apiKey ?? ''}
              onChange={(event) =>
                setOpenClawConfig({
                  ...openClawConfig,
                  apiKey: event.target.value
                })
              }
              placeholder={t('bridge.apiKeyPlaceholder')}
            />
          </label>
        </div>
      ) : (
        <div className="subgrid two-up">
          <label className="field">
            <span>{t('bridge.binaryPath')}</span>
            <input
              value={openClawConfig.binaryPath ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    binaryPath: event.target.value
                  })
                }
                placeholder={t('defaults.path.openClawBinary')}
              />
            </label>
          <label className="field">
            <span>{t('bridge.workingDirectory')}</span>
            <input
              value={openClawConfig.workingDirectory ?? ''}
                onChange={(event) =>
                  setOpenClawConfig({
                    ...openClawConfig,
                    workingDirectory: event.target.value
                  })
                }
                placeholder={t('defaults.path.openClawWorkingDirectory')}
              />
            </label>
        </div>
      )}

      <label className="field">
        <span>{t('bridge.defaultArgs')}</span>
        <textarea
          value={defaultArgsText}
          onChange={(event) => setDefaultArgsText(event.target.value)}
          placeholder={t('bridge.defaultArgsPlaceholder')}
          rows={3}
        />
      </label>

      <div className="button-row">
        <button className="button button--ghost" onClick={() => void onSyncLocalInstall()} disabled={Boolean(busy) || openClawConfig.mode !== 'cli'}>
          {t('bridge.syncLocalInstall')}
        </button>
        <button className="button" onClick={() => void onSaveConfig()} disabled={Boolean(busy)}>
          {t('bridge.saveConfig')}
        </button>
        <button className="button button--ghost" onClick={() => void onCheckHealth()} disabled={Boolean(busy)}>
          {t('bridge.healthCheck')}
        </button>
        <button className="button button--ghost" onClick={() => void onInspectStatus()} disabled={Boolean(busy) || openClawConfig.mode !== 'cli'}>
          {t('bridge.gatewayStatus')}
        </button>
        <button className="button button--ghost" onClick={() => void onLoadAgents()} disabled={Boolean(busy) || openClawConfig.mode !== 'cli'}>
          {t('bridge.loadAgents')}
        </button>
      </div>

      {openClawConfig.mode === 'cli' ? (
        <>
          <div className="card">
            <div className="card-header">
              <h3>{t('bridge.agentTurn')}</h3>
              <span className="muted">{t('bridge.agentTurnHint')}</span>
            </div>
            <div className="subgrid three-up">
              <label className="field">
                <span>{t('bridge.agent')}</span>
                <input
                  list="openclaw-agents"
                  value={openClawAgentId}
                  onChange={(event) => setOpenClawAgentId(event.target.value)}
                  placeholder={t('defaults.openClawAgentId')}
                />
                <datalist id="openclaw-agents">
                  {openClawAgents.map((agent) => (
                    <option key={agent.id} value={agent.id} />
                  ))}
                </datalist>
              </label>
              <label className="field">
                <span>{t('bridge.sessionId')}</span>
                <input
                  value={openClawSessionId}
                  onChange={(event) => setOpenClawSessionId(event.target.value)}
                  placeholder={t('bridge.sessionIdPlaceholder')}
                />
              </label>
              <label className="field">
                <span>{t('bridge.thinking')}</span>
                <select value={openClawThinking} onChange={(event) => setOpenClawThinking(event.target.value as OpenClawThinkingLevel)}>
                  <option value="off">{t('bridge.thinkingLevel.off')}</option>
                  <option value="minimal">{t('bridge.thinkingLevel.minimal')}</option>
                  <option value="low">{t('bridge.thinkingLevel.low')}</option>
                  <option value="medium">{t('bridge.thinkingLevel.medium')}</option>
                  <option value="high">{t('bridge.thinkingLevel.high')}</option>
                  <option value="xhigh">{t('bridge.thinkingLevel.xhigh')}</option>
                </select>
              </label>
            </div>

            <div className="subgrid three-up">
              <label className="field">
                <span>{t('bridge.recipient')}</span>
                <input
                  value={openClawRecipient}
                  onChange={(event) => setOpenClawRecipient(event.target.value)}
                  placeholder={t('bridge.recipientPlaceholder')}
                />
              </label>
              <label className="field">
                <span>{t('bridge.channel')}</span>
                <input
                  value={openClawChannel}
                  onChange={(event) => setOpenClawChannel(event.target.value)}
                  placeholder={t('bridge.channelPlaceholder')}
                />
              </label>
              <label className="field">
                <span>{t('bridge.timeoutSeconds')}</span>
                <input
                  value={openClawTimeoutSeconds}
                  onChange={(event) => setOpenClawTimeoutSeconds(event.target.value)}
                  placeholder={t('defaults.timeoutSeconds')}
                />
              </label>
            </div>

            <div className="pill-row">
              <button type="button" className={`pill ${openClawLocal ? 'pill--ok' : 'pill--off'}`} onClick={() => setOpenClawLocal((current) => !current)}>
                {t('bridge.local')} {openClawLocal ? t('bridge.on') : t('bridge.off')}
              </button>
              <button
                type="button"
                className={`pill ${openClawDeliver ? 'pill--ok' : 'pill--off'}`}
                onClick={() => setOpenClawDeliver((current) => !current)}
              >
                {t('bridge.deliver')} {openClawDeliver ? t('bridge.on') : t('bridge.off')}
              </button>
            </div>

            <label className="field">
              <span>{t('bridge.message')}</span>
              <textarea value={openClawMessage} onChange={(event) => setOpenClawMessage(event.target.value)} rows={6} />
            </label>

            <div className="button-row">
              <button className="button" onClick={() => void onRunAgent()} disabled={Boolean(busy)}>
                {t('bridge.runAgent')}
              </button>
            </div>
          </div>

          <div className="subsection">
            <h4>{t('bridge.advancedRawCli')}</h4>
            <label className="field">
              <span>{t('bridge.cliArgs')}</span>
              <input value={openClawArgsText} onChange={(event) => setOpenClawArgsText(event.target.value)} placeholder={t('defaults.openClawArgsText')} />
            </label>
            <label className="field">
              <span>{t('bridge.payloadEnv')}</span>
              <textarea value={openClawPayload} onChange={(event) => setOpenClawPayload(event.target.value)} rows={5} />
            </label>
            <div className="button-row">
              <button className="button button--ghost" onClick={() => void onExecuteTask()} disabled={Boolean(busy)}>
                {t('bridge.executeRawCli')}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="subgrid two-up">
            <label className="field">
              <span>{t('bridge.requestPath')}</span>
              <input value={openClawRequestPath} onChange={(event) => setOpenClawRequestPath(event.target.value)} placeholder={t('defaults.openClawRequestPath')} />
            </label>
            <label className="field">
              <span>{t('bridge.method')}</span>
              <select value={openClawMethod} onChange={(event) => setOpenClawMethod(event.target.value as HttpMethod)}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>{t('bridge.requestPayload')}</span>
            <textarea value={openClawPayload} onChange={(event) => setOpenClawPayload(event.target.value)} rows={7} />
          </label>

          <label className="field">
            <span>{t('bridge.commandArgs')}</span>
            <input
              value={openClawArgsText}
              onChange={(event) => setOpenClawArgsText(event.target.value)}
              placeholder={openClawConfig.mode === 'http' ? t('bridge.commandArgsHttpPlaceholder') : t('bridge.commandArgsCommandPlaceholder')}
            />
          </label>

          <div className="button-row">
            <button className="button" onClick={() => void onExecuteTask()} disabled={Boolean(busy)}>
              {t('bridge.execute')}
            </button>
          </div>
        </>
      )}

      <pre className="result-box">{openClawResult || t('bridge.empty.result')}</pre>
    </Panel>
  );
}
