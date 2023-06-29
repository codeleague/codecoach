import { AnalyzerBot } from './AnalyzerBot';
import { AnalyzerBotConfig } from './@interfaces/AnalyzerBotConfig';
import {
  file1TouchLine,
  file2TouchLine,
  mockTouchDiff,
  mockTouchFile,
  touchFileError,
  touchFileWarning,
  untouchedError,
  untouchedWarning,
} from '../Provider/mockData';
import { MessageUtil } from './utils/message.util';

const config: AnalyzerBotConfig = {
  failOnWarnings: false,
  suppressRules: [],
};
describe('AnalyzerBot', () => {
  const logs = [touchFileError, touchFileWarning, untouchedError, untouchedWarning];
  const diff = [mockTouchDiff];
  const analyzer = new AnalyzerBot(config);

  describe('.touchedFileLog', () => {
    it('should return only logs that are in touchedDiff', () => {
      analyzer.analyze(logs, diff);
      expect(analyzer.touchedFileLog).toEqual([touchFileError, touchFileWarning]);
    });
  });

  describe('.comments', () => {
    it('should returns comments for each touched file', () => {
      analyzer.analyze(logs, diff);
      expect(analyzer.comments).toEqual([
        {
          file: mockTouchFile,
          line: file1TouchLine,
          text:
            MessageUtil.createMessageWithEmoji(
              touchFileError.msg,
              touchFileError.severity,
            ) + '  \n',
          errors: 1,
          warnings: 0,
          suppresses: 0,
        },
        {
          file: mockTouchFile,
          line: file2TouchLine,
          text:
            MessageUtil.createMessageWithEmoji(
              touchFileWarning.msg,
              touchFileWarning.severity,
            ) + '  \n',
          errors: 0,
          warnings: 1,
          suppresses: 0,
        },
      ]);
    });

    it('should be empty when there is no relevant lint errors', () => {
      analyzer.analyze([untouchedError, untouchedWarning], diff);
      expect(analyzer.comments).toEqual([]);
    });
  });

  describe('.nError', () => {
    it('should return the number of related lint errors', () => {
      analyzer.analyze(logs, diff);
      expect(analyzer.nError).toEqual(1);
    });
  });

  describe('.nWarning', () => {
    it('should return the number of related lint warnings', () => {
      analyzer.analyze(logs, diff);
      expect(analyzer.nWarning).toEqual(1);
    });
  });

  describe('.shouldGenerateOverview', () => {
    it('should return true when there is at least one lint error or warning', () => {
      analyzer.analyze(logs, diff);
      expect(analyzer.shouldGenerateOverview()).toEqual(true);
    });

    it('should return false when there is no lint error or warning', () => {
      analyzer.analyze([untouchedError, untouchedWarning], diff);
      expect(analyzer.shouldGenerateOverview()).toEqual(false);
    });
  });

  describe('.getOverviewMessage', () => {
    it('should return a proxy result from MessageUtil.generateOverviewMessage based on the number of errors and warnings', () => {
      analyzer.analyze(logs, diff);
      expect(analyzer.getOverviewMessage()).toEqual(
        MessageUtil.generateOverviewMessage(analyzer.nError, analyzer.nWarning),
      );
    });
  });

  describe('.getCommitDescription', () => {
    it('should return a proxy result from MessageUtil.generateCommitDescription based on the number of errors', () => {
      analyzer.analyze(logs, diff);
      expect(analyzer.getCommitDescription()).toEqual(
        MessageUtil.generateCommitDescription(analyzer.nError),
      );
    });
  });

  describe('.isSuccess', () => {
    describe('when failOnWarnings is false', () => {
      it('should return true when there is no lint error or warning', () => {
        analyzer.analyze([untouchedError, untouchedWarning], diff);
        expect(analyzer.isSuccess()).toEqual(true);
      });

      it('should return true when there is only lint warnings', () => {
        analyzer.analyze([touchFileWarning, untouchedError, untouchedWarning], diff);
        expect(analyzer.isSuccess()).toEqual(true);
      });

      it('should return false when there is at least one lint error', () => {
        analyzer.analyze(logs, diff);
        expect(analyzer.isSuccess()).toEqual(false);
      });
    });

    describe('when failOnWarnings is true', () => {
      const analyzer = new AnalyzerBot({ ...config, failOnWarnings: true });

      it('should return true when there is no lint error or warning', () => {
        analyzer.analyze([untouchedError, untouchedWarning], diff);
        expect(analyzer.isSuccess()).toEqual(true);
      });

      it('should return false when there is a lint warning', () => {
        analyzer.analyze([touchFileWarning, untouchedError, untouchedWarning], diff);
        expect(analyzer.isSuccess()).toEqual(false);
      });

      it('should return false when there is a lint error', () => {
        analyzer.analyze(logs, diff);
        expect(analyzer.isSuccess()).toEqual(false);
      });
    });
  });
});
