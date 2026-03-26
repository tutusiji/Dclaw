import type { DclawTaskArtifact, DclawWorkflowDefinition } from '../../shared/types';
import { DclawSkillExecutor } from './skill-executor';

export interface DclawWorkflowExecutionResult {
  outputs: Record<string, unknown>;
  artifacts: DclawTaskArtifact[];
  logs: string[];
}

export class DclawWorkflowRunner {
  constructor(private readonly skillExecutor: DclawSkillExecutor) {}

  async run(workflow: DclawWorkflowDefinition, inputs: Record<string, unknown>): Promise<DclawWorkflowExecutionResult> {
    const logs = [`workflow:${workflow.id}`];
    const artifacts: DclawTaskArtifact[] = [];
    let lastOutputs: Record<string, unknown> = {};
    let context: Record<string, unknown> = { ...inputs };

    for (const step of workflow.steps) {
      logs.push(`step:${step.id}:${step.kind}:${step.targetId}`);
      const stepInputs = {
        ...context,
        ...(step.input ?? {})
      };

      if (step.kind !== 'skill') {
        throw new Error(`Unsupported workflow step kind: ${step.kind}`);
      }

      const result = await this.skillExecutor.execute({
        skillId: step.targetId,
        inputs: stepInputs,
        workflowId: workflow.id,
        stepId: step.id
      });

      lastOutputs = result.outputs;
      context = {
        ...context,
        ...result.outputs
      };
      artifacts.push(...result.artifacts);
      logs.push(...result.logs.map((log) => `step:${step.id}:${log}`));
    }

    return {
      outputs: lastOutputs,
      artifacts,
      logs
    };
  }
}
