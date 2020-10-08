import { ProviderConfig } from '../../Config/@types';

interface ProviderInterface<T> {
  adapter: T;
  config: ProviderConfig;
}

export default ProviderInterface;
