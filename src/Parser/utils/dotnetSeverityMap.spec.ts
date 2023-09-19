import { LintSeverity } from '../@enums/LintSeverity';
import { mapSeverity } from './dotnetSeverityMap';

describe('dotnetSeverityMap', () => {
  describe('mapSeverity', () => {
    it('should map correctly', () => {
      expect(mapSeverity('fatal')).toBe(LintSeverity.error);
      expect(mapSeverity('error')).toBe(LintSeverity.error);
      expect(mapSeverity('warning')).toBe(LintSeverity.warning);
      expect(mapSeverity('info')).toBe(LintSeverity.info);
      expect(mapSeverity('hidden')).toBe(LintSeverity.ignore);
      expect(mapSeverity('some gibberish text')).toBe(LintSeverity.unknown);
    });
  });
});
