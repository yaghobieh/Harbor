import { FC, useMemo, useState } from 'react';
import { CodeBlockProps, Token, TokenType } from './types';

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: 'text-purple-400',
  string: 'text-green-400',
  comment: 'text-gray-500',
  number: 'text-orange-400',
  function: 'text-blue-400',
  property: 'text-red-400',
  operator: 'text-pink-400',
  punctuation: 'text-gray-400',
  text: 'text-gray-300',
};

const KEYWORDS = [
  'import', 'export', 'from', 'const', 'let', 'var', 'function', 'async', 'await',
  'return', 'if', 'else', 'new', 'true', 'false', 'null', 'undefined', 'type',
  'interface', 'class', 'extends', 'implements', 'default', 'throw', 'try', 'catch',
  'finally', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'typeof',
  'instanceof', 'in', 'of', 'this', 'super', 'static', 'public', 'private', 'protected',
];

function tokenize(code: string): Token[][] {
  const lines = code.split('\n');
  
  return lines.map(line => {
    const tokens: Token[] = [];
    let remaining = line;
    
    while (remaining.length > 0) {
      // Comments
      if (remaining.startsWith('//')) {
        tokens.push({ type: 'comment', value: remaining });
        break;
      }
      
      // Strings (single, double, backtick)
      const stringMatch = remaining.match(/^(['"`])((?:\\.|(?!\1)[^\\])*?)\1/);
      if (stringMatch) {
        tokens.push({ type: 'string', value: stringMatch[0] });
        remaining = remaining.slice(stringMatch[0].length);
        continue;
      }
      
      // Numbers
      const numberMatch = remaining.match(/^\b\d+(\.\d+)?\b/);
      if (numberMatch) {
        tokens.push({ type: 'number', value: numberMatch[0] });
        remaining = remaining.slice(numberMatch[0].length);
        continue;
      }
      
      // Function calls (word followed by parenthesis)
      const funcMatch = remaining.match(/^(\w+)(\s*)\(/);
      if (funcMatch) {
        const word = funcMatch[1];
        if (KEYWORDS.includes(word)) {
          tokens.push({ type: 'keyword', value: word });
        } else {
          tokens.push({ type: 'function', value: word });
        }
        tokens.push({ type: 'text', value: funcMatch[2] });
        tokens.push({ type: 'punctuation', value: '(' });
        remaining = remaining.slice(funcMatch[0].length);
        continue;
      }
      
      // Property access (. followed by word)
      const propMatch = remaining.match(/^\.(\w+)/);
      if (propMatch) {
        tokens.push({ type: 'punctuation', value: '.' });
        tokens.push({ type: 'property', value: propMatch[1] });
        remaining = remaining.slice(propMatch[0].length);
        continue;
      }
      
      // Object property (word followed by colon)
      const objPropMatch = remaining.match(/^(\w+)(\s*):/);
      if (objPropMatch) {
        tokens.push({ type: 'property', value: objPropMatch[1] });
        tokens.push({ type: 'text', value: objPropMatch[2] });
        tokens.push({ type: 'punctuation', value: ':' });
        remaining = remaining.slice(objPropMatch[0].length);
        continue;
      }
      
      // Keywords and identifiers
      const wordMatch = remaining.match(/^\w+/);
      if (wordMatch) {
        const word = wordMatch[0];
        if (KEYWORDS.includes(word)) {
          tokens.push({ type: 'keyword', value: word });
        } else {
          tokens.push({ type: 'text', value: word });
        }
        remaining = remaining.slice(word.length);
        continue;
      }
      
      // Operators
      const opMatch = remaining.match(/^(=>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%<>=!&|^~?])/);
      if (opMatch) {
        tokens.push({ type: 'operator', value: opMatch[0] });
        remaining = remaining.slice(opMatch[0].length);
        continue;
      }
      
      // Punctuation
      const punctMatch = remaining.match(/^[{}[\]();,]/);
      if (punctMatch) {
        tokens.push({ type: 'punctuation', value: punctMatch[0] });
        remaining = remaining.slice(1);
        continue;
      }
      
      // Whitespace and other characters
      tokens.push({ type: 'text', value: remaining[0] });
      remaining = remaining.slice(1);
    }
    
    return tokens;
  });
}

export const CodeBlock: FC<CodeBlockProps> = ({ 
  code, 
  filename, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const tokenizedLines = useMemo(() => tokenize(code), [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`relative bg-gradient-to-b from-jet-900 to-[#0f0f1a] rounded-2xl border border-white/5 overflow-hidden group ${className}`}>
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Copy code"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {filename && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-4 text-sm text-gray-500 font-mono">{filename}</span>
        </div>
      )}
      <div className="p-6 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed">
          <code>
            {tokenizedLines.map((tokens, lineIndex) => (
              <div key={lineIndex}>
                {tokens.length === 0 ? (
                  <br />
                ) : (
                  tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={TOKEN_COLORS[token.type]}>
                      {token.value}
                    </span>
                  ))
                )}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
