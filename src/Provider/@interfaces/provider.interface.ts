import ProviderConfigType from '../@types/provider.config.type';

interface ProviderInterface<T> {
  adapter: T;
  config: ProviderConfigType;
}

export default ProviderInterface;
