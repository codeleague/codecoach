import ProviderInternalConfig from '../@types/providerInternalConfig';

interface ProviderInterface<T> {
  adapter: T;
  config: ProviderInternalConfig;
}

export default ProviderInterface;
