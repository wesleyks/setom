# setom

[![CI](https://github.com/wesleyks/setom/actions/workflows/ci.yml/badge.svg)](https://github.com/wesleyks/setom/actions/workflows/ci.yml)

S-Expression to Markup

Requires Node.js 22 or later. The package supports both native ESM and CommonJS.

## Usage

### Native ESM

```js
import { toHTML } from 'setom';
toHTML('(a)');
```

### CommonJS

```js
const { toHTML } = require('setom');
toHTML('(a)');
```

### Basic

```html
<a></a>
```

### Nested

```js
toHTML('(div (a))');
```

```html
<div><a></a></div>
```

### Nested with Multiple Children

```js
toHTML('(div (a) (a))');
```

```html
<div><a></a><a></a></div>
```

### Text Content

```js
toHTML('(p a)');
```

```html
<p>a</p>
```

or

```js
toHTML('(p "banana")');
```

```html
<p>banana</p>
```

or

```js
toHTML('(p "ban" "ana")');
```

```html
<p>banana</p>
```

### Attributes

```js
toHTML('(a :href "github.com")');
```

```html
<a href="github.com"></a>
```

### Boolean Attributes

```js
toHTML('(input id:"5" :readonly :checked :type "checkbox")');
```

```html
<input id="5" readonly checked type="checkbox"></input>
```
