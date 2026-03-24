import { execFile } from 'node:child_process';

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export function runCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeoutMs?: number;
    env?: NodeJS.ProcessEnv;
  } = {}
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      {
        cwd: options.cwd,
        env: options.env,
        timeout: options.timeoutMs ?? 30_000,
        maxBuffer: 10 * 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          const wrapped = new Error(stderr || error.message);
          wrapped.cause = error;
          reject(wrapped);
          return;
        }

        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      }
    );
  });
}
