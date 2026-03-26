import type { DclawAgentDefinition } from '../../shared/types';
import { InMemoryRegistry } from './base-registry';

export class AgentRegistry extends InMemoryRegistry<DclawAgentDefinition> {}
