import { Agent } from './Agent';
import { join } from 'path';
import { AgentVerbosityEnum } from './@enums/agent.verbosity.enum';
import AgentLoaderType from './@types/agent.loader.type';

const WORK_DIR = '../../';

describe('Agent tests', () => {
  const agentLoader: AgentLoaderType = {
    execPath: 'test',
    settings: {
      target: 'test.sln',
      warnFilePath: 'tmp/msbuild.warn',
      errorFilePath: 'tmp/msbuild.err',
      rebuild: true,
      verbosity: AgentVerbosityEnum.quite,
    },
  };
  const agent = new Agent(agentLoader);

  it('Construct the agent and parse setting', () => {
    const flp1 = join(__dirname, WORK_DIR, 'tmp', 'msbuild.warn;warningsonly;');
    const flp2 = join(__dirname, WORK_DIR, 'tmp', 'msbuild.err;errorsonly;');
    const target = join(__dirname, WORK_DIR, 'test.sln');
    expect(agent.parseSetting).toEqual([
      'build',
      '--nologo',
      '-p:ActiveRulesets="Coding Standards"',
      '--no-incremental',
      '-flp1:logfile=' + flp1,
      '-flp2:logfile=' + flp2,
      target,
    ]);
  });

  it('Bad exec agent path should throw error', () => {
    const result = agent.runTask;
    expect(result()).rejects.toThrow();
  });
});
