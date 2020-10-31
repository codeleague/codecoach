import { resolve } from 'path';
import { ChildProcess, spawn as baseSpawn } from 'child_process';
import { mocked } from 'ts-jest/utils';

import { REPO_DIR, ROOT_DIR } from '../app.constants';
import { AgentConfig } from '../Config/@types';
import { CSharpAgent, ErrorFile, WarningFile } from './CSharpAgent';

jest.mock('child_process');

const spawn = mocked(baseSpawn, true);

describe('CSharpAgent', () => {
  const agentLoader: AgentConfig = {
    execPath: 'test',
    target: 'test.sln',
  };

  it('should create child process with arguments and return log files', async () => {
    const mockedResolveListener = jest.fn((e: string, cb: () => void) => {
      if (e === 'close') cb();
    });

    spawn.mockImplementation(() => {
      return ({
        stdout: { once: jest.fn() },
        on: mockedResolveListener,
      } as unknown) as ChildProcess;
    });

    const agent = new CSharpAgent(agentLoader);

    const files = await agent.buildAndGetLogFiles();

    const expectedWarningFile = resolve(ROOT_DIR, WarningFile);
    const expectedErrorFile = resolve(ROOT_DIR, ErrorFile);
    const expectedSolutionFile = resolve(ROOT_DIR, REPO_DIR, agentLoader.target!);
    const expectedArgs = [
      'build',
      '--nologo',
      '-p:ActiveRulesets="Coding Standards"',
      '-p:GenerateFullPaths=true',
      '--no-incremental',
      `-flp1:logfile=${expectedWarningFile};warningsonly;`,
      `-flp2:logfile=${expectedErrorFile};errorsonly;`,
      expectedSolutionFile,
    ];

    expect(files).toHaveLength(2);
    expect(spawn).toHaveBeenNthCalledWith(1, agentLoader.execPath, expectedArgs);
  });

  it('should rejects with child process has error', async () => {
    const mockedRejectListener = jest.fn((e: string, cb: (err: string) => void) => {
      if (e === 'error') cb('Failed!');
    });

    spawn.mockImplementation(() => {
      return ({
        stdout: { once: jest.fn() },
        on: mockedRejectListener,
      } as unknown) as ChildProcess;
    });

    const agent = new CSharpAgent(agentLoader);

    await expect(agent.buildAndGetLogFiles()).rejects.toThrow();
  });
});
