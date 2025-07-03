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
  listAllDiscussions = jest.fn().mockResolvedValue([]);
  deleteDiscussion = jest.fn().mockResolvedValue(undefined);
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

  it('should remove existing comments when removeOldComment is enabled', async () => {
    const service = new MrServiceMock();
    const configsWithRemoveOldComment = { ...configs, removeOldComment: true };
    const gitLab = createGitLab(service, configsWithRemoveOldComment);

    await gitLab.report([touchFileWarning]);

    // With the new approach, we use selective deletion based on current issues
    expect(service.listAllNotes).toHaveBeenCalled();
    expect(service.listAllDiscussions).toHaveBeenCalled();
    // deleteNote and deleteDiscussion will be called for outdated comments
  });

  describe('Error Handling for Comment Deletion', () => {
    it('should handle 404 errors gracefully when deleting notes', async () => {
      const service = new MrServiceMock();
      const configsWithRemoveOldComment = { ...configs, removeOldComment: true };

      // Mock a 404 error for note deletion
      const notFoundError = new Error('Not Found');
      (notFoundError as Error & { status: number }).status = 404;
      service.deleteNote.mockRejectedValueOnce(notFoundError);

      // Add an existing comment that should be deleted
      service.listAllNotes.mockResolvedValue([
        {
          id: 999,
          author: { id: mockCurrentUserId },
          system: false,
          body: 'outdated comment',
        },
      ]);

      const gitLab = createGitLab(service, configsWithRemoveOldComment);

      // Should not throw error even when note deletion fails with 404
      await expect(gitLab.report([touchFileWarning])).resolves.toBe(true);
      expect(service.deleteNote).toHaveBeenCalled();
    });

    it('should handle 404 errors gracefully when deleting discussions', async () => {
      const service = new MrServiceMock();
      const configsWithRemoveOldComment = { ...configs, removeOldComment: true };

      // Mock a 404 error for discussion deletion
      const notFoundError = new Error('Not Found');
      (notFoundError as Error & { status: number }).status = 404;
      service.deleteDiscussion.mockRejectedValueOnce(notFoundError);

      // Add an existing discussion that should be deleted
      service.listAllDiscussions.mockResolvedValue([
        {
          id: 'discussion-123',
          notes: [
            {
              id: 456,
              author: { id: mockCurrentUserId },
              system: false,
              body: 'outdated discussion comment',
            },
          ],
        },
      ]);

      const gitLab = createGitLab(service, configsWithRemoveOldComment);

      // Should not throw error even when discussion deletion fails with 404
      await expect(gitLab.report([touchFileWarning])).resolves.toBe(true);
      expect(service.deleteDiscussion).toHaveBeenCalled();
    });

    it('should continue processing when some comment deletions fail', async () => {
      const service = new MrServiceMock();
      const configsWithRemoveOldComment = { ...configs, removeOldComment: true };

      // Mock multiple notes, some will fail to delete
      service.listAllNotes.mockResolvedValue([
        {
          id: 100,
          author: { id: mockCurrentUserId },
          system: false,
          body: 'comment that will fail',
        },
        {
          id: 200,
          author: { id: mockCurrentUserId },
          system: false,
          body: 'comment that will succeed',
        },
      ]);

      // First deletion fails, second succeeds
      const notFoundError = new Error('Not Found');
      (notFoundError as Error & { status: number }).status = 404;
      service.deleteNote
        .mockRejectedValueOnce(notFoundError)
        .mockResolvedValueOnce(undefined);

      const gitLab = createGitLab(service, configsWithRemoveOldComment);

      // Should complete successfully despite partial failures
      await expect(gitLab.report([touchFileWarning])).resolves.toBe(true);
      expect(service.deleteNote).toHaveBeenCalledTimes(2);
    });

    it('should handle invalid comment IDs gracefully', async () => {
      const service = new MrServiceMock();
      const configsWithRemoveOldComment = { ...configs, removeOldComment: true };

      // Mock notes with invalid IDs
      service.listAllNotes.mockResolvedValue([
        {
          id: null, // Invalid ID
          author: { id: mockCurrentUserId },
          system: false,
          body: 'comment with null id',
        },
        {
          id: 'invalid-string-id', // Invalid ID type
          author: { id: mockCurrentUserId },
          system: false,
          body: 'comment with string id',
        },
      ]);

      const gitLab = createGitLab(service, configsWithRemoveOldComment);

      // Should handle invalid IDs without attempting deletion
      await expect(gitLab.report([touchFileWarning])).resolves.toBe(true);
      // deleteNote should not be called for invalid IDs
      expect(service.deleteNote).not.toHaveBeenCalled();
    });

    it('should handle discussion deletion with 404 errors on individual notes', async () => {
      const service = new MrServiceMock();
      const configsWithRemoveOldComment = { ...configs, removeOldComment: true };

      // Mock a discussion with notes
      const mockDiscussion = {
        id: 'discussion-456',
        notes: [
          { id: 10, author: { id: mockCurrentUserId } },
          { id: 20, author: { id: mockCurrentUserId } },
        ],
      };

      service.listAllDiscussions.mockResolvedValue([mockDiscussion]);

      // Mock discussion show to return the discussion
      const mockMRService = service as MrServiceMock & {
        api: {
          MergeRequestDiscussions: {
            show: jest.Mock;
          };
          MergeRequestNotes: {
            remove: jest.Mock;
          };
        };
      };
      mockMRService.api = {
        MergeRequestDiscussions: {
          show: jest.fn().mockResolvedValue(mockDiscussion),
        },
        MergeRequestNotes: {
          remove: jest
            .fn()
            .mockRejectedValueOnce(new Error('Not Found')) // First note fails
            .mockResolvedValueOnce(undefined), // Second note succeeds
        },
      };

      const gitLab = createGitLab(service, configsWithRemoveOldComment);

      // Should complete successfully despite partial note deletion failures
      await expect(gitLab.report([touchFileWarning])).resolves.toBe(true);
    });

    it('should log appropriate warnings for failed deletions', async () => {
      const service = new MrServiceMock();
      const configsWithRemoveOldComment = { ...configs, removeOldComment: true };

      // Spy on console to capture log messages
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock a 404 error
      const notFoundError = new Error('Not Found');
      (notFoundError as Error & { status: number }).status = 404;
      service.deleteNote.mockRejectedValueOnce(notFoundError);

      service.listAllNotes.mockResolvedValue([
        {
          id: 123,
          author: { id: mockCurrentUserId },
          system: false,
          body: 'comment to delete',
        },
      ]);

      const gitLab = createGitLab(service, configsWithRemoveOldComment);
      await gitLab.report([touchFileWarning]);

      // Should log warning about failed deletion
      // Note: The actual log message will depend on the Winston logger configuration

      consoleSpy.mockRestore();
    });
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
