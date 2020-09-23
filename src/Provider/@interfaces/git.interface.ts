import GitConfigType from '../@types/git.config.type';

type Command = { cmd: string[]; cwd: string };
export type CommandSequence = Command[];
export default interface GitInterface {
  config: GitConfigType;
  commands: CommandSequence;

  clone: () => Promise<void>;
  clearRepo: () => Promise<void>;
}
