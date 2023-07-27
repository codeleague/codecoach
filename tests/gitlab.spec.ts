import type { StartedTestContainer } from 'testcontainers';
import { ConfigParser } from '../src/Config';
import { App } from '../src/app';
import {
  configureHttpMockServerWithYaml,
  getHttpMockServerHistory,
  startHttpMockServer,
  stopHttpMockServer,
} from './utils';
import CodeCoachError from '../src/CodeCoachError';

jest.setTimeout(15000);

describe('GitLab', () => {
  let gitlab: StartedTestContainer;

  beforeEach(async () => {
    gitlab = await startHttpMockServer();
    await configureHttpMockServerWithYaml(gitlab, './tests/gitlabmock.yml');
  });

  afterEach(async () => {
    stopHttpMockServer(gitlab);
  });

  it('should correctly report to GitLab', async () => {
    const configs = ConfigParser([
      'node',
      'app.ts',
      '--vcs="gitlab"',
      `--gitlabHost=http://${gitlab.getHost()}:${gitlab.getMappedPort(8080)}`,
      `--gitlabProjectId=1`,
      `--gitlabMrIid=1`,
      `--gitlabToken=privatetoken`,
      `-f=eslint;./tests/eslint-report.json;/Users/codeleague/example`,
      `-o=output.log`,
      '--removeOldComment',
      '--failOnWarnings',
    ]);
    const app = new App(configs);
    const undertest = () => app.start();

    await expect(undertest).rejects.toThrow(
      new CodeCoachError(
        'There are some linting error and exit code reporting is enabled',
      ),
    );

    const history = await getHttpMockServerHistory(gitlab as StartedTestContainer);

    // for matching unordered array
    const sortByRequestPath = (
      a: { request: { path: string } },
      b: { request: { path: string } },
    ) => a.request?.path.localeCompare(b.request.path);

    expect(history).toHaveLength(8);
    expect(history.sort(sortByRequestPath)).toMatchObject(
      [
        {
          request: {
            path: '/api/v4/projects/1/merge_requests/1/changes',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v4/projects/1/merge_requests/1/versions',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v4/user',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v4/projects/1/merge_requests/1/notes',
            method: 'GET',
          },
        },
        {
          request: {
            path: '/api/v4/projects/1/merge_requests/1/notes/987654',
            method: 'DELETE',
          },
        },
        {
          request: {
            path: '/api/v4/projects/1/merge_requests/1/notes/987655',
            method: 'DELETE',
          },
        },
        {
          request: {
            path: '/api/v4/projects/1/merge_requests/1/discussions',
            method: 'POST',
          },
        },
        {
          request: {
            path: '/api/v4/projects/1/merge_requests/1/notes',
            method: 'POST',
            body: {
              body:
                '## CodeCoach reports 1 issue\n:rotating_light: 1 error\n:warning: 0 warning',
            },
          },
        },
      ].sort(sortByRequestPath),
    );
  });
});
