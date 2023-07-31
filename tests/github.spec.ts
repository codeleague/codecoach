import type { StartedTestContainer } from 'testcontainers';
import { ConfigParser } from '../src/Config';
import { App } from '../src/app';
import {
  configureHttpMockServerWithYaml,
  getHttpMockServerHistory,
  sortByRequestPath,
  startHttpMockServer,
  stopHttpMockServer,
} from './utils';

jest.setTimeout(15000);

describe('GitHub', () => {
  let github: StartedTestContainer;

  beforeEach(async () => {
    github = await startHttpMockServer();
    await configureHttpMockServerWithYaml(github, './tests/githubmock.yml');
  });

  afterEach(async () => {
    stopHttpMockServer(github);
  });

  it('should correctly report to github', async () => {
    const host = github.getHost();
    const port = github.getMappedPort(8080);
    const configs = ConfigParser([
      'node',
      'app.ts',
      '--vcs="github"',
      `--githubRepoUrl=http://${host}:${port}/codecoach-bro/testproject`,
      `--githubPr=1`,
      `--githubToken=privatetoken`,
      `-f=eslint;./tests/eslint-report.json;/Users/codeleague/example`,
      `-o=output.log`,
      '--removeOldComment',
      '--failOnWarnings',
    ]);
    const app = new App(configs);
    await app.start();

    const history = await getHttpMockServerHistory(github as StartedTestContainer);

    expect(history).toHaveLength(10);
    expect(history.sort(sortByRequestPath)).toMatchObject(
      [
        {
          request: {
            path: '/api/v3/repos/codecoach-bro/testproject/pulls/1',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v3/repos/codecoach-bro/testproject/pulls/1/files',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v3/repos/codecoach-bro/testproject/pulls/1/comments',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v3/repos/codecoach-bro/testproject/issues/1/comments',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v3/user',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v3/repos/codecoach-bro/testproject/issues/comments/1653381079',
            method: 'DELETE',
          },
        },
        {
          request: {
            path: '/api/v3/repos/codecoach-bro/testproject/pulls/comments/1276113835',
            method: 'DELETE',
          },
        },
        {
          request: {
            path: '/api/v3/repos/codecoach-bro/testproject/pulls/1/comments',
            method: 'POST',
          },
        },
        {
          request: {
            path: '/api/v3/repos/codecoach-bro/testproject/issues/1/comments',
            method: 'POST',
            body: {
              body:
                '## CodeCoach reports 1 issue\n:rotating_light: 1 error\n:warning: 0 warning',
            },
          },
        },
        {
          request: {
            path:
              '/api/v3/repos/codecoach-bro/testproject/statuses/92e39f6e1ebb55485234a5531402bb14ad4fbf2c',
            method: 'POST',
          },
        },
      ].sort(sortByRequestPath),
    );
  });
});
