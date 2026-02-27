import axios from 'axios';

// Default to backend NestJS local port if not provided
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally, add interceptors for Auth Tokens in the future:
// apiClient.interceptors.request.use((config) => { ... })
