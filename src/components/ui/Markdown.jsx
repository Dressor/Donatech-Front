import ReactMarkdown from 'react-markdown';

// Render de Markdown con estilos explícitos (no depende del plugin typography de Tailwind).
const components = {
  h1: (p) => <h1 className="text-2xl font-bold text-gray-900 mb-3 mt-2" {...p} />,
  h2: (p) => <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-5" {...p} />,
  h3: (p) => <h3 className="font-semibold text-gray-800 mb-1 mt-3" {...p} />,
  p: (p) => <p className="text-gray-700 text-sm leading-relaxed mb-3" {...p} />,
  ul: (p) => <ul className="list-disc pl-5 space-y-1 mb-3 text-gray-700 text-sm" {...p} />,
  ol: (p) => <ol className="list-decimal pl-5 space-y-1 mb-3 text-gray-700 text-sm" {...p} />,
  li: (p) => <li {...p} />,
  strong: (p) => <strong className="font-semibold text-gray-900" {...p} />,
  a: (p) => <a className="text-primary-600 underline" {...p} />,
  hr: () => <hr className="border-gray-200 my-4" />,
};

export default function Markdown({ children }) {
  return <ReactMarkdown components={components}>{children ?? ''}</ReactMarkdown>;
}
