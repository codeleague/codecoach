import * as utils from 'util';
import { Agent } from './Agent/Agent';
import Config from './Config/Config';
import { File } from './File';
import CSharpParser, { CSharpParserType } from './Parser/CSharpParser';
import { Parser } from './Parser/Parser';
import ProviderLoaderType from './Provider/@types/provider.loader.type';
import { GithubProvider } from './Provider/Github.provider';
import { Report } from './Report/Report';

export type AppConfigType = {
  warnFilePath: string;
  errFilePath: string;
  logFilePath: string;
  lineSplitter: string;
};

export type AppConfigLoader = AppConfigType;

(async () => {
  try {
    const config = new Config();
    const {
      logFilePath: appLogFilePath,
      warnFilePath: appWarnFilePath,
      errFilePath: appErrFilePath,
      lineSplitter: appLineSplitter,
    } = config.getApp();
    const configProvider: ProviderLoaderType = config.getProvider();
    const provider = new GithubProvider(configProvider);

    await provider.clone();
    const agent = new Agent(config.getAgent());
    await agent.runTask();
    console.log('Agent finish');

    console.log('parsing');

    const warnFileLog = await File.readFileHelper(appWarnFilePath);
    const warnLogs = new Parser<CSharpParserType>({ source: warnFileLog })
      .setLineSplitter(appLineSplitter)
      .mapLabel(CSharpParser)
      .getLabled();

    const errFileLog = await File.readFileHelper(appErrFilePath);
    const errorLogs = new Parser<CSharpParserType>({ source: errFileLog })
      .setLineSplitter(appLineSplitter)
      .mapLabel(CSharpParser)
      .getLabled();

    const logs = [...warnLogs, ...errorLogs];
    // console.log(utils.inspect(logs, false, null));
    const reportData = Report.parse(logs);
    await provider.report(reportData);
    await File.writeFileHelper(appLogFilePath, JSON.stringify(logs, null, 2));
    console.log('write file dotnetbuild log complete');
  } catch (err) {
    throw Error(err);
  }
})();
