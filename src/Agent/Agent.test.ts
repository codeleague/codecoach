import { Agent } from './Agent';
import { join } from 'path';
import { AgentVerbosityEnum } from './@enums/agent.verbosity.enum';
import AgentLoaderType from './@types/agent.loader.type';
import { AGENT_ALIAS_PATH, AGENT_TARGET_BUILD_ALIAS_PATH } from './agent.constant';

const WORK_DIR = '../../';

describe('Agent tests', () => {
  const agentLoader: AgentLoaderType = {
    execPath: 'test',
    settings: {
      target: 'test.sln',
      warnFilePath: 'msbuild.warn',
      errorFilePath: 'msbuild.err',
      rebuild: true,
      verbosity: AgentVerbosityEnum.quite,
    },
  };
  const agent = new Agent(agentLoader);

  it('Construct the agent and parse setting', () => {
    const flp1 = join(
      __dirname,
      WORK_DIR,
      AGENT_ALIAS_PATH,
      'msbuild.warn;warningsonly;',
    );
    const flp2 = join(__dirname, WORK_DIR, AGENT_ALIAS_PATH, 'msbuild.err;errorsonly;');
    const target = join(
      __dirname,
      WORK_DIR,
      AGENT_ALIAS_PATH,
      AGENT_TARGET_BUILD_ALIAS_PATH,
      'test.sln',
    );
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
