import * as utils from 'util';
import { Agent } from './Agent/Agent';
import Config from './Config/Config';
import { File } from './File';
import CSharpParser, { CSharpParserType } from './Parser/CSharpParser';
import { Parser } from './Parser/Parser';
import { GithubProvider } from './Provider/Github.provider';
import { Report } from './Report/Report';

import {
  BYPASS_BUILD,
  WARN_FILE_PATH,
  ERR_FILE_PATH,
  LOG_OUTPUT_PATH,
  LINE_SPLITTER,
} from './app.constant';
import ProviderLoaderType from './Provider/@types/provider.loader.type';

(async () => {
  try {
    const config = new Config();
    const CONFIG_PROVIDER: ProviderLoaderType = config.getProvider();
    const provider = new GithubProvider(CONFIG_PROVIDER);
    if (!BYPASS_BUILD) {
      await provider.clone();
      const agent = new Agent(config.getAgent());
      await agent.runTask();
      console.log('Agent finish');
    }

    console.log('parsing');

    const warnFileLog = await File.readFileHelper(WARN_FILE_PATH);
    const warnLogs = new Parser<CSharpParserType>({ source: warnFileLog })
      .setLineSplitter(LINE_SPLITTER)
      .mapLabel(CSharpParser)
      .getLabled();

    const errFileLog = await File.readFileHelper(ERR_FILE_PATH);
    const errorLogs = new Parser<CSharpParserType>({ source: errFileLog })
      .setLineSplitter(LINE_SPLITTER)
      .mapLabel(CSharpParser)
      .getLabled();

    const logs = [...warnLogs, ...errorLogs];
    console.log(utils.inspect(logs, false, null));
    const reportData = Report.parse(logs);
    provider.report(reportData);
    await File.writeFileHelper(LOG_OUTPUT_PATH, JSON.stringify(logs, null, 2));
    console.log('write file dotnetbuild log complete');
  } catch (err) {
    throw Error(err);
  }
})();
