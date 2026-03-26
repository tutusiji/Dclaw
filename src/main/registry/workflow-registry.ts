import type { DclawWorkflowDefinition } from '../../shared/types';
import { InMemoryRegistry } from './base-registry';

export class WorkflowRegistry extends InMemoryRegistry<DclawWorkflowDefinition> {}
