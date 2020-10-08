import { spawn } from 'child_process';
import { resolve } from 'path';
import { REPO_DIR, ROOT_DIR } from '../app.constants';
import { AgentConfig } from '../Config/@types';
import { Agent } from './@interfaces/agent.interface';

export const WarningFile = 'dotnetbuild.wrn';
export const ErrorFile = 'dotnetbuild.err';

export class CSharpAgent implements Agent {
  private readonly execPath: string;
  private readonly target?: string;
  private readonly debug: boolean;

  private static warningOutFile = resolve(ROOT_DIR, WarningFile);
  private static errorOutFile = resolve(ROOT_DIR, ErrorFile);

  constructor(loader: AgentConfig) {
    const { execPath, debug, target } = loader;
    this.execPath = execPath;
    this.target = target;
    this.debug = debug ?? false;
  }

  private getBuildArgs(): string[] {
    const args: string[] = [
      'build',
      '--nologo',
      '-p:ActiveRulesets="Coding Standards"',
      '-p:GenerateFullPaths=true',
      '--no-incremental',
      `-flp1:logfile=${CSharpAgent.warningOutFile};warningsonly;`,
      `-flp2:logfile=${CSharpAgent.errorOutFile};errorsonly;`,
    ];

    if (this.target) args.push(resolve(ROOT_DIR, REPO_DIR, this.target));

    return args;
  }

  async buildAndGetLogFiles(): Promise<string[]> {
    await new Promise((resolve, reject) => {
      const buildArgs = this.getBuildArgs();
      const process = spawn(this.execPath, buildArgs);

      // **must add for consume stdout for get data, close events
      process.stdout.once('data', () => console.log('DotnetBuild...'));
      process.on('close', () => resolve());
      process.on('error', (err) => reject(new Error('Agent error:' + err)));

      // debug log
      if (this.debug) {
        console.log('Task running...');
        console.log(this.execPath);
        console.log('Agent param', buildArgs);
        process.stdout.on('data', (msg) => console.log('DotnetBuild: ', msg.toString()));
      }
    });

    return [CSharpAgent.warningOutFile, CSharpAgent.errorOutFile];
  }
}
