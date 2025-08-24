import axios from 'axios';
import { ParseResponse, RunResponse } from './types';

const API_BASE_URL = 'http://localhost:4000/api';

export const api = {
  async parse(prompt: string): Promise<ParseResponse> {
    const response = await axios.post(`${API_BASE_URL}/parse`, { prompt });
    return response.data;
  },

  async run(prompt: string): Promise<RunResponse> {
    const response = await axios.post(`${API_BASE_URL}/run`, { prompt });
    return response.data;
  }
};
