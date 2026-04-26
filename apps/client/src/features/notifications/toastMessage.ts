export type ToastType = 'info' | 'success' | 'warning' | 'error';

const MAX_TOAST_MESSAGE_LENGTH = 180;

function stripTechnicalNoise(message: string): string {
  return message
    .replace(/^\s*(uncaught\s+)?(error|typeerror|referenceerror|syntaxerror|rangeerror):\s*/i, '')
    .replace(/\s+at\s+[\w.$<>\-/\\]+(?:\s+\([^)]*\))?/g, '')
    .replace(/https?:\/\/\S+/gi, '[link]')
    .replace(/\b[A-Z]:\\[^\s]+/gi, '[path]')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentenceCase(message: string): string {
  if (!message) return message;
  const lower = message === message.toUpperCase() ? message.toLowerCase() : message;
  const restoredAcronyms = lower
    .replace(/\boidc\b/g, 'OIDC')
    .replace(/\bpat\b/g, 'PAT')
    .replace(/\bidb\b/g, 'IDB')
    .replace(/\bjson\b/g, 'JSON')
    .replace(/\bhtml\b/g, 'HTML')
    .replace(/\bpdf\b/g, 'PDF')
    .replace(/\bpwa\b/g, 'PWA');
  return restoredAcronyms.charAt(0).toUpperCase() + restoredAcronyms.slice(1);
}

export function normalizeToastMessage(message: unknown, type: ToastType = 'info'): string {
  const fallback = type === 'error'
    ? 'Something went wrong. Check diagnostics for details.'
    : 'Action could not be completed.';
  const raw = message instanceof Error ? message.message : String(message ?? '');
  const cleaned = stripTechnicalNoise(raw);
  const readable = sentenceCase(cleaned || fallback);

  if (readable.length <= MAX_TOAST_MESSAGE_LENGTH) {
    return readable;
  }
  return `${readable.slice(0, MAX_TOAST_MESSAGE_LENGTH - 1).trimEnd()}…`;
}
