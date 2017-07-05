const NEXT = 0
const FLATTEN = 1

class BaseNode extends Array {
  constructor(...args) {
    super(null, ...args)
    this.safe = false
  }

  parentConstructor() {
    return Object
  }

  toString() {
    const [next] = this
    return next === null
      ? this.stringNode()
      : this.stringNode() + next.toString()
  }

  standardize() {
    const [next, ...args] = this
    const Node = this.constructor
    const node = new Node(...args)
    node[NEXT] = next === null
      ? null
      : next.standardize()
    return node
  }
}

class BaseArrayNode extends BaseNode {
  constructor(...args) {
    super(...args)
    this.flatten = false
  }

  flat(flatten = true) {
    this.flatten = flatten
    return this
  }

  parentConstructor() {
    return Array
  }

  toString() {
    const [next] = this
    return this.flatten
      ? '|' + BaseNode.prototype.toString.call(this)
      : BaseNode.prototype.toString.call(this)
  }

  standardize() {
    const [next, ...args] = this
    const Node = this.constructor
    const node = new Node(...args)
    node[NEXT] = next === null
      ? null
      : next.standardize()
    return node.flat(this.flatten)
  }
}

module.exports = {BaseNode, BaseArrayNode}
