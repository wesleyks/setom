import test from 'ava';

import { toHTML } from './setom';

test('it should parse basic elements', (t) => {
  t.is(toHTML('(a)'), '<a></a>');
  t.is(toHTML('(a b)'), '<a>b</a>');
  t.is(toHTML('(a (b))'), '<a><b></b></a>');
  t.is(toHTML('(a (b c))'), '<a><b>c</b></a>');
});

test('it should parse elements with declared attributes', (t) => {
  t.is(toHTML('(a :b c)'), '<a b="c"></a>');
  t.is(toHTML('(a :b "")'), '<a b=""></a>');
  t.is(toHTML('(a :b c (d))'), '<a b="c"><d></d></a>');
  t.is(toHTML('(a (b) :c d)'), '<a c="d"><b></b></a>');
});

test('it should parse escaped single and double quotes', (t) => {
  t.is(toHTML("(a '(')"), '<a>(</a>');
  t.is(toHTML('(a "(")'), '<a>(</a>');
  t.is(toHTML("(a 'b c')"), '<a>b c</a>');
  t.is(toHTML("(a (b 'c d'))"), '<a><b>c d</b></a>');
  t.is(toHTML("(a 'b c' ' d')"), '<a>b c d</a>');
});

test('it should parse complex expressions', (t) => {
  t.is(
    toHTML("(a 'b' (c d :e 'f g' h :i j) 'k l')"),
    '<a>b<c e="f g" i="j">dh</c>k l</a>'
  );
});

test('it should throw an error for unbalanced parentheses', (t) => {
  const error = t.throws(() => {
    toHTML('(()');
  });

  t.regex(error.message, /Missing closing parentheses/);

  const error2 = t.throws(() => {
    toHTML('())');
  });

  t.regex(error2.message, /Unexpected closing parentheses/);
});

test('it should throw an error for invalid tag constructor', (t) => {
  const error = t.throws(() => {
    toHTML('()');
  });

  t.regex(error.message, /Expression contains empty content/);
});
