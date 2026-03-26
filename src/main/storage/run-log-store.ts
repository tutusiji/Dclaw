import type { DclawTaskRun } from '../../shared/types';
import { JsonFileStore } from './json-file-store';

export class RunLogStore {
  private readonly store: JsonFileStore<DclawTaskRun[]>;

  constructor(filePath: string) {
    this.store = new JsonFileStore(filePath, [] as DclawTaskRun[]);
  }

  async list(limit = 50): Promise<DclawTaskRun[]> {
    const runs = await this.store.read();
    return [...runs]
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
      .slice(0, limit);
  }

  async count(): Promise<number> {
    const runs = await this.store.read();
    return runs.length;
  }

  async append(run: DclawTaskRun): Promise<DclawTaskRun> {
    await this.store.update((runs) => [...runs, run]);
    return run;
  }

  async update(runId: string, updater: (run: DclawTaskRun) => DclawTaskRun): Promise<DclawTaskRun | null> {
    let updatedRun: DclawTaskRun | null = null;

    await this.store.update((runs) =>
      runs.map((run) => {
        if (run.id !== runId) {
          return run;
        }

        updatedRun = updater(run);
        return updatedRun;
      })
    );

    return updatedRun;
  }
}
