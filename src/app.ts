import { BuildLogFile, ConfigArgument, ProjectType } from './Config';
import { File } from './File';
import { Log } from './Logger';
import {
  AndroidLintStyleParser,
  DotnetBuildParser,
  ESLintParser,
  LogType,
  MSBuildParser,
  Parser,
  ScalaStyleParser,
  TSLintParser,
  DartLintParser,
  SwiftLintParser,
} from './Parser';
import { GitHubPRService, VCS } from './Provider';
import { GitLabMRService } from './Provider/GitLab/GitLabMRService';
import { GitHubAdapter } from './Provider/GitHub/GitHubAdapter';
import { VCSEngine } from './Provider/CommonVCS/VCSEngine';
import { GitLabAdapter } from './Provider/GitLab/GitLabAdapter';
import { VCSAdapter } from './Provider/@interfaces/VCSAdapter';
import { AnalyzerBot } from './AnalyzerBot/AnalyzerBot';
import CodeCoachError from './CodeCoachError';

export class App {
  private vcs: VCS;
  private readonly configs: ConfigArgument;

  constructor(configs: ConfigArgument) {
    this.configs = configs;
  }

  async start(): Promise<void> {
    if (!this.configs.dryRun) {
      const adapter = this.getAdapter();
      if (!adapter) {
        throw new CodeCoachError('VCS adapter is not found');
      }
      const analyzer = new AnalyzerBot(this.configs);
      this.vcs = new VCSEngine(this.configs, analyzer, adapter);
    }

    const logs = await this.parseBuildData(this.configs.buildLogFile);
    Log.info('Build data parsing completed');

    const reportToVcs = this.reportToVcs(logs);
    const logToFile = this.writeLogToFile(logs);
    const [passed] = await Promise.all([reportToVcs, logToFile]);
    if (!passed) {
      throw new CodeCoachError(
        'There are some linting error and exit code reporting is enabled',
      );
    }
  }

  private getAdapter(): VCSAdapter | undefined {
    if (this.configs.vcs === 'github') {
      const githubPRService = new GitHubPRService(
        this.configs.githubToken,
        this.configs.githubRepoUrl,
        this.configs.githubPr,
      );
      return new GitHubAdapter(githubPRService);
    } else if (this.configs.vcs === 'gitlab') {
      const gitlabMRService = new GitLabMRService(
        this.configs.gitlabHost,
        this.configs.gitlabProjectId,
        this.configs.gitlabMrIid,
        this.configs.gitlabToken,
      );
      return new GitLabAdapter(gitlabMRService);
    }
  }

  private getParser(type: ProjectType, cwd: string): Parser {
    switch (type) {
      case ProjectType.dotnetbuild:
        return new DotnetBuildParser(cwd);
      case ProjectType.msbuild:
        return new MSBuildParser(cwd);
      case ProjectType.tslint:
        return new TSLintParser(cwd);
      case ProjectType.eslint:
        return new ESLintParser(cwd);
      case ProjectType.scalastyle:
        return new ScalaStyleParser(cwd);
      case ProjectType.androidlint:
        return new AndroidLintStyleParser(cwd);
      case ProjectType.dartlint:
        return new DartLintParser(cwd);
      case ProjectType.swiftlint:
        return new SwiftLintParser(cwd);
    }
  }

  private async parseBuildData(files: BuildLogFile[]): Promise<LogType[]> {
    const logsTasks = files.map(async ({ type, path, cwd }) => {
      Log.debug('Parsing', { type, path, cwd });
      const content = await File.readFileHelper(path);
      const parser = this.getParser(type, cwd);
      return parser.parse(content);
    });

    return (await Promise.all(logsTasks)).flatMap((x) => x);
  }

  private async reportToVcs(logs: LogType[]): Promise<boolean> {
    if (this.configs.dryRun) {
      Log.info('Dry run enabled, skip reporting');
      return true;
    }

    try {
      const passed = await this.vcs.report(logs);
      Log.info('Report to VCS completed');
      return passed;
    } catch (error) {
      Log.error('Report to VCS failed', { error });
      throw error;
    }
  }

  private async writeLogToFile(logs: LogType[]): Promise<void> {
    try {
      await File.writeFileHelper(this.configs.output, JSON.stringify(logs, null, 2));
      Log.info('Write output completed');
    } catch (error) {
      Log.error('Write output failed', { error });
      throw error;
    }
  }
}
