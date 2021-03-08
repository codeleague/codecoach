import { LogSeverity } from '../@enums/log.severity.enum';
import { mapSeverity } from './dotnetSeverityMap';

describe('dotnetSeverityMap', () => {
  describe('mapSeverity', () => {
    it('should map correctly', () => {
      expect(mapSeverity('fatal')).toBe(LogSeverity.error);
      expect(mapSeverity('error')).toBe(LogSeverity.error);
      expect(mapSeverity('warning')).toBe(LogSeverity.warning);
      expect(mapSeverity('info')).toBe(LogSeverity.info);
      expect(mapSeverity('hidden')).toBe(LogSeverity.ignore);
      expect(mapSeverity('some gibberish text')).toBe(LogSeverity.unknown);
    });
  });
});
