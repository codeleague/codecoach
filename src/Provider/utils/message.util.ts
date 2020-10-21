import LogSeverity from '../../Parser/@enums/log.severity.enum';
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
}
