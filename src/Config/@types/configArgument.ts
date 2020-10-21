import { ProjectType } from '../@enums';

export type ConfigArgument = {
  url: string;
  pr: number;
  type: ProjectType;
  buildLogFile?: string[];
  output: string;
  noClone: boolean;
  token: string;
};
