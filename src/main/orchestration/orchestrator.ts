import type { DclawRunStatus, DclawTaskRun, DclawTaskSourceType } from '../../shared/types';
import { RunLogStore } from '../storage/run-log-store';

function createRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export class DclawOrchestrator {
  constructor(private readonly runLogStore: RunLogStore) {}

  async startRun(input: {
    sourceType: DclawTaskSourceType;
    sourceId?: string;
    agentId?: string;
    workflowId?: string;
    skillIds?: string[];
    inputs?: Record<string, unknown>;
  }): Promise<DclawTaskRun> {
    const run: DclawTaskRun = {
      id: createRunId(),
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      status: 'running',
      agentId: input.agentId,
      workflowId: input.workflowId,
      skillIds: input.skillIds ?? [],
      startedAt: new Date().toISOString(),
      inputs: input.inputs,
      artifacts: [],
      logs: []
    };

    return this.runLogStore.append(run);
  }

  async finishRun(
    runId: string,
    status: Extract<DclawRunStatus, 'succeeded' | 'failed' | 'cancelled'>,
    patch?: {
      outputs?: Record<string, unknown>;
      artifacts?: DclawTaskRun['artifacts'];
      error?: string;
      logs?: string[];
    }
  ): Promise<DclawTaskRun | null> {
    return this.runLogStore.update(runId, (run) => ({
      ...run,
      status,
      finishedAt: new Date().toISOString(),
      outputs: patch?.outputs ?? run.outputs,
      artifacts: patch?.artifacts ?? run.artifacts,
      error: patch?.error ?? run.error,
      logs: patch?.logs ?? run.logs
    }));
  }
}
