import { exec } from 'child_process';
import { resolve } from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { REPO_DIR } from '../../app.constants';
import GitInterface, { CommandSequence } from '../@interfaces/git.interface';
import GitConfigType from '../@types/git.config.type';
import { GIT_CHECKOUT, GIT_CLONE, GIT_EXEC, GIT_FETCH } from '../constants/git.constant';

const rimrafAsync = promisify(rimraf);

const PULLS = (n: number) => `pull/${n}/head`;

export class Git implements GitInterface {
  commands: CommandSequence;
  rootPath: string;
  projectPath: string;

  constructor(config: GitConfigType) {
    this.rootPath = resolve(config.dest);
    this.projectPath = resolve(config.dest, REPO_DIR);

    this.commands = [
      {
        cmd: [GIT_EXEC, GIT_CLONE, config.src, this.projectPath],
        cwd: this.rootPath,
      },
      {
        cmd: [GIT_EXEC, GIT_FETCH, 'origin', PULLS(config.prId)],
        cwd: this.projectPath,
      },
      {
        cmd: [GIT_EXEC, GIT_CHECKOUT, '-b', 'pullrequest', 'FETCH_HEAD'],
        cwd: this.projectPath,
      },
    ];
  }

  async clearRepo(): Promise<void> {
    await rimrafAsync(this.projectPath);
  }

  async clone(): Promise<void> {
    try {
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
  }
}
