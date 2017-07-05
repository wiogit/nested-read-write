const {BaseNode} = require('./base-nodes')
const NEXT = 0

class PropertyNode extends BaseNode {
  read(source) {
    const [next, name] = this
    if (next === null) {
      return source[name]
    }
    return next.read(source[name])
  }

  write(destination, value) {
    const [next, name] = this
    let subvalue
    if (next === null) {
      subvalue = value
    } else {
      subvalue = destination[name]
      if (!(subvalue instanceof Object)) {
        subvalue = new (next.parentConstructor())()
      }
      next.write(subvalue, value)
    }
    destination[name] = subvalue
  }

  stringNode() {
    const [next, name] = this
    return name
  }
}

class LeadingPropertyNode extends PropertyNode {
  standardize(root) {
    const [next, name] = this
    if (root) {
      return BaseNode.prototype.standardize.call(this)
    }
    const node = new DotPropertyNode(name)
    node[NEXT] = next === null
      ? null
      : next.standardize()
    return node
  }
}

class DotPropertyNode extends PropertyNode {
  stringNode() {
    const [next, name] = this
    return '.' + name
  }

  standardize(root) {
    const [next, name] = this
    if (!root) {
      return BaseNode.prototype.standardize.call(this)
    }
    const node = new LeadingPropertyNode(name)
    node[NEXT] = next === null
      ? null
      : next.standardize()
    return node
  }
}

class IndexPropertyNode extends PropertyNode {
  stringNode() {
    const [next, name] = this
    return '[' + name + ']'
  }
}

class SingleQuotePropertyNode extends PropertyNode {
  stringNode() {
    const [next, name] = this
    return  `['${name}']`
  }
}

class DoubleQuotePropertyNode extends PropertyNode {
  stringNode() {
    const [next, name] = this
    return  `["${name}"]`
  }
}

class DeepPropertyNode extends BaseNode {
  read(source) {
    const [next, chain] = this
    const deepsource = chain.read(source)
    if (next === null) {
      return deepsource
    }
    return next.read(deepsource)
  }

  write(destination, value) {
    const [next, chain] = this
    let subvalue
    if (next === null) {
      subvalue = value
    } else {
      try {
        subvalue = chain.read(destination)
      } catch(e) {}
      if (!(subvalue instanceof Object)) {
        subvalue = new (next.parentConstructor())()
      }
      next.write(subvalue, value)
    }
    chain.write(destination, subvalue)
  }

  stringNode() {
    const [next, chain] = this
    return '[' + chain.toString() + ']'
  }

  standardize(root) {
    const [next, chain] = this
    const standardChain = chain.standardize(root)
    if (standardChain === null) {
      return next === null
        ? null
        : next.standardize(root)
    }
    if (next !== null) {
      const standardNext = next.standardize()
      let last = standardChain
      while (last[NEXT] != null) {
        last = last[NEXT]
      }
      last[NEXT] = standardNext
    }
    return standardChain
  }
}

module.exports = {
  LeadingProperty: LeadingPropertyNode,
  DotProperty: DotPropertyNode,
  IndexProperty: IndexPropertyNode,
  SingleQuoteProperty: SingleQuotePropertyNode,
  DoubleQuoteProperty: DoubleQuotePropertyNode,
  DeepProperty: DeepPropertyNode
}
