import { IGitLabMRService } from './IGitLabMRService';
import {
  mockTouchDiff,
  touchFileError,
  touchFileWarning,
  untouchedError,
  untouchedWarning,
} from '../mockData';
import { MergeRequestDiffVersionsSchema, MergeRequestNoteSchema } from '@gitbeaker/core';
import { ConfigArgument } from '../../Config';
import { VCSEngine } from '../CommonVCS/VCSEngine';
import { GitLabAdapter } from './GitLabAdapter';
import { AnalyzerBot } from '../../AnalyzerBot/AnalyzerBot';

const mockCurrentUserId = 123456;

// Create helper function to generate consistent comment keys
const generateCommentKey = (file: string, line: number | undefined, text: string) =>
  `${file}:${line}:${text}`;

const mockNotes = [
  {
    id: 1,
    author: { id: mockCurrentUserId },
    system: true,
    body: 'system message',
  },
  {
    id: 2,
    author: { id: mockCurrentUserId },
    system: false,
    body: 'existing comment',
  },
] as MergeRequestNoteSchema[];

const mockVersionId = 3425234;
const mockVersion = {
  id: mockVersionId,
} as MergeRequestDiffVersionsSchema;

class MrServiceMock implements IGitLabMRService {
  createMRDiscussion = jest.fn().mockResolvedValue(undefined);
  createNote = jest.fn().mockResolvedValue(undefined);
  deleteNote = jest.fn().mockResolvedValue(undefined);
  diff = jest.fn().mockResolvedValue([mockTouchDiff]);
  getCurrentUserId = jest.fn().mockResolvedValue(mockCurrentUserId);
  getLatestVersion = jest.fn().mockResolvedValue(mockVersion);
  listAllNotes = jest.fn().mockResolvedValue(mockNotes);
}

const configs = {
  removeOldComment: false,
  failOnWarnings: false,
  suppressRules: [] as Array<string>,
} as ConfigArgument;

function createGitLab(service: IGitLabMRService, configs: ConfigArgument) {
  return new VCSEngine(configs, new AnalyzerBot(configs), new GitLabAdapter(service));
}

describe('VCS: GitLab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when there is no error', async () => {
    const service = new MrServiceMock();
    const gitLab = createGitLab(service, configs);

    const result = await gitLab.report([
      touchFileWarning,
      untouchedError,
      untouchedWarning,
    ]);

    expect(result).toBe(true);
  });

  it('should return false when there is some error', async () => {
    const service = new MrServiceMock();
    const gitLab = createGitLab(service, configs);

    const result = await gitLab.report([
      touchFileError,
      touchFileWarning,
      untouchedError,
      untouchedWarning,
    ]);

    expect(result).toBe(false);
  });

  it('should not create duplicate comments and should create new unique comments', async () => {
    const service = new MrServiceMock();

    // Pre-populate with an existing comment for the error
    const existingErrorText = `${touchFileError.source}:${touchFileError.line}::rotating_light: ${touchFileError.msg}  \n`;

    service.listAllNotes.mockResolvedValue([
      ...mockNotes,
      {
        id: 4,
        author: { id: mockCurrentUserId },
        system: false,
        body: existingErrorText,
      },
    ]);

    const gitLab = createGitLab(service, configs);
    await gitLab.report([touchFileError, touchFileWarning]);

    expect(service.createMRDiscussion).toHaveBeenCalledTimes(1);
    expect(service.createMRDiscussion).toHaveBeenCalledWith(
      mockVersion,
      touchFileWarning.source,
      touchFileWarning.line,
      expect.any(String),
    );
  });

  it('should not comment if there is no relevant lint issue', async () => {
    const service = new MrServiceMock();
    const gitLab = createGitLab(service, configs);

    await gitLab.report([untouchedError, untouchedWarning]);

    expect(service.createMRDiscussion).not.toHaveBeenCalled();
    expect(service.createNote).not.toHaveBeenCalled();
  });

  it('should not create comments that already exist', async () => {
    const service = new MrServiceMock();
    const gitLab = createGitLab(service, configs);

    // Set up mock with existing summary comment
    const existingSummaryComment =
      '## CodeCoach reports 1 issue\n:rotating_light: 0 error\n:warning: 1 warning';
    service.listAllNotes.mockResolvedValue([
      {
        id: 1,
        author: { id: mockCurrentUserId },
        system: false,
        body: existingSummaryComment,
      },
    ]);

    await gitLab.report([touchFileWarning]);
    expect(service.createNote).not.toHaveBeenCalled();
  });

  describe('when failOnWarnings is true', () => {
    const warningConfigs = { ...configs, failOnWarnings: true };

    it('should return true when there is no error or warning', async () => {
      const service = new MrServiceMock();
      const gitLab = createGitLab(service, warningConfigs);

      const result = await gitLab.report([untouchedError, untouchedWarning]);
      expect(result).toBe(true);
    });

    it('should return false when there is some error', async () => {
      const service = new MrServiceMock();
      const gitLab = createGitLab(service, warningConfigs);

      const result = await gitLab.report([
        touchFileError,
        untouchedError,
        untouchedWarning,
      ]);
      expect(result).toBe(false);
    });

    it('should return false when there is some warnings', async () => {
      const service = new MrServiceMock();
      const gitLab = createGitLab(service, warningConfigs);

      const result = await gitLab.report([
        touchFileWarning,
        untouchedError,
        untouchedWarning,
      ]);
      expect(result).toBe(false);
    });
  });
});
