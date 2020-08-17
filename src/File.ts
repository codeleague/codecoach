import { promises } from 'fs';
import { resolve } from 'path';
import { Log } from './Logger';

const { readFile, writeFile } = promises;

export abstract class File {
  static async readFileHelper(path: string): Promise<string> {
    try {
      const fullPath = resolve(path);
      Log.debug(`Reading from ${fullPath}`);

      const data = await readFile(fullPath);
      return data.toString();
    } catch (err) {
      Log.error('Read file error');
      throw err;
    }
  }

  static async writeFileHelper(path: string, data: string): Promise<void> {
    try {
      const fullPath = resolve(path);
      Log.debug(`Writing to ${fullPath}`);

      await writeFile(fullPath, data);
    } catch (err) {
      Log.error('Write file error');
      throw err;
    }
  }
}
