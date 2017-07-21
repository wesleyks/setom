setom
=====
[![Build Status](https://travis-ci.org/wesleyks/setom.svg?branch=master)](https://travis-ci.org/wesleyks/setom)

S-Expression to Markup library

## Usage

### Basic
```js
setom.parse('(a)')
```
```html
<a></a>
```

### Nested
```js
setom.parse('(div (a))')
```
```html
<div><a></a></div>
```

### Nested with Multiple Children
```js
setom.parse('(div (a) (a))')
```
```html
<div><a></a><a></a></div>
```

### Text Content
```js
setom.parse('(p a)')
```
```html
<p>a</p>
```

or

```js
setom.parse('(p "banana")')
```
```html
<p>banana</p>
```

or

```js
setom.parse('(p "ban" "ana")')
```
```html
<p>banana</p>
```

### Attributes
```js
setom.parse('(a :href "github.com")')
```
```html
<a href='github.com'></a>
```