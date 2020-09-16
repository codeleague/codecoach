type Command = { cmd: string[]; cwd: string };
export type CommandSequence = Command[];
export type GitConfig = {
  src: string;
  dest: string;
  prId: number;
};

export default interface GitInterface {
  config: GitConfig;
  commands: CommandSequence;

  clone: () => Promise<void>;
  clearRepo: () => Promise<void>;
}
