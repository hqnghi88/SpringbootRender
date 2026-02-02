const keywords = [
  'model', 'global', 'species', 'experiment', 'reflex', 'action', 'aspect',
  'if', 'else', 'loop', 'return', 'let', 'do', 'is', 'in'
];

const typeKeywords = [
  'int', 'float', 'string', 'bool', 'point', 'geometry', 'agent', 'list', 'map'
];

const operators = [
  '+', '-', '*', '/', '^', '=', '!=', '<', '>', '<=', '>=',
  'and', 'or', 'not', '~', '#', '?', ':', '::'
];

const symbols = /[=><!~?:&|+\-*\/\^#]+/;

const escapes = /\\(?:[abfnrtv\\'"']|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})/;

const tokenizer = {
  root: [
    [/[{}]/, 'delimiter.brace'],
    [/\/\/.*$/, 'comment'],
    [/\/\*[\s\S]*?\*\//, 'comment'],
    [/\s+/, 'white'],
    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
    [/0[oO][0-7]+/, 'number.octal'],
  ],
  keywords: [
    [/[a-zA-Z_$][\w$]*/, {
      cases: {
        '@keywords': 'keyword',
        '@typeKeywords': 'type',
        '@default': 'identifier'
      }
    }]
  ],
  operators: [
    [/@symbols/, 'operator']
  ],
  strings: [
    [/"([^"\\]|\\.)*$/, 'string.invalid'],
    [/"(?:[^"\\]|\\.)*"/, 'string']
  ],
  numbers: [
    [/\d+/, 'number']
  ]
};

export const conf = {
  wordPattern: /(-?\d*\d\w+)|([^`~!@#^&*()\-=+[\]{}\\|;:'",.<>/?]+)/g,
  keywords,
  typeKeywords,
  operators,
  symbols,
  escapes,
  tokenizer
};

export const language = {
  defaultToken: '',
  tokenPostfix: '.gaml',
  keywords,
  typeKeywords,
  operators,
  symbols,
  escapes,
  tokenizer
};
