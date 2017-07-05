const {BaseNode} = require('./base-nodes')

class SelfNode extends BaseNode {
  read(source) {
    const [next] = this
    return next === null
      ? source
      : next.read(source)
  }

  toString() {
    const [next] = this
    return next === null
      ? '&'
      : '&' + next.toString()
  }

  standardize(root) {
    const [next] = this
    return next === null
      ? null
      : next.standardize(root)
  }
}

module.exports = {
  Self: SelfNode
}
