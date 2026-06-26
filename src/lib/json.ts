export async function parseJsonBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>
}
