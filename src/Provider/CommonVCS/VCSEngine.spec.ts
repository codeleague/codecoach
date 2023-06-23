import { VCSEngineConfig } from '../@interfaces/VCSEngineConfig';
import { VCSEngine } from './VCSEngine';
import { VCSAdapter } from '../@interfaces/VCSAdapter';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';
import { mockTouchDiff } from '../mockData';
import { Comment } from '../../AnalyzerBot/@types/CommentTypes';

const config: VCSEngineConfig = {
  removeOldComment: false,
  failOnWarnings: false,
};

function createMockAdapter(): VCSAdapter {
  return {
    getName: jest.fn(),
    init: jest.fn(),
    diff: jest.fn(),
    getLatestCommitSha: jest.fn(),
    createComment: jest.fn(),
    createReviewComment: jest.fn(),
    removeExistingComments: jest.fn(),
    wrapUp: jest.fn(),
  };
}

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

const comment1: Comment = {
  file: 'file1',
  line: 1,
  text: 'text1',
  errors: 1,
  warnings: 0,
};

const comment2: Comment = {
  file: 'file2',
  line: 2,
  text: 'text2',
  errors: 0,
  warnings: 1,
};

function setup(vcsConfig: VCSEngineConfig = config) {
  const analyzer = createMockAnalyzerBot();
  const adapter = createMockAdapter();
  const vcs = new VCSEngine(vcsConfig, analyzer, adapter);
  return { analyzer, adapter, vcs };
}

describe('VCSEngine', () => {
  describe('report', () => {
    it('initialize the adapter', async () => {
      const { adapter, vcs } = setup();
      await vcs.report([]);
      expect(adapter.init).toBeCalledTimes(1);
    });

    it('setup the analyzer bot using diff from adapter', async () => {
      const { adapter, analyzer, vcs } = setup();
      adapter.diff = jest.fn().mockResolvedValue([mockTouchDiff]);
      await vcs.report([]);
      expect(analyzer.analyze).toBeCalledWith([], [mockTouchDiff]);
    });

    describe('when removeOldComment is true', () => {
      it('remove existing comments', async () => {
        const { adapter, vcs } = setup({ ...config, removeOldComment: true });
        await vcs.report([]);
        expect(adapter.removeExistingComments).toBeCalledTimes(1);
      });
    });

    describe('when removeOldComment is false', () => {
      it('does not remove existing comments', async () => {
        const { adapter, vcs } = setup({ ...config, removeOldComment: false });
        await vcs.report([]);
        expect(adapter.removeExistingComments).not.toBeCalled();
      });
    });

    it('create review comments for each comments from analyzer bot', async () => {
      const { adapter, analyzer, vcs } = setup();
      analyzer.comments = [comment1, comment2];
      await vcs.report([]);
      expect(adapter.createReviewComment).toBeCalledTimes(2);
    });

    describe('when analyzerBot.shouldGenerateOverview is true', () => {
      it('create summary comment using result from anayzerBot.getOverviewMessage', async () => {
        const { adapter, analyzer, vcs } = setup();
        analyzer.shouldGenerateOverview = jest.fn().mockReturnValue(true);
        analyzer.getOverviewMessage = jest.fn().mockReturnValue('overview');
        await vcs.report([]);
        expect(adapter.createComment).toBeCalledWith('overview');
      });
    });

    describe('when analyzerBot.shouldGenerateOverview is false', () => {
      it('does not create summary comment', async () => {
        const { adapter, analyzer, vcs } = setup();
        analyzer.shouldGenerateOverview = jest.fn().mockReturnValue(false);
        await vcs.report([]);
        expect(adapter.createComment).not.toBeCalled();
      });
    });

    it('wrap up the adapter, passing in analyzer bot', async () => {
      const { adapter, analyzer, vcs } = setup();
      await vcs.report([]);
      expect(adapter.wrapUp).toBeCalledWith(analyzer);
    });
  });
});
