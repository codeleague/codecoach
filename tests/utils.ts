import { GenericContainer, StartedTestContainer } from 'testcontainers';
import fs from 'fs';
import axios from 'axios';

interface HttpServerMockHistory {
  request: {
    path: string;
    method: string;
    origin: string;
    body: string | Record<string, unknown> | undefined;
    headers: Record<string, string[]>;
    date: string;
  };
  response: {
    status: number;
    body: string | Record<string, unknown> | undefined;
    date: string;
  };
}

export const startHttpMockServer = async (): Promise<StartedTestContainer> => {
  return await new GenericContainer('thiht/smocker').withExposedPorts(8080, 8081).start();
};

export const configureHttpMockServerWithYaml = async (
  mock: StartedTestContainer,
  yml: string,
): Promise<void> => {
  await axios.post(
    `http://${mock.getHost()}:${mock.getMappedPort(8081)}/mocks`,
    fs.readFileSync(yml),
    {
      headers: {
        'Content-Type': 'application/x-yaml',
      },
    },
  );
};

export const getHttpMockServerHistory = async (
  mock: StartedTestContainer,
): Promise<HttpServerMockHistory[]> => {
  return (await axios.get(`http://${mock.getHost()}:${mock.getMappedPort(8081)}/history`))
    .data;
};

export const stopHttpMockServer = async (mock: StartedTestContainer): Promise<void> => {
  await mock.stop();
};

// for matching unordered array
export const sortByRequestPath = (
  a: { request: { path: string } },
  b: { request: { path: string } },
): number => a.request?.path.localeCompare(b.request.path);
