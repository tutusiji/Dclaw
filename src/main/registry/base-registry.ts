export class InMemoryRegistry<T extends { id: string }> {
  protected readonly entries = new Map<string, T>();

  register(entry: T): void {
    this.entries.set(entry.id, entry);
  }

  get(id: string): T | undefined {
    return this.entries.get(id);
  }

  list(): T[] {
    return [...this.entries.values()].sort((left, right) => left.id.localeCompare(right.id));
  }

  size(): number {
    return this.entries.size;
  }
}
