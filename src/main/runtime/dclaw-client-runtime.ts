import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type {
  DclawAgentDefinition,
  DclawClientRuntimeSnapshot,
  DclawInstallation,
  DclawSkillDefinition,
  DclawTaskExecutionResult,
  DclawTaskRun,
  DclawTaskTemplateExecutionRequest,
  DclawTaskTemplate,
  DclawWorkflowDefinition
} from '../../shared/types';
import { DclawOrchestrator } from '../orchestration/orchestrator';
import { PermissionGate } from '../permissions/permission-gate';
import { AgentRegistry } from '../registry/agent-registry';
import { SkillRegistry } from '../registry/skill-registry';
import { TaskTemplateRegistry } from '../registry/task-template-registry';
import { WorkflowRegistry } from '../registry/workflow-registry';
import { InstallationStore } from '../storage/installation-store';
import { RunLogStore } from '../storage/run-log-store';
import {
  builtInAgentDefinitions,
  builtInPackageManifests,
  builtInSkillDefinitions,
  builtInTaskTemplates,
  builtInWorkflowDefinitions
} from './builtins';
import { DclawPackageManager } from './package-manager';
import { DclawSkillExecutor } from './skill-executor';
import { DclawWorkflowRunner } from './workflow-runner';

function normalizeRunResult(
  run: DclawTaskRun | null,
  fallback: DclawTaskRun,
  outputs: Record<string, unknown> | undefined,
  artifacts: DclawTaskExecutionResult['artifacts'],
  logs: string[]
): DclawTaskExecutionResult {
  return {
    run: run ?? {
      ...fallback,
      outputs,
      artifacts,
      logs
    },
    outputs,
    artifacts,
    logs
  };
}

export class DclawClientRuntime {
  private constructor(
    private readonly rootPath: string,
    private readonly packageRoot: string,
    private readonly stateRoot: string,
    private readonly connectors: string[],
    private readonly skillRegistry: SkillRegistry,
    private readonly agentRegistry: AgentRegistry,
    private readonly workflowRegistry: WorkflowRegistry,
    private readonly taskTemplateRegistry: TaskTemplateRegistry,
    private readonly packageManager: DclawPackageManager,
    private readonly runLogStore: RunLogStore,
    private readonly workflowRunner: DclawWorkflowRunner,
    readonly orchestrator: DclawOrchestrator
  ) {}

  static async bootstrap(userDataPath: string): Promise<DclawClientRuntime> {
    const rootPath = join(userDataPath, 'dclaw-client');
    const packageRoot = join(rootPath, 'packages');
    const stateRoot = join(rootPath, 'state');

    await fs.mkdir(packageRoot, { recursive: true });
    await fs.mkdir(stateRoot, { recursive: true });

    const skillRegistry = new SkillRegistry();
    const agentRegistry = new AgentRegistry();
    const workflowRegistry = new WorkflowRegistry();
    const taskTemplateRegistry = new TaskTemplateRegistry();

    builtInSkillDefinitions.forEach((definition) => skillRegistry.register(definition));
    builtInAgentDefinitions.forEach((definition) => agentRegistry.register(definition));
    builtInWorkflowDefinitions.forEach((definition) => workflowRegistry.register(definition));
    builtInTaskTemplates.forEach((definition) => taskTemplateRegistry.register(definition));

    const permissionGate = new PermissionGate();
    const packageManager = new DclawPackageManager(
      new InstallationStore(join(stateRoot, 'installations.json')),
      permissionGate
    );
    const runLogStore = new RunLogStore(join(stateRoot, 'task-runs.json'));
    const skillExecutor = new DclawSkillExecutor();
    const workflowRunner = new DclawWorkflowRunner(skillExecutor);
    const orchestrator = new DclawOrchestrator(runLogStore);

    await packageManager.syncBuiltInPackages(builtInPackageManifests);

    return new DclawClientRuntime(
      rootPath,
      packageRoot,
      stateRoot,
      ['openclaw'],
      skillRegistry,
      agentRegistry,
      workflowRegistry,
      taskTemplateRegistry,
      packageManager,
      runLogStore,
      workflowRunner,
      orchestrator
    );
  }

  async getSnapshot(): Promise<DclawClientRuntimeSnapshot> {
    return {
      rootPath: this.rootPath,
      packageRoot: this.packageRoot,
      stateRoot: this.stateRoot,
      registries: {
        skills: this.skillRegistry.size(),
        agents: this.agentRegistry.size(),
        workflows: this.workflowRegistry.size(),
        taskTemplates: this.taskTemplateRegistry.size(),
        installations: await this.packageManager.countInstallations(),
        taskRuns: await this.runLogStore.count()
      },
      connectors: [...this.connectors]
    };
  }

  listSkills(): DclawSkillDefinition[] {
    return this.skillRegistry.list();
  }

  listAgents(): DclawAgentDefinition[] {
    return this.agentRegistry.list();
  }

  listWorkflows(): DclawWorkflowDefinition[] {
    return this.workflowRegistry.list();
  }

  listTaskTemplates(): DclawTaskTemplate[] {
    return this.taskTemplateRegistry.list();
  }

  async listInstallations(): Promise<DclawInstallation[]> {
    return this.packageManager.listInstallations();
  }

  async listTaskRuns(limit = 50): Promise<DclawTaskRun[]> {
    return this.runLogStore.list(limit);
  }

  async runTaskTemplate(request: DclawTaskTemplateExecutionRequest): Promise<DclawTaskExecutionResult> {
    const taskTemplate = this.taskTemplateRegistry.get(request.taskTemplateId);
    if (!taskTemplate) {
      throw new Error(`Unknown task template: ${request.taskTemplateId}`);
    }

    return this.runWorkflow(taskTemplate.workflowId, request.inputs ?? {}, 'task_template', taskTemplate.id);
  }

  private async runWorkflow(
    workflowId: string,
    inputs: Record<string, unknown>,
    sourceType: DclawTaskRun['sourceType'],
    sourceId?: string
  ): Promise<DclawTaskExecutionResult> {
    const workflow = this.workflowRegistry.get(workflowId);
    if (!workflow) {
      throw new Error(`Unknown workflow: ${workflowId}`);
    }

    const run = await this.orchestrator.startRun({
      sourceType,
      sourceId,
      workflowId,
      skillIds: workflow.requiredSkillIds,
      inputs
    });
    const logs = [`workflow:${workflow.id}`, `source:${sourceType}${sourceId ? `:${sourceId}` : ''}`];

    try {
      const outcome = await this.workflowRunner.run(workflow, inputs);
      logs.push(...outcome.logs);

      const completedRun = await this.orchestrator.finishRun(run.id, 'succeeded', {
        outputs: outcome.outputs,
        artifacts: outcome.artifacts,
        logs
      });

      return normalizeRunResult(completedRun, run, outcome.outputs, outcome.artifacts, logs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown workflow execution error';
      logs.push(`error:${message}`);

      const failedRun = await this.orchestrator.finishRun(run.id, 'failed', {
        error: message,
        logs
      });

      return normalizeRunResult(failedRun, { ...run, status: 'failed', error: message }, undefined, [], logs);
    }
  }
}
