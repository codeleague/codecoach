import { REPO_DIR, ROOT_DIR } from '../app.constants';
import { Agent } from './Agent';
import { resolve } from 'path';
import { AgentVerbosityEnum } from './@enums/agent.verbosity.enum';
import { AgentConfig } from '../Config/@types';

describe('Agent tests', () => {
  const agentLoader: AgentConfig = {
    execPath: 'test',
    settings: {
      target: 'test.sln',
      warnFilePath: 'msbuild.warn',
      errorFilePath: 'msbuild.err',
      rebuild: true,
      verbosity: AgentVerbosityEnum.quiet,
    },
  };
  const agent = new Agent(agentLoader);

  it('Construct the agent and parse setting', () => {
    const flp1 = resolve(ROOT_DIR, 'msbuild.warn;warningsonly;');
    const flp2 = resolve(ROOT_DIR, 'msbuild.err;errorsonly;');
    const target = resolve(ROOT_DIR, REPO_DIR, 'test.sln');
    expect(agent.parseSetting).toEqual([
      'build',
      '--nologo',
      '-p:ActiveRulesets="Coding Standards"',
      '-p:GenerateFullPaths=true',
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
