import { VCS } from '../@interfaces/VCS';
import { LogType } from '../../Parser';

export class GitLab implements VCS {
  async report(logs: LogType[]): Promise<void> {
    // create review comments in commit + only in diff & warning | error
    // create summary comment in MR
    // app return 1 or 0 based on result
    // reject mr
  }

  // FIND DIFF!
  // get mr versions
  // select latest version with state = "collected"
  // get single version
  // $.diffs.*.{new_path,new_file,diff}

  // CREATE DISCUSSION
  // /api/v4/projects/<pid>/merge_requests/<iid>/discussions
  // param: body, base|head|start sha, path, line

  // CREATE SUMMARY COMMENT
  // /api/v4/projects/<pid>/merge_requests/<iid>/notes
}
