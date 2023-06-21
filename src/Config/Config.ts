import yargs from 'yargs';
import { ProjectType } from './@enums';
import { BuildLogFile, ConfigArgument } from './@types';
import { DEFAULT_OUTPUT_FILE } from './constants/defaults';
import { GITHUB_ARGS, GITLAB_ARGS } from './constants/required';
import fs from 'fs';

const projectTypes = Object.keys(ProjectType);

const args = yargs
  .config('config', (configPath) => JSON.parse(fs.readFileSync(configPath, 'utf-8')))
  .option('vcs', {
    alias: 'g',
    describe: 'VCS Type',
    choices: ['github', 'gitlab'],
    demandOption: true,
  })

  .option('githubRepoUrl', {
    describe: 'GitHub repo url (https or ssh)',
    type: 'string',
  })
  .option('githubPr', {
    describe: 'GitHub PR number',
    type: 'number',
  })
  .option('githubToken', {
    describe: 'GitHub token',
    type: 'string',
  })

  .option('gitlabHost', {
    describe: 'GitLab server URL (https://gitlab.yourcompany.com)',
    type: 'string',
  })
  .option('gitlabProjectId', {
    describe: 'GitLab project ID',
    type: 'number',
  })
  .option('gitlabMrIid', {
    describe: 'GitLab merge request IID (not to be confused with ID)',
    type: 'number',
  })
  .option('gitlabToken', {
    describe: 'GitLab token',
    type: 'string',
  })
  .group(['vcs', 'buildLogFile', 'output', 'removeOldComment'], 'Parsing options:')
  .group(GITLAB_ARGS, 'GitLab options:')
  .group(GITHUB_ARGS, 'GitHub options:')
  .check((options) => {
    // validate VCS configs
    if (options.vcs === 'github' && GITHUB_ARGS.some((arg) => !options[arg]))
      throw `GitHub requires [${GITHUB_ARGS.map((a) => `--${a}`).join(', ')}] to be set`;

    if (options.vcs === 'gitlab' && GITLAB_ARGS.some((arg) => !options[arg]))
      throw `GitLab requires [${GITLAB_ARGS.map((a) => `--${a}`).join(', ')}] to be set`;

    return true;
  })
  .option('buildLogFile', {
    alias: 'f',
    describe: `Build log content files formatted in '<type>;<path>[;<cwd>]'
where <type> is one of [${projectTypes.join(', ')}]
<path> is build log file path to be processed
and <cwd> is build root directory (optional (Will use current context as cwd)).
`,
    type: 'array',
    string: true,
    number: false,
  })
  .coerce('buildLogFile', (files: string[]) => {
    return files.map((opt) => {
      const [type, path, cwd] = opt.split(';');
      if (!projectTypes.includes(type) || !path) return null;
      return { type, path, cwd: cwd ?? process.cwd() } as BuildLogFile;
    });
  })
  .check((options) => {
    // check arguments parsing
    const useConfigArgs = options.config !== undefined;
    if (useConfigArgs) return true;

    // if (!options.pr || Array.isArray(options.pr))
    //   throw '--pr config should be a single number';
    if (!options.buildLogFile || options.buildLogFile.some((file) => file === null))
      throw 'all of `--buildLogFile` options should have correct format';
    return true;
  })
  .option('output', {
    alias: 'o',
    describe: 'Output parsed log file',
    type: 'string',
    default: DEFAULT_OUTPUT_FILE,
  })
  .option('removeOldComment', {
    alias: 'r',
    type: 'boolean',
    describe: 'Remove existing CodeCoach comments before putting new one',
    default: false,
  })
  .option('failOnWarnings', {
    type: 'boolean',
    describe: 'Fail the job if warnings are found',
    default: false,
  })
  .option('suppressPattern', {
    type: 'string',
    describe:
      'Regex pattern to suppress warnings, This will still be in the report but as suppressed',
    default: '',
  })
  .strict()
  .help()
  .wrap(120)
  .parse(process.argv.slice(1)) as ConfigArgument;

export const configs = args;
