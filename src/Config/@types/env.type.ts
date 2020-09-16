import envEnum from '../@enums/env.enum';

type envType = {
  [key in envEnum]: string;
};

export default envType;
