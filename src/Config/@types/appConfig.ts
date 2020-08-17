import { ProjectType } from '../@enums';

export type AppConfig = {
  logFilePath: string;
  projectType: ProjectType;
  buildLogFiles: string[];
  cwd: string;
};
