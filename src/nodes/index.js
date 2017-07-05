const prefixes = ['helper', 'reference', 'property', 'array', 'object']
Object.assign(module.exports, ...prefixes.map(x => require(`./${x}-nodes`)))
