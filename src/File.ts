import { writeFile, readFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const WORK_DIR = '../';

export abstract class File {
  private static pathJoin(path: string) {
    return join(__dirname, WORK_DIR, path);
  }

  static async readFileHelper(path: string): Promise<string> {
    try {
      const file = promisify(readFile);
      const data = await file(this.pathJoin(path));
      return data.toString();
    } catch (err) {
      throw new Error(`Read file error:${err}`);
    }
  }

  static async writeFileHelper(path: string, data: string): Promise<void> {
    try {
      const file = promisify(writeFile);
      await file(this.pathJoin(path), data);
      return;
    } catch (err) {
      throw new Error(`Write file error:${err}`);
    }
  }
}
