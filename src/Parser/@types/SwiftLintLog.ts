// https://github.com/realm/SwiftLint/blob/main/Source/SwiftLintCore/Reporters/JSONReporter.swift
export type SwiftLintLog = {
  character: number | null;
  file: string | null;
  line: number | null;
  reason: string;
  rule_id: string;
  severity: string;
  type: string;
};
