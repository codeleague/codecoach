import { File } from '../File';
import yaml from 'js-yaml';

export class YML {
  static async parse<T>(path: string): Promise<T> {
    const file = await File.readFileHelper(path);
    const ymlFile = yaml.loadAll(file);
    return ymlFile[0];
  }
}
