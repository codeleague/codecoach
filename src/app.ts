import { join } from 'path';
import { URL } from 'url';
import { CSharpAgent } from './Agent/CSharpAgent';
import { ROOT_DIR } from './app.constants';
import Config from './Config/Config';
import { File } from './File';
import { CSharpParser, LogType } from './Parser';
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
    console.error(err);
    process.exit(1);
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
  const errFileLog = await File.readFileHelper(join(ROOT_DIR, Config.app.errFilePath));

  return new CSharpParser().withContent(warnFileLog).withContent(errFileLog).getLogs();
}

async function build(): Promise<void> {
  const agent = new CSharpAgent(Config.agent);
  await agent.buildAndGetLogFiles();
  console.log('Agent finish');
}
