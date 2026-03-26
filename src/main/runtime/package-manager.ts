import type { DclawInstallation, DclawPackageManifest } from '../../shared/types';
import { PermissionGate } from '../permissions/permission-gate';
import { InstallationStore } from '../storage/installation-store';

export class DclawPackageManager {
  constructor(
    private readonly installationStore: InstallationStore,
    private readonly permissionGate: PermissionGate
  ) {}

  async syncBuiltInPackages(manifests: DclawPackageManifest[]): Promise<void> {
    const now = new Date().toISOString();
    const installations: DclawInstallation[] = manifests.map((manifest) => ({
      packageId: manifest.id,
      version: manifest.version,
      packageType: manifest.type,
      installSource: 'built-in',
      installedAt: now,
      grantedPermissions: manifest.permissions,
      enabled: true
    }));

    await this.installationStore.upsertMany(installations);
  }

  evaluateManifest(manifest: DclawPackageManifest, grantedPermissions = manifest.permissions) {
    return this.permissionGate.evaluate(manifest.permissions, grantedPermissions);
  }

  async listInstallations(): Promise<DclawInstallation[]> {
    return this.installationStore.list();
  }

  async countInstallations(): Promise<number> {
    return this.installationStore.count();
  }
}
