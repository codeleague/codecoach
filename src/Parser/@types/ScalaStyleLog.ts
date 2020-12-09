import { ScalaStyleFile } from './ScalaStyleFile';

export type ScalaStyleLog = {
  checkstyle: { file: ScalaStyleFile[] }[];
};
