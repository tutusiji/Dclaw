import type { DclawTaskTemplate } from '../../shared/types';
import { InMemoryRegistry } from './base-registry';

export class TaskTemplateRegistry extends InMemoryRegistry<DclawTaskTemplate> {}
