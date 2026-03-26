import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

function cloneDefaultValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class JsonFileStore<T> {
  constructor(
    private readonly filePath: string,
    private readonly defaultValue: T
  ) {}

  async read(): Promise<T> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return cloneDefaultValue(this.defaultValue);
      }
      throw error;
    }
  }

  async write(value: T): Promise<void> {
    await fs.mkdir(dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(value, null, 2), 'utf8');
  }

  async update(updater: (value: T) => T | Promise<T>): Promise<T> {
    const current = await this.read();
    const next = await updater(current);
    await this.write(next);
    return next;
  }
}
