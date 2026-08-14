import assert from 'node:assert/strict';
import { test } from 'node:test';

import { toHTML } from './setom';

test('it should parse basic elements', () => {
  assert.equal(toHTML('(a)'), '<a></a>');
  assert.equal(toHTML('(a b)'), '<a>b</a>');
  assert.equal(toHTML('(a (b))'), '<a><b></b></a>');
  assert.equal(toHTML('(a (b c))'), '<a><b>c</b></a>');
});

test('it should parse elements with declared attributes', () => {
  assert.equal(toHTML('(a :b c)'), '<a b="c"></a>');
  assert.equal(toHTML('(a :b "")'), '<a b=""></a>');
  assert.equal(toHTML('(a :b c (d))'), '<a b="c"><d></d></a>');
  assert.equal(toHTML('(a (b) :c d)'), '<a c="d"><b></b></a>');
});

test('it should parse boolean and inline declared attributes', () => {
  assert.equal(
    toHTML('(input id:"5" :readonly :checked :type "checkbox")'),
    '<input id="5" readonly checked type="checkbox"></input>',
  );
  assert.equal(toHTML('(input :disabled)'), '<input disabled></input>');
});

test('it should parse escaped single and double quotes', () => {
  assert.equal(toHTML("(a '(')"), '<a>(</a>');
  assert.equal(toHTML('(a "(")'), '<a>(</a>');
  assert.equal(toHTML("(a 'b c')"), '<a>b c</a>');
  assert.equal(toHTML("(a (b 'c d'))"), '<a><b>c d</b></a>');
  assert.equal(toHTML("(a 'b c' ' d')"), '<a>b c d</a>');
});

test('it should parse complex expressions', () => {
  assert.equal(
    toHTML("(a 'b' (c d :e 'f g' h :i j) 'k l')"),
    '<a>b<c e="f g" i="j">dh</c>k l</a>',
  );
});

test('it should throw an error for unbalanced parentheses', () => {
  assert.throws(() => {
    toHTML('(()');
  }, /Missing closing parentheses/);

  assert.throws(() => {
    toHTML('())');
  }, /Unexpected closing parentheses/);
});

test('it should throw an error for invalid tag constructor', () => {
  assert.throws(() => {
    toHTML('()');
  }, /Expression contains empty content/);
});
