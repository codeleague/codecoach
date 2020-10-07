import ProviderInternalConfig from '../../Provider/@types/providerInternalConfig';
import { Optional } from '../../@utilTypes/Optional';

export type ProviderConfig = Optional<
  ProviderInternalConfig,
  'baseUrl' | 'repoUrl' | 'workDir' | 'userAgent' | 'timeZone' | 'gitCloneBypass'
>;
