import { IssuesType } from './issues.type';

type ReportType = {
  overviewMsg: string;
  warning: IssuesType;
  error: IssuesType;
  info: IssuesType;
};

export default ReportType;
