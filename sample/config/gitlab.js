module.exports = {
  vcs: 'gitlab',
  gitlabHost: 'https://gitlab.myawesomecompany.com',
  gitlabProjectId: 1234,
  gitlabMrIid: 69,
  gitlabToken: 'mockGitLabToken',
  buildLogFile: ['dotnetbuild;./sample/dotnetbuild/build.content;/repo/src'],
  output: './tmp/out.json',
  removeOldComment: true,
};
