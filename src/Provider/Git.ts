import { exec } from 'child_process';
import { join } from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import GitInterface, { CommandSequence, GitConfig } from './@interfaces/git.interface';
import { GitConfigConstructor } from './@types/git.config.constructor';

const DEFAULT_CLONE_PATH = 'tmp';
const WORK_DIR = '../../';
const DEFAULT_CLONE_ALIAS_PATH = './repo';
const GIT_EXEC = 'git';
const GIT_CLONE = 'clone';
const GIT_FETCH = 'fetch';
const GIT_CHECKOUT = 'checkout';

const PULLS = (n: number) => `pull/${n}/head`;

export class Git implements GitInterface {
  config: GitConfig;
  commands: CommandSequence;

  constructor(config: GitConfigConstructor) {
    this.config = {
      ...config,
      dest: config.dest || DEFAULT_CLONE_PATH,
    };

    const ROOT_PATH = join(__dirname, WORK_DIR, DEFAULT_CLONE_PATH);
    const PROJECT_PATH = join(
      __dirname,
      WORK_DIR,
      this.config.dest,
      DEFAULT_CLONE_ALIAS_PATH,
    );
    const commands: CommandSequence = [
      //   clone
      {
        cmd: [GIT_EXEC, GIT_CLONE, config.src, PROJECT_PATH],
        cwd: ROOT_PATH,
      },
      //   fetch
      { cmd: [GIT_EXEC, GIT_FETCH, 'origin', PULLS(config.prId)], cwd: PROJECT_PATH },
      //checkout
      {
        cmd: [GIT_EXEC, GIT_CHECKOUT, '-b', 'pullrequest', 'FETCH_HEAD'],
        cwd: PROJECT_PATH,
      },
    ];
    this.commands = commands;
  }

  async clearRepo(): Promise<void> {
    const PROJECT_PATH = join(
      __dirname,
      WORK_DIR,
      this.config.dest,
      DEFAULT_CLONE_ALIAS_PATH,
    );
    return new Promise((resolve, rejects) => {
      rimraf(PROJECT_PATH, (err) => {
        if (err) return rejects(err);
        resolve();
      });
    });
  }

  async clone(): Promise<void> {
    try {
      const commands = this.commands;
      await this.clearRepo();
      for (const command of commands) {
        const process = promisify(exec);
        const git = await process(command.cmd.join(' '), { cwd: command.cwd });
        console.log('err', git.stderr);
        console.log('output', git.stdout);
      }
    } catch (err) {
      throw new Error(err);
    }
    return;
  }
}
