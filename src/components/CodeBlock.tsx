import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export function CodeBlock({ code, lang = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); fail silently.
    }
  };

  return (
    <div className="codeblock">
      <div className="codeblock__bar">
        <span className="codeblock__lang">{lang}</span>
        <button
          type="button"
          className={`codeblock__copy ${copied ? 'is-copied' : ''}`}
          onClick={copy}
        >
          {copied ? 'copied ✓' : 'copy'}
        </button>
      </div>
      <pre>
        <code>{code.replace(/\n$/, '')}</code>
      </pre>
    </div>
  );
}
