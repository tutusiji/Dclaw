import type { DclawInstallation } from '../../shared/types';
import { JsonFileStore } from './json-file-store';

export class InstallationStore {
  private readonly store: JsonFileStore<DclawInstallation[]>;

  constructor(filePath: string) {
    this.store = new JsonFileStore(filePath, [] as DclawInstallation[]);
  }

  async list(): Promise<DclawInstallation[]> {
    const installations = await this.store.read();
    return [...installations].sort((left, right) => left.packageId.localeCompare(right.packageId));
  }

  async count(): Promise<number> {
    const installations = await this.store.read();
    return installations.length;
  }

  async upsertMany(nextInstallations: DclawInstallation[]): Promise<void> {
    await this.store.update((current) => {
      const currentById = new Map(current.map((installation) => [installation.packageId, installation]));

      nextInstallations.forEach((installation) => {
        const existing = currentById.get(installation.packageId);
        currentById.set(installation.packageId, {
          ...installation,
          installedAt: existing?.installedAt ?? installation.installedAt,
          grantedPermissions: existing?.grantedPermissions ?? installation.grantedPermissions,
          enabled: existing?.enabled ?? installation.enabled
        });
      });

      return [...currentById.values()].sort((left, right) => left.packageId.localeCompare(right.packageId));
    });
  }
}
