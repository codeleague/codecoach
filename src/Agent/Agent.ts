import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { join } from 'path';
import { AgentVerbosityEnum } from './@enums/agent.verbosity.enum';
import AgentInterface from './@interfaces/agent.interface';
import AgentLoaderType from './@types/agent.loader.type';
import { DEFAULT_ERR_FILE, DEFAULT_WARN_FILE, WORK_DIR } from './agent.constant';

export type AgentSettings = {
  target: string;
  warnFilePath?: string;
  errorFilePath?: string;
  rebuild: boolean;
  verbosity: AgentVerbosityEnum;
  optional?: string[];
};

enum LogServerity {
  warn = 'warningsonly',
  error = 'errorsonly',
}

export class Agent implements AgentInterface {
  execPath: string;
  settings: AgentSettings;
  parseSetting: string[];
  process: ChildProcessWithoutNullStreams;
  debug = false;

  constructor(loader: AgentLoaderType) {
    const { execPath, settings, debug } = loader;
    this.execPath = execPath;
    this.settings = settings;
    this.parseSetting = this.settingsParse(settings);
    debug && (this.debug = debug);
  }

  private pathJoin(paths: string): string {
    return join(__dirname, WORK_DIR, paths);
  }

  private settingsParse(settings: AgentSettings): string[] {
    // for flp Msbuild.exe setting
    let fileLoggerN = 1;
    const fileLoggerConfig = (
      n: number,
      path: string,
      serverity: LogServerity,
    ): string => {
      return `-flp${n}:logfile=${path};${serverity};`;
    };

    const config: string[] = [];
    // default setting
    const DEFAULT_SETINGS = ['build', '--nologo', '-p:ActiveRulesets="Coding Standards"'];
    config.push(...DEFAULT_SETINGS);

    // read from config
    if (settings.rebuild) config.push('--no-incremental');

    // warn file
    config.push(
      fileLoggerConfig(
        fileLoggerN,
        this.pathJoin(settings.warnFilePath || DEFAULT_WARN_FILE),
        LogServerity.warn,
      ),
    );
    fileLoggerN++;

    config.push(
      fileLoggerConfig(
        fileLoggerN,
        this.pathJoin(settings.errorFilePath || DEFAULT_ERR_FILE),
        LogServerity.error,
      ),
    );
    fileLoggerN++;

    if (settings.target) config.push(this.pathJoin(settings.target));

    return config;
  }

  async runTask(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.execPath, this.parseSetting);

      // **must add for consume stdout for get data, close events
      process.stdout.once('data', () => console.log('DotnetBuild...'));

      process.on('close', async () => {
        return resolve();
      });

      process.on('error', (err) => {
        return reject('Agent error:' + err);
      });

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