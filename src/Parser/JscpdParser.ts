import { Log } from '../Logger';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { ProjectType } from '../Config/@enums';
import { JscpdLog } from './@types/JscpdLog';
import { LogSeverity } from './@enums/log.severity.enum';

export class JscpdParser extends Parser {
  private readonly ruleId = 'jscpd';

  parse(content: string): LogType[] {
    try {
      if (!content) return [];

      const logsJson = JSON.parse(content) as JscpdLog;
      return logsJson.duplicates.map((el) => this.toLog(el));
    } catch (err) {
      Log.warn('jscpd Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private toLog(log: JscpdLog['duplicates'][number]): LogType {
    const parsed: LogType = {
      ruleId: this.ruleId,
      log: JSON.stringify(log),
      line: log.secondFile.startLoc.line,
      lineOffset: log.secondFile.startLoc.column ?? 0,
      msg: `Found code duplication from "${log.firstFile.name}"`,
      source: log.secondFile.name,
      severity: LogSeverity.info,
      valid: true,
      type: ProjectType.jscpd,
    };

    return parsed;
  }
}
