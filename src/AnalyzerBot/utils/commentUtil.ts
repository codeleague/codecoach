import { LogSeverity, LogType } from '../../Parser';
import { Comment, CommentFileStructure, CommentStructure } from '../@types/CommentTypes';
import { MessageUtil } from './message.util';

export function groupComments(logs: LogType[]): Comment[] {
  const commentMap = logs.reduce((map: CommentStructure, log) => {
    const { source: file, line, severity, msg } = log;
    const text = MessageUtil.createMessageWithEmoji(msg, severity);

    if (!line) return map;

    const currentWarnings = map?.[file]?.[line]?.warnings ?? 0;
    const currentErrors = map?.[file]?.[line]?.errors ?? 0;
    const currentText = map?.[file]?.[line]?.text ?? '';

    const nextObject: Comment = {
      text: `${currentText}${text}  \n`,
      errors: currentErrors + (severity === LogSeverity.error ? 1 : 0),
      warnings: currentWarnings + (severity === LogSeverity.warning ? 1 : 0),
      file,
      line,
    };

    const fileCommentUpdater: CommentFileStructure = { [line]: nextObject };
    const updatedFileComment = Object.assign({}, map?.[file], fileCommentUpdater);

    const mapUpdater: CommentStructure = { [file]: updatedFileComment };
    return Object.assign({}, map, mapUpdater);
  }, {});

  return Object.values(commentMap).flatMap((file) => Object.values(file));
}
