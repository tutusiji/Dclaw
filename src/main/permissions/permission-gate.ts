import type { DclawPermissionKey, DclawPermissionSet } from '../../shared/types';

export interface DclawPermissionEvaluation {
  granted: boolean;
  missingKeys: DclawPermissionKey[];
  missingPathScopes: string[];
  missingNetworkDomains: string[];
  requiresConfirmation: boolean;
}

export class PermissionGate {
  evaluate(required: DclawPermissionSet, granted: DclawPermissionSet = required): DclawPermissionEvaluation {
    const grantedKeys = new Set(granted.keys);
    const grantedPathScopes = new Set(granted.pathScopes ?? []);
    const grantedNetworkDomains = new Set(granted.networkDomains ?? []);

    const missingKeys = required.keys.filter((key) => !grantedKeys.has(key));
    const missingPathScopes = (required.pathScopes ?? []).filter((scope) => !grantedPathScopes.has(scope));
    const missingNetworkDomains = (required.networkDomains ?? []).filter((domain) => !grantedNetworkDomains.has(domain));

    return {
      granted: missingKeys.length === 0 && missingPathScopes.length === 0 && missingNetworkDomains.length === 0,
      missingKeys,
      missingPathScopes,
      missingNetworkDomains,
      requiresConfirmation: Boolean(required.requiresConfirmation)
    };
  }

  describe(permissionSet: DclawPermissionSet): string[] {
    const lines = permissionSet.keys.map((key) => `permission:${key}`);

    (permissionSet.pathScopes ?? []).forEach((scope) => {
      lines.push(`path:${scope}`);
    });

    (permissionSet.networkDomains ?? []).forEach((domain) => {
      lines.push(`network:${domain}`);
    });

    if (permissionSet.requiresConfirmation) {
      lines.push('confirmation:required');
    }

    return lines;
  }
}
