export type ScalaStyleError = {
  _attributes: {
    column?: number;
    line?: number;
    source?: string;
    severity: string;
    message: string;
  };
};
