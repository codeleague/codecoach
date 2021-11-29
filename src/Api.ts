import axios from 'axios';

import { RunApi } from '@codecoach/api-client';

export class Api {
  private readonly axiosInstance;
  constructor(private readonly apiServer: string) {
    this.axiosInstance = axios.create({
      baseURL: process.env.NODE_ENV === 'development' ? '' : this.apiServer,
    });
  }

  get runClient(): RunApi {
    return new RunApi(undefined, '', this.axiosInstance);
  }
}
