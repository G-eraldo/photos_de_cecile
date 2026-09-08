import { randomBytes } from 'node:crypto';
import { getResponseHeader, setResponseHeader } from 'h3';

export function nonceScripts(html, nonce) {
  // Only call on framework head output, never on user/component body HTML.
  return html.replace(/<script\b([^>]*)>/gi, (_tag, attributes) => {
    const clean = attributes.replace(/\snonce\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    return `<script nonce="${nonce}"${clean}>`;
  });
}

export function withScriptNonce(policy, nonce) {
  return policy.replace(/(^|;)\s*script-src\s+([^;]*)/i, (_match, separator, sources) =>
    `${separator} script-src ${sources.replace(/'unsafe-inline'\s*/g, '').trim()} 'nonce-${nonce}'`);
}

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev) return;

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const policy = getResponseHeader(event, 'content-security-policy');
    if (typeof policy !== 'string') return;
    const nonce = randomBytes(32).toString('base64');
    event.context.contentSecurityNonce = nonce;
    // Nuxt's payload and Unhead scripts are outside rendered component markup.
    for (const section of ['head', 'bodyAppend']) {
      html[section] = html[section].map((chunk) => nonceScripts(chunk, nonce));
    }
    setResponseHeader(event, 'content-security-policy', withScriptNonce(policy, nonce));
    // A cached HTML document must not replay a per-request nonce.
    setResponseHeader(event, 'cache-control', 'private, no-store');
  });
});
