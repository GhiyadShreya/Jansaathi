import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders AI chat replies. Tailwind's preflight strips default list/heading/table
 * styles and plain ReactMarkdown doesn't parse tables, so both are handled here.
 */
const components: Components = {
  h1: ({ children }) => <p className="font-black text-[1.05em] mt-2 mb-1">{children}</p>,
  h2: ({ children }) => <p className="font-black mt-2 mb-1">{children}</p>,
  h3: ({ children }) => <p className="font-bold mt-2 mb-1">{children}</p>,
  h4: ({ children }) => <p className="font-bold mt-2 mb-1">{children}</p>,
  p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-1">{children}</ol>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline font-semibold break-words"
      style={{ color: '#C2410C' }}
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2 -mx-1">
      <table className="min-w-full text-[0.95em] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left font-bold px-2 py-1 border-b" style={{ borderColor: '#E7E0D6' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td className="align-top px-2 py-1 border-b" style={{ borderColor: '#F0EDE8' }}>{children}</td>
  ),
  code: ({ children }) => <code className="px-1 rounded" style={{ background: '#F0EDE8' }}>{children}</code>,
};

export const ChatMarkdown: React.FC<{ text: string }> = ({ text }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {text}
  </ReactMarkdown>
);
