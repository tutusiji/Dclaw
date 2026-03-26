import type { FileDialogLikeFilter } from '../app-utils';

export function useFileDialogActions() {
  async function pickFilesInto(setter: (value: string) => void, filters: FileDialogLikeFilter[]) {
    const files = await window.dclaw.app.pickFiles(filters);
    if (files.length > 0) {
      setter(files.join('\n'));
    }
  }

  async function pickDirectoryInto(setter: (value: string) => void) {
    const path = await window.dclaw.app.pickDirectory();
    if (path) {
      setter(path);
    }
  }

  async function pickSavePathInto(setter: (value: string) => void, defaultPath: string, filters: FileDialogLikeFilter[]) {
    const path = await window.dclaw.app.pickSavePath(defaultPath, filters);
    if (path) {
      setter(path);
    }
  }

  return {
    pickFilesInto,
    pickDirectoryInto,
    pickSavePathInto
  };
}
