import { IssuesType } from './issues.type';

type ReportType = {
  overviewMsg: string;
  warning: IssuesType;
  error: IssuesType;
};

export default ReportType;
