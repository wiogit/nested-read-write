const {BaseArrayNode} = require('./base-nodes')

const sliceArray = require('../slice-array')

function shiftArray(array, start, shift) {
  for (let i = array.length - 1; i >= start; i--) {
    array[i + shift] = array[i]
  }
}

function flattenArray(array) {
  return Array.prototype.concat(...array)
}


class ArrayNode extends BaseArrayNode {
  read(source) {
    const [next] = this
    if (next === null) {
      const result = source.map(x => x)
      return this.flatten
        ? flattenArray(result)
        : result
    }
    const result = source.map(x => next.read(x))
    return this.flatten
      ? flattenArray(result)
      : result
  }

  write(destination, value) {
    const [next] = this
    if (next === null) {
      value.forEach((subvalue, index) => destination[index] = subvalue)
      return
    }
    value.forEach((subvalue, index) => {
      if (!(index in destination)) {
        destination[index] = new (next.propertyConstructor())()
      }
      next.write(destination[index], subvalue)
    })
  }

  stringNode() {
    return '[]'
  }
}

class SliceNode extends BaseArrayNode {
  read(source) {
    const [next, [[begin, end], step]] = this
    const slice = sliceArray(source, begin, end, step)
    if (next === null) {
      return this.flatten
        ? flattenArray(slice)
        : slice
    }
    const result = slice(source).map(subsource => next.read(subsource))
    return this.flatten
      ? flattenArray(result)
      : result
  }

  stringNode() {
    const [next, [[begin, end], step]] = this
    const inside = [begin, end]
      .map(x => x === null ? '' : '' + x)
      .join(':')
    return '[' + inside + ']'
  }
}

class StepSliceNode extends SliceNode {
  stringNode() {
    const [next, [[begin, end], step]] = this
    const inside = [begin, end, step]
      .map(x => x === null ? '' : '' + x)
      .join(':')
    return '[' + inside + ']'
  }
}

class IndexedArrayNode extends BaseArrayNode {
  read(source, value) {
    const [next, indices] = this
    if (next === null) {
      const result = indices.map(index => source[index])
      return this.flatten
        ? flattenArray(result)
        : result
    }
    const result = indices.map(index => next.read(source[index]))
    return this.flatten
      ? flattenArray(result)
      : result
  }

  write(destination, value) {
    const [next, indices] = this
    let i = 0
    if (next === null) {
      let i = 0
      for (let index of indices) {
        if (!(i < value.length)) break
        destination[index] = value[i++]
      }
      return
    }
    for (let index of indices) {
      if (!(i < value.length)) break
      next.write(destination[index], value[i++])
    }
  }

  stringNode() {
    const [next, indices] = this
    return '[' + indices.join(',') + ']'
  }
}

class AppendNode extends BaseArrayNode {
  write(destination, value) {
    const [next] = this
    if (next === null) {
      for (let subvalue of value) {
        destination.push(subvalue)
      }
      return
    }
    for (let subvalue of value) {
      let subdestination = new (next.propertyConstructor())()
      next.write(subdestination, subvalue)
      destination.push(subdestination)
    }
  }

  stringNode() {
    return '[@]'
  }
}

class InsertNode extends BaseArrayNode {
  write(destination, value) {
    const [next, index] = this
    const position = index < 0
      ? destination.length + index
      : index
    shiftArray(destination, position, value.length)
    if (next === null) {
      value.forEach((subvalue, index) =>
        destination[position + index] = subvalue)
      return
    }
    value.forEach((subvalue, index) => {
      const subposition = position + index
      if (!(subposition in destination)) {
        destination[subposition] = new (next.propertyConstructor())()
      }
      next.write(destination[subposition], subvalue)
    })
  }

  stringNode() {
    const [next, position] = this
    return '[@' + position + ']'
  }
}

class DeepArrayNode extends BaseArrayNode {
  read(source) {
    const [next, chains] = this
    if (next === null) {
      const result = chains.map(chain => chain.read(source))
      return this.flatten
        ? flattenArray(result)
        : result
    }
    const result = chains.map(chain => next.read(chain.read(source)))
    return this.flatten
      ? flattenArray(result)
      : result
  }

  write(destination, value) {
    const [next, chains] = this
    let i = 0
    if (next === null) {
      for (let chain of chains) {
        if (!(i < value.length)) break
        chain.write(destination, value[i++])
      }
      return
    }
    for (let chain of chains) {
      if (!(i < value.length)) break
      next.write(chain.read(destination), value[i++])
    }
  }

  stringNode() {
    const [next, chains] = this
    const inside = chains.map(x => x.toString()).join(',')
    return '[' + inside + ']'
  }
}

module.exports = {
  Array: ArrayNode,
  Slice: SliceNode,
  StepSlice: StepSliceNode,
  IndexedArray: IndexedArrayNode,
  Append: AppendNode,
  Insert: InsertNode,
  DeepArray: DeepArrayNode
}
