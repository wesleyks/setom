/**
 * If the string starts and ends with quotes, remove them.
 *
 * Example:
 * '"hello"' -> 'hello'
 * `'hello"` -> `'hello"` unchanged since they are different types of quotes
 * @param str input string
 * @returns string with outer quotes stripped
 */
function stripOuterQuotes(str: string) {
  const first = str.charAt(0),
    last = str.charAt(str.length - 1);

  if (first.search(/('|")/) !== -1 && first === last) {
    return str.substr(1, str.length - 2);
  } else {
    return str;
  }
}

/**
 * Constructs the HTML string given the input tokens
 * @param tokens
 * @returns HTML string
 */
function constructHTML(tokens: string[]) {
  const innerContent: string[] = [];
  const attributes: { key: string; value: string }[] = [];
  let tag = '';
  let token = tokens.shift();

  while (token && token !== ')') {
    if (token === '(') {
      if (!tag) {
        token = tokens.shift() as string;
        tag = token;
      } else {
        tokens.unshift(token);
        innerContent.push(constructHTML(tokens));
      }
    } else if (token[0] === ':') {
      const key = token.substring(1);
      const value = stripOuterQuotes(tokens.shift() ?? '');
      attributes.push({ key, value });
    } else {
      innerContent.push(stripOuterQuotes(token));
    }
    token = tokens.shift();
  }

  return [
    `<${tag}${attributes.length ? ' ' : ''}${attributes
      .map((attr) => `${attr.key}="${attr.value}"`)
      .join(' ')}>`,
    innerContent.join(''),
    `</${tag}>`,
  ].join('');
}

/**
 * Throws if open and closing parentheses are unbalanced
 * @param tokens tokenized input to validate
 */
function validateMatchingParentheses(tokens: string[]) {
  let openCount = 0;
  for (const [index, token] of tokens.entries()) {
    if (token === '(') {
      openCount++;
    } else if (token === ')') {
      openCount--;
      if (openCount < 0) {
        throw new Error(
          `Unexpected closing parentheses: ${tokens.slice(0, index).join(' ')}`
        );
      }
    }
  }
  if (openCount !== 0) {
    throw new Error(`Missing closing parentheses: ${tokens.join(' ')}`);
  }
}

/**
 * Throws if expressions have no content
 * @param tokens tokenized input to validate
 */
function validateExpressionsNotEmpty(tokens: string[]) {
  for (const [index, token] of tokens.entries()) {
    if (index > 0) {
      const previousToken = tokens[index - 1];
      if (previousToken === '(' && token === ')') {
        throw new Error(
          `Expression contains empty content: ${tokens
            .slice(0, index)
            .join(' ')}`
        );
      }
    }
  }
}

/**
 * Converts s-expressions to html
 * @param input input s-expression to convert to html
 * @returns HTML string
 */
export function toHTML(input: string) {
  const tokens = input
    .split(/(\s|\(|\)|'[^']*'|"[^"]*")/)
    .filter(function (el) {
      return el !== '' && el !== ' ';
    });

  validateMatchingParentheses(tokens);
  validateExpressionsNotEmpty(tokens);

  return constructHTML(tokens);
}
