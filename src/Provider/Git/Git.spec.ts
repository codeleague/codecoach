import { existsSync, mkdir, writeFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import GitLoaderType from '../@types/git.loader.type';
import {
  GIT_DEFAULT_CLONE_ALIAS_PATH,
  GIT_DEFAULT_CLONE_PATH,
  GIT_WORK_DIR,
} from '../constants/git.constant';
import { Git } from './Git';

describe('Git tests', () => {
  const config: GitLoaderType = {
    src: 'https://github.com/yee2542/git-101',
    prId: 5,
  };
  const ROOT_PATH = join(__dirname, GIT_WORK_DIR, GIT_DEFAULT_CLONE_PATH);
  const PROJECT_PATH = join(
    __dirname,
    GIT_WORK_DIR,
    GIT_DEFAULT_CLONE_PATH,
    GIT_DEFAULT_CLONE_ALIAS_PATH,
  );
  const git = new Git(config);

  it('Should exec a git correctly path', () => {
    const cloneCommand = git.commands[0].cmd.join(' ');
    const cloneCwd = git.commands[0].cwd;
    const cloneTargerPath = join(
      __dirname,
      GIT_WORK_DIR,
      GIT_DEFAULT_CLONE_PATH,
      GIT_DEFAULT_CLONE_ALIAS_PATH,
    );

    const fetchCommand = git.commands[1].cmd.join(' ');
    const fetchCwd = git.commands[1].cwd;

    const checkoutCommand = git.commands[2].cmd.join(' ');
    const checkoutCwd = git.commands[2].cwd;

    expect(cloneCommand).toBe(
      'git clone https://github.com/yee2542/git-101' + ' ' + cloneTargerPath,
    );
    expect(cloneCwd).toBe(ROOT_PATH);

    expect(fetchCommand).toBe('git fetch origin pull/5/head');
    expect(fetchCwd).toBe(PROJECT_PATH);

    expect(checkoutCommand).toBe('git checkout -b pullrequest FETCH_HEAD');
    expect(checkoutCwd).toBe(PROJECT_PATH);
  });

  it('Should be clear an old folder', async () => {
    const dir = promisify(mkdir);
    await dir(PROJECT_PATH, { recursive: true });
    const write = promisify(writeFile);
    await write(PROJECT_PATH + '/test.txt', 'this is a test file');
    await git.clearRepo();
    const repoExist = existsSync(PROJECT_PATH);
    expect(repoExist).toBe(false);
  });

  it('The git constant should define correctly', () => {
    expect(GIT_WORK_DIR).toBe('../../../');
    expect(GIT_DEFAULT_CLONE_PATH).toBe('tmp');
    expect(GIT_DEFAULT_CLONE_ALIAS_PATH).toBe('./repo');
  });
});
