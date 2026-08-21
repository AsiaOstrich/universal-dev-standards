// Synthetic fixture for XSPEC-383 R8. Not a family member — it is the helper
// that `delegates.provider.ts` reaches through, one hop down the call graph.
import { request } from 'node:https';

export async function postJson(path: string, body: unknown): Promise<{ accepted: boolean; url: string }> {
  const host = `api.${process.env.FIXTURE_REGION ?? 'eu'}.fixtures.uds-effect-boundary.test`;
  return new Promise((resolve, reject) => {
    const req = request({ host, path, method: 'POST' }, () => {
      resolve({ accepted: true, url: `https://${host}${path}` });
    });
    req.on('error', reject);
    req.end(JSON.stringify(body));
  });
}
