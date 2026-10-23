import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const getErrorMessage = (err: unknown): string =>
  ((err as AxiosError<{ message?: string }>)?.response?.data?.message) ?? "Something went wrong";

export default api;