import yargs from 'yargs';
import { ProjectType } from './@enums';
import { BuildLogFile, ConfigArgument } from './@types';
import { DEFAULT_OUTPUT_FILE } from './constants/defaults';
import { GITHUB_ARGS, GITLAB_ARGS } from './constants/required';
import { z } from 'zod';
import path from 'path';

const projectTypes = Object.keys(ProjectType);

export const configSchema = z
  .object({
    vcs: z.enum(['github', 'gitlab']).optional().describe('VCS Type'),

    githubRepoUrl: z.string().optional().describe('GitHub repo url (https or ssh)'),
    githubPr: z.number().optional().describe('GitHub PR number'),
    githubToken: z.string().optional().describe('GitHub token'),

    gitlabHost: z
      .string()
      .optional()
      .describe('GitLab server URL (https://gitlab.yourcompany.com)'),
    gitlabProjectId: z.number().optional().describe('GitLab project ID'),
    gitlabMrIid: z
      .number()
      .optional()
      .describe('GitLab merge request IID (not to be confused with ID)'),
    gitlabToken: z.string().optional().describe('GitLab token'),

    buildLogFile: z.array(z.string()).transform((files) => {
      return files
        .map((opt) => {
          const [type, path, cwd] = opt.split(';');
          if (!projectTypes.includes(type) || !path) return null;
          return { type, path, cwd: cwd ?? process.cwd() } as BuildLogFile;
        })
        .filter((file) => file !== null) as BuildLogFile[];
    }).describe(`Build log content files formatted in '<type>;<path>[;<cwd>]'
where <type> is one of [${projectTypes.join(', ')}]
<path> is build log file path to be processed
and <cwd> is build root directory (optional (Will use current context as cwd)).
`),

    output: z.string().describe('Output parsed log file').default(DEFAULT_OUTPUT_FILE),
    removeOldComment: z
      .boolean()
      .describe('Remove existing CodeCoach comments before putting new one')
      .default(false),
    failOnWarnings: z
      .boolean()
      .describe('Fail the job if warnings are found')
      .default(false),
    dryRun: z
      .boolean()
      .describe('Running CodeCoach without reporting to VCS')
      .default(false),
  })
  .refine((options) => {
    if (!options.dryRun && !options.vcs) throw 'VCS type is required';

    // validate VCS configs
    if (options.vcs === 'github' && GITHUB_ARGS.some((arg) => !options[arg]))
      throw `GitHub requires [${GITHUB_ARGS.map((a) => `--${a}`).join(', ')}] to be set`;

    if (options.vcs === 'gitlab' && GITLAB_ARGS.some((arg) => !options[arg]))
      throw `GitLab requires [${GITLAB_ARGS.map((a) => `--${a}`).join(', ')}] to be set`;

    return true;
  });

export const args = yargs
  .option('file', {
    alias: 'f',
    default: 'codecoach.config.js',
  })
  .coerce('file', function (file) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const result = configSchema.safeParse(require(path.join(process.cwd(), file)));
    if (!result.success) {
      console.error(result.error);
      return {};
    }
    return result.data;
  })
  .strict()
  .help()
  .wrap(120)
  .parse(process.argv.slice(1));

export const configs = args.file as ConfigArgument;
