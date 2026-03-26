import type { DclawSkillDefinition } from '../../shared/types';
import { InMemoryRegistry } from './base-registry';

export class SkillRegistry extends InMemoryRegistry<DclawSkillDefinition> {}
