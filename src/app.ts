#!/usr/bin/env node

import { BuildLogFile, configs, ProjectType } from './Config';
import { File } from './File';
import { Log } from './Logger';
import {
  AndroidLintStyleParser,
  DartLintParser,
  DotnetBuildParser,
  ESLintParser,
  JscpdParser,
  LintItem,
  MSBuildParser,
  Parser,
  ScalaStyleParser,
  SwiftLintParser,
  TSLintParser,
} from './Parser';
import { GitHubPRService, VCS } from './Provider';
import { GitLabMRService } from './Provider/GitLab/GitLabMRService';
import { GitHubAdapter } from './Provider/GitHub/GitHubAdapter';
import { VCSEngine } from './Provider/CommonVCS/VCSEngine';
import { GitLabAdapter } from './Provider/GitLab/GitLabAdapter';
import { VCSAdapter } from './Provider/@interfaces/VCSAdapter';
import { AnalyzerBot } from './AnalyzerBot/AnalyzerBot';
import { defaultFormatter, gitLabFormatter } from './OutputFormatter/OutputFormatter';

type OutputFileMeta = {
  formatter: (items: LintItem[]) => string;
  filename: string;
};

class App {
  private vcs: VCS | null = null;
  private outputFileMeta: OutputFileMeta[];

  async start(): Promise<void> {
    if (!configs.dryRun) {
      const adapter = App.getAdapter();
      if (!adapter) {
        Log.error('VCS adapter is not found');
        process.exit(1);
      }
      const analyzer = new AnalyzerBot(configs);
      this.vcs = new VCSEngine(configs, analyzer, adapter);
    }

    this.outputFileMeta = App.getOutputFileMetas();

    const logs = await this.parseBuildData(configs.buildLogFile);
    Log.info('Build data parsing completed');

    const reportToVcs = this.reportToVcs(logs);
    const writeOutputFiles = this.writeOutputFiles(logs);
    const [passed] = await Promise.all([reportToVcs, writeOutputFiles]);
    if (!passed) {
      Log.error('There are some linting error and exit code reporting is enabled');
      process.exit(1);
    }
  }

  private static getAdapter(): VCSAdapter | undefined {
    if (configs.vcs === 'github') {
      const githubPRService = new GitHubPRService(
        configs.githubToken,
        configs.githubRepoUrl,
        configs.githubPr,
      );
      return new GitHubAdapter(githubPRService);
    } else if (configs.vcs === 'gitlab') {
      return new GitLabAdapter(new GitLabMRService());
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
      case ProjectType.swiftlint:
        return new SwiftLintParser(cwd);
      case ProjectType.jscpd:
        return new JscpdParser(cwd);
    }
  }

  private static getOutputFileMetas(): OutputFileMeta[] {
    const outputFileMetas: OutputFileMeta[] = [];
    if (configs.outputFormat.includes('default')) {
      outputFileMetas.push({ formatter: defaultFormatter, filename: configs.output });
    }
    if (configs.outputFormat.includes('gitlab')) {
      outputFileMetas.push({
        formatter: gitLabFormatter,
        filename: 'gl-code-quality-report.json',
      });
    }

    return outputFileMetas;
  }

  private async parseBuildData(files: BuildLogFile[]): Promise<LintItem[]> {
    const logsTasks = files.map(async ({ type, path, cwd }) => {
      Log.debug('Parsing', { type, path, cwd });
      const content = await File.readFileHelper(path);
      const parser = App.getParser(type, cwd);
      return parser.parse(content);
    });

    return (await Promise.all(logsTasks)).flatMap((x) => x);
  }

  private async reportToVcs(items: LintItem[]): Promise<boolean> {
    if (!this.vcs) {
      Log.info('Dry run enabled, skip reporting');
      return true;
    }

    try {
      const passed = await this.vcs.report(items);
      Log.info('Report to VCS completed');
      return passed;
    } catch (error) {
      Log.error('Report to VCS failed', { error });
      throw error;
    }
  }

  private async writeOutputFiles(items: LintItem[]): Promise<void> {
    try {
      await Promise.all(
        this.outputFileMeta.map((meta) => {
          Log.info('Write output to ' + meta.filename, { meta });
          return File.writeFileHelper(meta.filename, meta.formatter(items));
        }),
      );

      Log.info('Write output completed');
    } catch (error) {
      Log.error('Write output failed', { error });
      throw error;
    }
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
