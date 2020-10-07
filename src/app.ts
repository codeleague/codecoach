import { join } from 'path';
import { URL } from 'url';
import { Agent } from './Agent/Agent';
import { ROOT_DIR } from './app.constants';
import Config from './Config/Config';
import { File } from './File';
import LogType from './Parser/@types/log.type';
import CSharpParser, { CSharpParserType } from './Parser/CSharpParser';
import { Parser } from './Parser/Parser';
import GitConfigType from './Provider/@types/git.config.type';
import { Git } from './Provider/Git/Git';
import { GithubProvider } from './Provider/Github.provider';
import { Report } from './Report/Report';

(async () => {
  try {
    if (!Config.provider.gitCloneBypass) await gitClone();
    if (!Config.agent.buildBypass) await build();

    const logs = await parseBuildData();
    const reportData = Report.parse(logs);

    const provider = new GithubProvider(Config.provider);
    await provider.report(reportData);
    await File.writeFileHelper(
      join(ROOT_DIR, Config.app.logFilePath),
      JSON.stringify(logs, null, 2),
    );

    console.log('write file dotnetbuild log complete');
  } catch (err) {
    throw Error(err);
  }
})();

async function gitClone(): Promise<void> {
  const config: GitConfigType = {
    src: new URL(
      join(Config.provider.owner, Config.provider.repo),
      Config.provider.repoUrl,
    ).toString(),
    prId: Config.provider.prId,
    dest: ROOT_DIR,
  };

  const git = new Git(config);
  await git.clone();
}

async function parseBuildData(): Promise<LogType[]> {
  console.log('parsing');

  const warnFileLog = await File.readFileHelper(join(ROOT_DIR, Config.app.warnFilePath));
  const warnLogs = new Parser<CSharpParserType>({ source: warnFileLog })
    .setLineSplitter(Config.app.lineSplitter)
    .mapLabel(CSharpParser)
    .getLabled();

  const errFileLog = await File.readFileHelper(join(ROOT_DIR, Config.app.errFilePath));
  const errorLogs = new Parser<CSharpParserType>({ source: errFileLog })
    .setLineSplitter(Config.app.lineSplitter)
    .mapLabel(CSharpParser)
    .getLabled();

  return [...warnLogs, ...errorLogs];
}

async function build(): Promise<void> {
  const agent = new Agent(Config.agent);
  await agent.runTask();
  console.log('Agent finish');
}
