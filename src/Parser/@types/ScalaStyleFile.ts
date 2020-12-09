import { ScalaStyleError } from './ScalaStyleError';

export type ScalaStyleFile = {
  _attributes: {
    name: string;
  };
  error: ScalaStyleError[];
};
