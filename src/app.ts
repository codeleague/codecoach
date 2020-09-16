import * as utils from 'util';
import { Agent } from './Agent/Agent';
import Config from './Config/Config';
import { File } from './File';
import CSharpParser, { CSharpParserType } from './Parser/CSharpParser';
import { Parser } from './Parser/Parser';
import { GithubProvider } from './Provider/Github.provider';
import { ProviderCustomConfigType } from './Provider/ProviderCustomConfigType';
import { Report } from './Report/Report';
const DOTNET_PATH = `dotnet`;

const BYPASS_BUILD = true;
const WARN_FILE_PATH = 'tmp/dotnetbuild.wrn';
const ERR_FILE_PATH = 'tmp/dotnetbuild.err';

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

    const LOG_OUTPUT_PATH = 'tmp/dotnetbuild.json';
    const LINE_SPLITTER = '\r\n';

    const WARN_FILE = await File.readFileHelper(WARN_FILE_PATH);
    const warnLogs = new Parser<CSharpParserType>(WARN_FILE)
      .setLineSplitter(LINE_SPLITTER)
      .mapLabel(CSharpParser)
      .getLabled();

    const ERR_FILE = await File.readFileHelper(ERR_FILE_PATH);
    const errorLogs = new Parser<CSharpParserType>(ERR_FILE)
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
