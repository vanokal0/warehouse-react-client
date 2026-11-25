export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function apiUrl(path: string): string {
  return `${import.meta.env.VITE_BACKEND_API_URL}${path}`;
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(apiUrl(path), init);

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Request to ${path} failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}
