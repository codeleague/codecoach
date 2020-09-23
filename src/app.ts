import * as utils from 'util';
import { Agent } from './Agent/Agent';
import Config from './Config/Config';
import { File } from './File';
import CSharpParser, { CSharpParserType } from './Parser/CSharpParser';
import { Parser } from './Parser/Parser';
import { GithubProvider } from './Provider/Github.provider';
import { ProviderCustomConfigType } from './Provider/ProviderCustomConfigType';
import { Report } from './Report/Report';

import {
  BYPASS_BUILD,
  WARN_FILE_PATH,
  ERR_FILE_PATH,
  LOG_OUTPUT_PATH,
  LINE_SPLITTER,
  DOTNET_PATH,
} from './app.constant';

(async () => {
  try {
    const config = new Config();
    const CONFIG_PROVIDER: ProviderCustomConfigType = config.getProvider();
    const provider = new GithubProvider(CONFIG_PROVIDER);
    if (!BYPASS_BUILD) {
      await provider.clone();
      const agent = new Agent(DOTNET_PATH, config.getAgent());

      await agent.runTask();
      console.log('Agent finish');
    }

    console.log('parsing');

    const warnFileLog = await File.readFileHelper(WARN_FILE_PATH);
    const warnLogs = new Parser<CSharpParserType>(warnFileLog)
      .setLineSplitter(LINE_SPLITTER)
      .mapLabel(CSharpParser)
      .getLabled();

    const errFileLog = await File.readFileHelper(ERR_FILE_PATH);
    const errorLogs = new Parser<CSharpParserType>(errFileLog)
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
