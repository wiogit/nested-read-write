const jison = require('jison')
const grammar = require('./grammar')
const parser = new jison.Parser(grammar)
const nodes = require('./nodes')

parser.yy.nodes = nodes
parser.yy.r = []
parser.yy.w = []

module.exports = parser
