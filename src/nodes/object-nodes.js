const {BaseNode} = require('./base-nodes')

class ObjectNode extends BaseNode {
  read(source) {
    const [next] = this
    const subsource = {}
    if (next === null) {
      return Object.assign(subsource, source)
    }
    for (let key of Object.keys(source)) {
      subsource[key] = next.read(source[key])
    }
    return subsource
  }

  write(destination, value) {
    const [next] = this
    const subdestination = {}
    if (next === null) {
      Object.assign(destination, value)
      return
    }
    for (let key of Object.keys(value)) {
      next.write(destination[key], value[key])
    }
    return
  }

  stringNode() {
    const [next] = this
    return '{}'
  }
}

class DeepObjectNode extends BaseNode {
  read(source) {
    const [next, assignments] = this
    let subsource = {}
    if (next === null) {
      for (let [src, dest] of assignments) {
        dest.write(subsource, src.read(source))
      }
      return subsource
    }
    for (let [src, dest] of assignments) {
      dest.write(subsource, next.read(src.read(source)))
    }
    return subsource
  }

  write(destination, value) {
    const [next, assignments] = this
    if (next === null) {
      for (let [src, dest] of assignments) {
        dest.write(destination, src.read(value))
      }
      return
    }
    for (let [src, dest] of assignments) {
      dest.write(destination, next.read(src.read(value)))
    }
    return
  }

  stringNode() {
    const [next, assignments] = this
    const inside = assignments
      .map(([src, dest]) => src === dest
        ? src.toString()
        : src.toString() + ':' + dest.toString())
      .join(',')
    return '{' + inside + '}'
  }
}

module.exports = {
  Object: ObjectNode,
  DeepObject: DeepObjectNode
}
