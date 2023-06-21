#!/usr/bin/env node

import { BuildLogFile, configs, ProjectType } from './Config';
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
} from './Parser';
import { DartLintParser } from './Parser/DartLintParser';
import { GitHub, GitHubPRService, VCS } from './Provider';
import { GitLab } from './Provider/GitLab/GitLab';
import { GitLabMRService } from './Provider/GitLab/GitLabMRService';

class App {
  private vcs: VCS;

  async start(): Promise<void> {
    if (configs.vcs === 'github') {
      const githubPRService = new GitHubPRService(
        configs.githubToken,
        configs.githubRepoUrl,
        configs.githubPr,
      );
      this.vcs = new GitHub(githubPRService, configs);
    } else if (configs.vcs === 'gitlab') {
      this.vcs = new GitLab(new GitLabMRService(), configs);
    }

    const logs = await this.parseBuildData(configs.buildLogFile);
    Log.info('Build data parsing completed');

    // Fire and forget, no need to await
    App.writeLogToFile(logs)
      .then(() => Log.info('Write output completed'))
      .catch((error) => Log.error('Write output failed', { error }));

    const passed = await this.vcs.report(logs);
    Log.info('Report to VCS completed');

    if (!passed) {
      Log.error('There are some linting error and exit code reporting is enabled');
      process.exit(1);
    }
  }

  private static getParser(type: ProjectType, cwd: string): Parser {
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
    }
  }

  private async parseBuildData(files: BuildLogFile[]): Promise<LogType[]> {
    const logsTasks = files.map(async ({ type, path, cwd }) => {
      Log.debug('Parsing', { type, path, cwd });
      const content = await File.readFileHelper(path);
      const parser = App.getParser(type, cwd);
      return parser.parse(content);
    });

    return (await Promise.all(logsTasks)).flatMap((x) => x);
  }

  private static async writeLogToFile(logs: LogType[]): Promise<void> {
    await File.writeFileHelper(configs.output, JSON.stringify(logs, null, 2));
  }
}

new App().start().catch((error) => {
  if (error instanceof Error) {
    const { stack, message } = error;
    Log.error('Unexpected error', { stack, message });
  }
  Log.error('Unexpected error', { error });
  process.exit(2);
});
