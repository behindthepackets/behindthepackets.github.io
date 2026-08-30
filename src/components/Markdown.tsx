import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownProps {
  content: string;
}

// Renders lab-notebook markdown. Fenced code blocks are handed to CodeBlock so
// every snippet gets a copy button and the terminal styling.
export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = 'inline' in props ? !props.inline : String(children).includes('\n');
            if (match || isBlock) {
              return (
                <CodeBlock
                  code={String(children)}
                  lang={match ? match[1] : 'text'}
                />
              );
            }
            return <code className={className}>{children}</code>;
          },
          // react-markdown wraps our block code in <pre>; unwrap it since
          // CodeBlock renders its own <pre>.
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
