import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { resolve } from 'path';
import { REPO_DIR, ROOT_DIR } from '../app.constants';
import AgentInterface from './@interfaces/agent.interface';
import { AgentConfig } from '../Config/@types';
import { AgentSettings } from './@types/agentSettings';
import { LogSeverity } from './@enums/LogSeverity';

export class Agent implements AgentInterface {
  execPath: string;
  settings: AgentSettings;
  parseSetting: string[];
  process: ChildProcessWithoutNullStreams;
  debug = false;

  constructor(loader: AgentConfig) {
    const { execPath, settings, debug } = loader;
    this.execPath = execPath;
    this.settings = settings;
    this.parseSetting = Agent.settingsParse(settings);
    debug && (this.debug = debug);
  }

  private static pathJoin(...paths: string[]): string {
    return resolve(ROOT_DIR, ...paths);
  }

  private static fileLoggerConfig(
    n: number,
    path: string,
    severity: LogSeverity,
  ): string {
    return `-flp${n}:logfile=${path};${severity};`;
  }

  private static settingsParse(settings: AgentSettings): string[] {
    // for flp Msbuild.exe setting
    let fileLoggerN = 1;

    // default settings
    const config: string[] = [
      'build',
      '--nologo',
      '-p:ActiveRulesets="Coding Standards"',
      '-p:GenerateFullPaths=true',
    ];

    // read from config
    if (settings.rebuild) config.push('--no-incremental');

    // warn file
    config.push(
      Agent.fileLoggerConfig(
        fileLoggerN,
        Agent.pathJoin(settings.warnFilePath),
        LogSeverity.warn,
      ),
    );
    fileLoggerN++;

    config.push(
      Agent.fileLoggerConfig(
        fileLoggerN,
        Agent.pathJoin(settings.errorFilePath),
        LogSeverity.error,
      ),
    );
    fileLoggerN++;

    if (settings.target) config.push(Agent.pathJoin(REPO_DIR, settings.target));

    return config;
  }

  async runTask(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.execPath, this.parseSetting);

      // **must add for consume stdout for get data, close events
      process.stdout.once('data', () => console.log('DotnetBuild...'));
      process.on('close', () => resolve());
      process.on('error', (err) => reject('Agent error:' + err));

      // debug log
      if (this.debug) {
        console.log('Task running...');
        console.log('Debug', this.debug);
        console.log(this.execPath);
        console.log('Agent param', this.parseSetting);
        process.stdout.on('data', (msg) => console.log('DotnetBuild: ', msg.toString()));
      }
    });
  }
}
