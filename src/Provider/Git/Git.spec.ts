import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { GitConfigType } from '..';
import { REPO_DIR } from '../../app.constants';
import { Git } from './Git';

describe('Git tests', () => {
  const cloneDest = './testdir';
  const config: GitConfigType = {
    src: 'https://github.com/yee2542/git-101',
    dest: cloneDest,
    prId: 5,
  };
  const ROOT_PATH = resolve(cloneDest);
  const PROJECT_PATH = resolve(cloneDest, REPO_DIR);
  const git = new Git(config);

  it('Should execute git commands on correct path', () => {
    const cloneCommand = git.commands[0].cmd.join(' ');
    const cloneCwd = git.commands[0].cwd;
    const cloneTargetPath = resolve(cloneDest, REPO_DIR);

    const fetchCommand = git.commands[1].cmd.join(' ');
    const fetchCwd = git.commands[1].cwd;

    const checkoutCommand = git.commands[2].cmd.join(' ');
    const checkoutCwd = git.commands[2].cwd;

    expect(cloneCommand).toBe(
      'git clone https://github.com/yee2542/git-101' + ' ' + cloneTargetPath,
    );
    expect(cloneCwd).toBe(ROOT_PATH);

    expect(fetchCommand).toBe('git fetch origin pull/5/head');
    expect(fetchCwd).toBe(PROJECT_PATH);

    expect(checkoutCommand).toBe('git checkout -b pullrequest FETCH_HEAD');
    expect(checkoutCwd).toBe(PROJECT_PATH);
  });

  it('Should clear an old folder', async () => {
    await mkdir(PROJECT_PATH, { recursive: true });
    await writeFile(PROJECT_PATH + '/test.txt', 'this is a test file');
    await git.clearRepo();
    const repoExist = existsSync(PROJECT_PATH);
    expect(repoExist).toBe(false);
  });

  it('The git constant should define correctly', () => {
    // todo: srsly ?
    expect(REPO_DIR).toBe('./repo');
  });
});
