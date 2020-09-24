import { exec } from 'child_process';
import { join } from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import GitInterface, { CommandSequence } from '../@interfaces/git.interface';
import GitConfigType from '../@types/git.config.type';
import GitLoaderType from '../@types/git.loader.type';
import {
  GIT_DEFAULT_CLONE_PATH,
  GIT_DEFAULT_CLONE_ALIAS_PATH,
  GIT_EXEC,
  GIT_CLONE,
  GIT_FETCH,
  GIT_CHECKOUT,
  GIT_WORK_DIR,
} from '../constants/git.constant';

const PULLS = (n: number) => `pull/${n}/head`;

export class Git implements GitInterface {
  config: GitConfigType;
  commands: CommandSequence;

  constructor(config: GitLoaderType) {
    this.config = {
      ...config,
      dest: config.dest || GIT_DEFAULT_CLONE_PATH,
      cloneBypass: config.cloneBypass || false,
    };

    const ROOT_PATH = join(__dirname, GIT_WORK_DIR, GIT_DEFAULT_CLONE_PATH);
    const PROJECT_PATH = join(
      __dirname,
      GIT_WORK_DIR,
      this.config.dest,
      GIT_DEFAULT_CLONE_ALIAS_PATH,
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
      GIT_WORK_DIR,
      this.config.dest,
      GIT_DEFAULT_CLONE_ALIAS_PATH,
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
      if (this.config.cloneBypass) {
        console.log('Git clone bypass');
        return;
      }
      const commands = this.commands;
      await this.clearRepo();
      for (const command of commands) {
        const process = promisify(exec);
        const git = await process(command.cmd.join(' '), { cwd: command.cwd });
        if (git.stderr) console.log('std:', git.stderr);
        if (git.stdout) console.log('std:', git.stdout);
      }
    } catch (err) {
      throw new Error(err);
    }
    return;
  }
}
