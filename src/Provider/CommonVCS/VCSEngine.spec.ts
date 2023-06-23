import { VCSEngineConfig } from '../@interfaces/VCSEngineConfig';
import { VCSEngine } from './VCSEngine';
import { VCSAdapter } from '../@interfaces/VCSAdapter';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';

const config: VCSEngineConfig = {
  removeOldComment: false,
  failOnWarnings: false,
};

const mockAdapter: VCSAdapter = {
  getName: jest.fn(),
  init: jest.fn(),
  diff: jest.fn(),
  getLatestCommitSha: jest.fn(),
  createComment: jest.fn(),
  createReviewComment: jest.fn(),
  removeExistingComments: jest.fn(),
  wrapUp: jest.fn(),
};

function createMockAnalyzerBot(): IAnalyzerBot {
  return {
    touchedFileLog: [],
    getCommitDescription: jest.fn(),
    isSuccess: jest.fn(),
    analyze: jest.fn(),
    comments: [],
    shouldGenerateOverview: jest.fn(),
    getOverviewMessage: jest.fn(),
    nError: 0,
    nWarning: 0,
  };
}

describe('VCSEngine', () => {
  const vcs = new VCSEngine(config, createMockAnalyzerBot(), mockAdapter);
  describe('report', () => {
    it('initialize the adapter', () => {
      vcs.report([]);
      expect(mockAdapter.init).toBeCalledTimes(1);
    });
  });
});
