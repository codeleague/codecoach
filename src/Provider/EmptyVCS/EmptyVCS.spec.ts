import { EmptyVCS } from './EmptyVCS';
import {
  touchFileError,
  touchFileWarning,
  untouchedError,
  untouchedWarning,
} from '../mockData';

describe('VCS: EmptyVCS', () => {
  it('should returns true when there is no error', async () => {
    const emptyVCS = new EmptyVCS();
    const result = await emptyVCS.report([touchFileWarning, untouchedWarning]);
    expect(result).toBe(true);
  });

  it('should returns false when there are some errors', async () => {
    const emptyVCS = new EmptyVCS();

    const result = await emptyVCS.report([
      touchFileError,
      touchFileWarning,
      untouchedError,
      untouchedWarning,
    ]);

    expect(result).toBe(false);
  });

  describe('when failOnWarnings is true', () => {
    it('should returns true when there is no error or warning', async () => {
      const emptyVCS = new EmptyVCS(true);
      const result = await emptyVCS.report([]);
      expect(result).toBe(true);
    });

    it('should returns false when there is atleast one untouched error', async () => {
      const emptyVCS = new EmptyVCS(true);
      const result = await emptyVCS.report([untouchedError]);
      expect(result).toBe(false);
    });

    it('should returns false when there is atleast one touched error', async () => {
      const emptyVCS = new EmptyVCS(true);
      const result = await emptyVCS.report([touchFileError]);
      expect(result).toBe(false);
    });

    it('should returns false when there is atleast one untouched warning', async () => {
      const emptyVCS = new EmptyVCS(true);
      const result = await emptyVCS.report([untouchedWarning]);
      expect(result).toBe(false);
    });

    it('should returns false when there is atleast one touched warning', async () => {
      const emptyVCS = new EmptyVCS(true);
      const result = await emptyVCS.report([touchFileWarning]);
      expect(result).toBe(false);
    });
  });
});
