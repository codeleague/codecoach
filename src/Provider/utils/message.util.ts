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
    return `## CodeCoach reports ${this.pluralize('issue', nOfErrors + nOfWarnings)}
${MessageUtil.createMessageWithEmoji(
  this.pluralize('error', nOfErrors),
  LogSeverity.error,
)}
${MessageUtil.createMessageWithEmoji(
  this.pluralize('warning', nOfWarnings),
  LogSeverity.warning,
)}`;
  }

  private static pluralize(word: string, n: number): string {
    const fill = word.split('').shift() === 's' ? 'es' : 's';
    return n + ' ' + (n > 1 ? `${word}${fill}` : word);
  }

  static generateCommitDescription(nOfErrors: number): string {
    return nOfErrors
      ? `CodeCoach report ${nOfErrors} errors`
      : 'CodeCoach report no issue';
  }
}
