import { getPatch } from './patchProcessor';
import { readFile } from 'fs/promises';

describe('patchProcessor', () => {
  describe('getPatch', () => {
    it('should process patch with multiple part', async () => {
      const content = await readFile('sample/git-diff/multi.diff');
      const patches = getPatch(content.toString());

      expect(patches).toHaveLength(3);
      expect(patches[0]).toStrictEqual({ from: 8, to: 8 });
      expect(patches[1]).toStrictEqual({ from: 33, to: 33 });
      expect(patches[2]).toStrictEqual({ from: 53, to: 53 });
    });

    it('should process patch of new file', async () => {
      const content = await readFile('sample/git-diff/newfile.diff');
      const patches = getPatch(content.toString());

      expect(patches).toHaveLength(1);
      expect(patches[0]).toStrictEqual({ from: 1, to: 15 });
    });

    it('should not process patch of deleted file', async () => {
      const content = await readFile('sample/git-diff/deletefile.diff');
      const patches = getPatch(content.toString());

      expect(patches).toHaveLength(0);
    });

    it('should not process deleted sections', async () => {
      const content = await readFile('sample/git-diff/deletesection.diff');
      const patches = getPatch(content.toString());

      expect(patches).toHaveLength(2);
      expect(patches[0]).toStrictEqual({ from: 85, to: 85 });
      expect(patches[1]).toStrictEqual({ from: 89, to: 90 });
    });
  });
});
