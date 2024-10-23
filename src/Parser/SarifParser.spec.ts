import { LintSeverity } from './@enums/LintSeverity';
import { LintItem } from './@types';
import { SarifParser } from './SarifParser';

describe('SarifParser tests', () => {
  const cwdWin = 'C:\\source';
  const cwdUnix = '/dir';

  const basicSarifLog = {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'TestAnalyzer',
            rules: [
              {
                id: 'TEST001',
                shortDescription: {
                  text: 'Test rule description'
                }
              }
            ]
          }
        },
        results: [
          {
            ruleId: 'TEST001',
            level: 'warning',
            message: {
              text: 'This is a test warning'
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: 'C:\\source\\Test.cs'
                  },
                  region: {
                    startLine: 42,
                    startColumn: 13
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  };

  const sarifLogNoLocation = {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'TestAnalyzer'
          }
        },
        results: [
          {
            ruleId: 'TEST002',
            level: 'error',
            message: {
              text: 'Error without location'
            }
          }
        ]
      }
    ]
  };

  const sarifLogMultipleResults = {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'TestAnalyzer'
          }
        },
        results: [
          {
            ruleId: 'TEST003',
            level: 'warning',
            message: {
              text: 'First warning'
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: 'C:\\source\\Test1.cs'
                  },
                  region: {
                    startLine: 10,
                    startColumn: 5
                  }
                }
              }
            ]
          },
          {
            ruleId: 'TEST004',
            level: 'error',
            message: {
              text: 'Second error'
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: 'C:\\source\\Test2.cs'
                  },
                  region: {
                    startLine: 20,
                    startColumn: 8
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  };

  const sarifLogUnrelatedPath = {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'TestAnalyzer'
          }
        },
        results: [
          {
            ruleId: 'TEST005',
            level: 'warning',
            message: {
              text: 'Warning with unrelated path'
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: '/usr/share/test/Unrelated.cs'
                  },
                  region: {
                    startLine: 15,
                    startColumn: 3
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  };

  it('Should parse basic SARIF log correctly', () => {
    const result = new SarifParser(cwdWin).parse(JSON.stringify(basicSarifLog));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ruleId: 'TEST001',
      source: 'Test.cs',
      severity: LintSeverity.warning,
      line: 42,
      lineOffset: 13,
      msg: 'TEST001: This is a test warning',
      log: expect.any(String),
      valid: true,
      type: 'sarif',
    } as LintItem);
  });

  it('Should handle results without location information', () => {
    const result = new SarifParser(cwdWin).parse(JSON.stringify(sarifLogNoLocation));
    expect(result).toHaveLength(0);
  });

  it('Should parse multiple results correctly', () => {
    const result = new SarifParser(cwdWin).parse(JSON.stringify(sarifLogMultipleResults));
    expect(result).toHaveLength(2);
    expect(result[0].severity).toBe(LintSeverity.warning);
    expect(result[1].severity).toBe(LintSeverity.error);
    expect(result[0].source).toBe('Test1.cs');
    expect(result[1].source).toBe('Test2.cs');
  });

  it('Should handle unrelated paths correctly and flag as invalid', () => {
    const result = new SarifParser(cwdUnix).parse(JSON.stringify(sarifLogUnrelatedPath));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ruleId: 'TEST005',
      source: 'Unrelated.cs',
      severity: LintSeverity.warning,
      line: 15,
      lineOffset: 3,
      msg: 'TEST005: Warning with unrelated path',
      log: expect.any(String),
      valid: false,
      type: 'sarif',
    } as LintItem);
  });

  it('Should handle empty SARIF log', () => {
    const emptyLog = {
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'TestAnalyzer'
            }
          },
          results: []
        }
      ]
    };
    const result = new SarifParser(cwdWin).parse(JSON.stringify(emptyLog));
    expect(result).toHaveLength(0);
  });

  it('Should throw error on invalid JSON', () => {
    expect(() => new SarifParser(cwdWin).parse('{')).toThrowError();
  });

  it('Should throw error on invalid SARIF format', () => {
    const invalidLog = {
      version: '2.1.0',
      // missing runs array
    };
    expect(() => new SarifParser(cwdWin).parse(JSON.stringify(invalidLog))).toThrowError();
  });

  it('Should handle missing severity level and default to warning', () => {
    const logWithNoLevel = {
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'TestAnalyzer'
            }
          },
          results: [
            {
              ruleId: 'TEST006',
              message: {
                text: 'Message with no severity level'
              },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: {
                      uri: 'C:\\source\\Test.cs'
                    },
                    region: {
                      startLine: 1,
                      startColumn: 1
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    };
    const result = new SarifParser(cwdWin).parse(JSON.stringify(logWithNoLevel));
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(LintSeverity.warning);
  });
});