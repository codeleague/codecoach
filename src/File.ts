import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';

export abstract class File {
  static async readFileHelper(path: string): Promise<string> {
    try {
      const data = await readFile(resolve(path));
      return data.toString();
    } catch (err) {
      throw new Error(`Read file error:${err}`);
    }
  }

  static async writeFileHelper(path: string, data: string): Promise<void> {
    try {
      await writeFile(resolve(path), data);
    } catch (err) {
      throw new Error(`Write file error:${err}`);
    }
  }
}
