import { ConfigArgument } from '..';

type RequiredArgs = (keyof ConfigArgument)[];

export const REQUIRED_ARGS: RequiredArgs = ['url', 'pr', 'buildLogFile', 'token'];
