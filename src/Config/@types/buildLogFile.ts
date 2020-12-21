import { ProjectType } from '../@enums';

export type BuildLogFile = {
  path: string;
  cwd: string;
  type: ProjectType;
};
