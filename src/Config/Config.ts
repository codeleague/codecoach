import yargs from 'yargs';
import { ProjectType } from './@enums';
import { BuildLogFile, ConfigArgument, ConfigObject } from './@types';
import { buildAppConfig, buildProviderConfig } from './configBuilder';
import { DEFAULT_OUTPUT_FILE } from './constants/defaults';
import { isGitlab } from '../Provider/utils/vcsType';

import { REQUIRED_ARGS_GITHUB, REQUIRED_ARGS_GITLAB } from './constants/required';
import { ConfigArgumentGitlab } from './@types/configArgument';

const projectTypes = Object.keys(ProjectType);

const args = yargs
  .option('config', {
    describe: 'use config file',
    type: 'string',
  })
  .option('url', {
    describe: 'GitHub repo url (https or ssh)',
    type: 'string',
  })
  .option('pr', {
    describe: 'PR number',
    type: 'number',
  })
  .option('token', {
    describe: 'GitHub token',
    type: 'string',
  })
  .option('gitlabProjectId', {
    describe: 'Gitlab Project Id',
    type: 'string',
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
  .option('output', {
    alias: 'o',
    describe: 'Output parsed log file',
    type: 'string',
    default: DEFAULT_OUTPUT_FILE,
  })
  .option('removeOldComment', {
    type: 'boolean',
    describe: 'Remove existing CodeCoach comments before putting new one',
    default: false,
  })
  .check((options) => {
    // check required arguments
    const useConfigArgs = options.config === undefined;
    const requiredArgs = isGitlab(options.url)
      ? REQUIRED_ARGS_GITLAB
      : REQUIRED_ARGS_GITHUB;
    const validRequiredArgs = requiredArgs.every(
      (el) => options[el] != undefined || options[el] != null,
    );
    if (useConfigArgs && !validRequiredArgs)
      throw `please fill all required fields ${requiredArgs.join(', ')}`;
    return true;
  })
  .check((options) => {
    // check arguments parsing
    const useConfigArgs = options.config === undefined;
    if (!useConfigArgs) return true;

    if (!options.pr || Array.isArray(options.pr))
      throw '--pr config should be a single number';
    if (!options.buildLogFile || options.buildLogFile.some((file) => file === null))
      throw 'all of `--buildLogFile` options should have correct format';
    return true;
  })
  .help()
  .wrap(120)
  .parse(process.argv.slice(1)) as ConfigArgumentGitlab;

export const Config: Promise<ConfigObject> = (async () => {
  return Object.freeze({
    app: await buildAppConfig(args),
    provider: await buildProviderConfig(args),
  });
})();
