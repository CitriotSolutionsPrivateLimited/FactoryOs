import axios from 'axios';
import { backend_url } from '../constants/config';

const apiInstance = axios.create({
    baseURL: backend_url,
    timeout: 40000, // timeout after 60 seconds
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true
});

export default apiInstance;