import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Terminal } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, onShowToast }) => (
  <div className="prose prose-invert max-w-none 
    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
    prose-h1:text-4xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b prose-h1:border-border/50
    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:flex prose-h2:items-center prose-h2:gap-3
    prose-p:text-textMain/90 prose-p:leading-8 prose-p:text-lg
    prose-li:text-textMain/90 prose-li:text-lg
    prose-strong:text-white prose-strong:font-bold
    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
    prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
    prose-img:rounded-2xl prose-img:shadow-2xl
    selection:bg-primary/30"
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <div className="relative group my-8">
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                    onShowToast?.('Code copied', 'success');
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="absolute left-4 top-4 flex items-center gap-2 text-textMuted/50">
                <Terminal size={14} />
                <span className="text-[10px] font-mono uppercase tracking-widest">{match[1]}</span>
              </div>
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-2xl !bg-[#0d1117] !p-8 !pt-12 border border-border/50 shadow-2xl"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <div className="my-10 overflow-hidden rounded-2xl border border-border/50 bg-surface/20 shadow-xl">
              <table className="w-full border-collapse text-left">
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-white/5 border-b border-border/50">{children}</thead>;
        },
        th({ children }) {
          return <th className="p-4 text-xs font-extrabold uppercase tracking-widest text-primary/80">{children}</th>;
        },
        td({ children }) {
          return <td className="p-4 text-sm text-textMain/80 border-b border-border/10 last:border-0">{children}</td>;
        },
        h2({ children, ...props }) {
          return (
            <h2 {...props} className="group flex items-center gap-3">
              <span className="w-1.5 h-8 bg-primary rounded-full group-hover:h-10 transition-all duration-300" />
              {children}
            </h2>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);
