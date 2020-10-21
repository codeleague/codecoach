import dotenv from 'dotenv';
import yargs from 'yargs';

import { ConfigArgument, ConfigObject } from './@types';
import { ProjectType } from './@enums';

import {
  buildAgentConfig,
  buildAppConfig,
  buildProviderConfig,
  validateEnvConfig,
} from './configBuilder';
import { DEFAULT_OUTPUT_FILE } from './constants/defaults';

const args = yargs
  .option('url', {
    describe: 'GitHub repo url (https or ssh)',
    type: 'string',
    demandOption: true,
  })
  .option('pr', {
    describe: 'PR number',
    type: 'number',
    demandOption: true,
  })
  .option('type', {
    describe: 'Project type',
    choices: Object.keys(ProjectType),
    demandOption: true,
  })
  .option('buildLogFile', {
    describe:
      'Build log content files (repeatable); If this option is set, build agent will be skipped',
    type: 'array',
    string: true,
    number: false,
  })
  .option('output', {
    describe: 'Output parsed log file',
    type: 'string',
    default: DEFAULT_OUTPUT_FILE,
  })
  .option('noClone', {
    describe: 'Bypass internal source pulling',
    type: 'boolean',
    default: false,
  })
  .option('token', {
    describe: 'GitHub token',
    type: 'string',
    demandOption: true,
  })
  .help()
  .parse(process.argv.slice(1)) as ConfigArgument;

dotenv.config();

if (!validateEnvConfig(process.env)) {
  throw new Error('.env file is not valid');
}

export const Config: ConfigObject = Object.freeze({
  agent: buildAgentConfig(process.env),
  app: buildAppConfig(args),
  provider: buildProviderConfig(args),
});
