type Command = { cmd: string[]; cwd: string };
export type CommandSequence = Command[];
export default interface GitInterface {
  commands: CommandSequence;

  clone: () => Promise<void>;
  clearRepo: () => Promise<void>;
}
