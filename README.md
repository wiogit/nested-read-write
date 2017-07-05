# Nested Read Write
A powerful tool to select and update properties nested deep within an object.
## Example
```JavaScript
const nrw = require('nested-read-write')
const path = nrw.parse('users[].name')
path.read({
  users: [
    {name: "Alex", age: 25},
    {name: "Sam", age: 30}
  ]
})
// returns ["Alex", "Sam"]

path.write({}, ["Alice", "Bob"])
// returns {users: [{name: "Alice"}, {name: "Bob"}]}
```
## Interface
### `nrw.parse(path)`
Creates a `Path` object from `path` string.

### `Path.prototype.read(src)`
Returns value from `src` according to `Path` object.

### `Path.prototype.write(dest, value)`
Mutates `dest` with `value` according to `Path` object, and returns mutated `dest`.

### `Path.prototype.standardize()`
Cleans up the `Path` object by removing redundant operations.
(E.g. `"&.a"` would standardize to `"a"`)

### `Path.prototype.toString()`
Rebuilds the `path` string. It should be nearly identical, but with whitespace removed.

## Quick Guide

| Operation | Read Description | Write Description |
| - | - | - |
| & | Gets **relative source** | invalid |
| .*name* | Gets *name* property | Sets *name* property |
| [*name*] | Gets *name* property | Sets *name* property |
| [*path*] | Gets value at *path* | Sets value at *path* |
| [ ] | Gets shallow array copy | Sets elements of **relative source** to elements of **value** |
| &#124; *arrayop* | Gets flattened array | invalid |
| [*begin*:*end*:*step*] | Gets slice | invalid |
| [*n<sub>1</sub>*, *n<sub>2</sub>*, *n<sub>3</sub>*] | Gets array at indices *n<sub>i</sub>* | Sets indices *n<sub>i</sub>* to **value[i]** |
| [*path<sub>1</sub>*, *path<sub>2</sub>*, *path<sub>3</sub>*] | Gets array of *path<sub>i</sub>* values | Writes **value[i]** to *path<sub>i</sub>* |
| [@] | invalid | Concatenates values to array |
| [@*n*] | invalid | Inserts values into array before index *n* |
| { } | Gets shallow object copy | Assigns entries of **value** to **relative source** |
| { *path<sub>1</sub>*, *path<sub>2</sub>*, *path<sub>3</sub>* } | Gets object containing only *path<sub>i</sub>* values | Writes *path<sub>i</sub>* value to *path<sub>i</sub>* |
| { *src<sub>1</sub>*: *dest<sub>1</sub>*, *src<sub>2</sub>*: *dest<sub>2</sub>* } | Gets new object with value at path *src<sub>i</sub>* relocated to *dest<sub>i</sub>* | Writes *src<sub>i</sub>* value to *dest<sub>i</sub>* |
## Chaining
Chaining operations can be a bit confusing. One way to understand it is through seeing how operations distribute.

| Chain | Distributed Chain |
| - | - |
| [a.b].c | [a.b.c] |
| a[b.c] | [a.b.c] |
| [a, b].c | [a.c, b.c] |
| a[b, c] | [a[c], a[b]] |
| {a: b}.c | {a.c: b} |
| a{b: c} | {a.b: c} |
## Reading `.read(source)`
An empty string will simply return the original `source` argument.
### Reference
`&` returns the relative source. For example, `"x[&]"` will return `source.x`.
### Property
Both `.x` and `[x]` can be used to get `source.x`. They can be chained together via concatenation.

`.` should only be used for valid variable names.

`[` `]` can be used for all cases, such at array indices, variable names, quoted strings, and even nested paths.

The following will all get `source.a.b.c`
```
a.b.c
[a].b.c
a[b].c
a[b.c]
```
### Array
Array operations will collect values into an array. Shallow operations on this array will have no effect on the `source` object. You can combine

Consider a case where `source = [[1,2],[3,4]]`

```
nrw.parse("").read(source).push(5)        // mutates source
nrw.parse("[]").read(source).push(5)      // doesn't mutate source
nrw.parse("[]").read(source)[0].push(5)   // mutates source
nrw.parse("[][]").read(source)[0].push(5) // doesn't mutate source
```
`|` can be used before any array operation to tell it to flatten
```
nrw.parse("|[]").read(source)  // returns [1,2,3,4]
```
`[begin:end:step]` creates a slice using logic similar to the Python slice operation.

`[1,5,2]` will return `[source[1], source[5], source[2]]`. A trailing comma is needed to force a single element sequence. For example `[0]` gets `source[0]` while `[0,]` creates `[source[0]]`.

`[a.b,x.y]` will return `[source.a.b, source.x.y]`. This also will require tailing comma to force a sequence. If you want to mix array accesses it can be done like so `[[0], length]` to get `[source[0], source.length]`.
### Object
Object operations will collect values into an object. Shallow operations on this object will have no effect on the `source` object. Mutations should function similar to arrays.

`{src: dest}` will take do `src.read()` on the relative source and then `dest.write()` the result to the current result.

`{path}` is shorthand for `{path: path}`.
```
nrw.parse('{a,b:c}').read({a:1,b:2}) // returns {a:1,c:2}
```
## Writing `.write(dest, value)`
Write operations function as you might expect once you understand read operations. There are a few caveats specific to write operations, though.

### Property
When you write to property that doesn't exist, objects/arrays will be created to ensure you write are setting the property of something other than undefined.

### Array
Array operations expect that the `value` being fed into them is an array.

`[]` will copy `value` elements into the array. If the relative destination is large, it will

`[@]` appends `value` elements to the end of the array.

`[@0]` will insert `value` elements before `0`. A negative index relative to the array length can also be given. `[@-1]` inserts before the last element

### Object
`{}` will do `Object.assign()` of `value` into the relative destination.

`{src: dest}` reads the `src` path from `value` and writes it to the `dest` path of the relative destination.

## License
MIT \([See LICENSE.md](LICENSE.md)\)
