import { LogSeverity } from './@enums/log.severity.enum';
import { DartLintParser } from './DartLintParser';

describe('DartLintStyleParser', () => {
  const cwd = `any`;
  const mockedContent = `
    The plugin can be updated to the v2 Android Plugin APIs by following https://flutter.dev/go/android-plugin-migration.
    Analyzing host_app...                                           
    info • Unused import: 'dart:async' • api/modules/lib/auth/auth.dart:1:8 • unused_import
    info • 'await' applied to 'void', which is not a 'Future' • lib/domain/providers/sharable_images_repo.dart:114:5 • await_only_futures
    error • Sort child properties last in widget instance creations • lib/presentation/widgets/platform_flat_button.dart:34:9 • sort_child_properties_last
    error • The annotation 'Timeout' can only be used on libraries • test_driver/tests/offline/offline_test.dart:13:2 • invalid_annotation_target
  `;
  const mockedContentBrokenLines = `
    The plugin can be updated to the v2 Android Plugin APIs by following https://flutter.dev/go/android-plugin-migration.
    Analyzing host_app...                                           
    info • Unused import: 'dart:async' • api/modules/host_manage_api/lib/auth/auth.dart • unused_import
    lib/domain/providers/sharable_images_repo.dart:114:5 • await_only_futures
  `;
  const mockedContentNoResults = `
    The plugin can be updated to the v2 Android Plugin APIs by following https://flutter.dev/go/android-plugin-migration.
    Analyzing host_app...
  `;

  it('Should parse correctly', () => {
    const result = new DartLintParser(cwd).parse(mockedContent);
    expect(result).toHaveLength(4);

    expect(result[0]).toEqual({
      source: 'api/modules/lib/auth/auth.dart',
      severity: LogSeverity.info,
      line: 1,
      lineOffset: 8,
      msg: `Unused import: 'dart:async'`,
      log: `unused_import`,
      valid: true,
    });

    expect(result[1]).toEqual({
      source: `lib/domain/providers/sharable_images_repo.dart`,
      severity: LogSeverity.info,
      line: 114,
      lineOffset: 5,
      msg: `'await' applied to 'void', which is not a 'Future'`,
      log: `await_only_futures`,
      valid: true,
    });

    expect(result[2]).toEqual({
      source: `lib/presentation/widgets/platform_flat_button.dart`,
      severity: LogSeverity.error,
      line: 34,
      lineOffset: 9,
      msg: `Sort child properties last in widget instance creations`,
      log: `sort_child_properties_last`,
      valid: true,
    });

    expect(result[3]).toEqual({
      source: `test_driver/tests/offline/offline_test.dart`,
      severity: LogSeverity.error,
      line: 13,
      lineOffset: 2,
      msg: `The annotation 'Timeout' can only be used on libraries`,
      log: `invalid_annotation_target`,
      valid: true,
    });
  });

  it('Should parse content with broken lines correctly', () => {
    expect(() => new DartLintParser(cwd).parse(mockedContentBrokenLines)).toHaveLength(0);
  });

  it('Should do nothing if put empty string', () => {
    expect(() => new DartLintParser(cwd).parse('')).toHaveLength(0);
  });

  it('Should be empty when the line not match the rule', () => {
    expect(() => new DartLintParser(cwd).parse(':')).toHaveLength(0);
  });

  it('Should parse content with no results correctly', () => {
    expect(() => new DartLintParser(cwd).parse(mockedContentNoResults)).toHaveLength(0);
  });
});
