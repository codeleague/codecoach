import { LogSeverity } from '../../Parser';

const EMOJI_ERROR = ':rotating_light:';
const EMOJI_WARNING = ':warning:';

export class MessageUtil {
  static createMessageWithEmoji(msg: string, severity: LogSeverity): string {
    let emoji = '';
    switch (severity) {
      case LogSeverity.error:
        emoji = EMOJI_ERROR;
        break;
      case LogSeverity.warning:
        emoji = EMOJI_WARNING;
        break;
    }
    return `${emoji} ${msg}`;
  }

  static generateOverviewMessage(nOfErrors: number, nOfWarnings: number): string {
    return `CodeCoach reports ${nOfErrors + nOfWarnings} issue(s)
${MessageUtil.createMessageWithEmoji(`${nOfErrors} error(s)`, LogSeverity.error)}
${MessageUtil.createMessageWithEmoji(`${nOfWarnings} warning(s)`, LogSeverity.warning)}`;
  }

  static generateCommitDescription(nOfErrors: number): string {
    return nOfErrors
      ? `CodeCoach report ${nOfErrors} errors`
      : 'CodeCoach report no issue';
  }
}
