import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

let _client: backendInterface | null = null;
let _promise: Promise<backendInterface> | null = null;

export async function getBackend(): Promise<backendInterface> {
  if (_client) return _client;
  if (_promise) return _promise;
  _promise = createActorWithConfig().then((actor) => {
    _client = actor;
    return actor;
  });
  return _promise;
}
