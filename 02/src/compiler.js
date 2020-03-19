/**
 * compiler用于模板解析
 */
class Compiler {
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm

    // 编译模板
    if(this.el) {
      // 1. 把el的所有子节点放到fragment中
      let fragment = this.node2fragment(this.el)
      console.log(fragment)
      // 2. 在内存中编译fragment
      this.compile(fragment)
      // 3. 把fragment一次性添加到页面
      this.el.appendChild(fragment)
    }
  }

  // 核心方法
  node2fragment(node) {
    let fragment = new DocumentFragment()
    let childNodes = node.childNodes
    this.toArray(childNodes).forEach(node => {
      fragment.appendChild(node)
    })
    return fragment
  }

  // 编译fragment
  compile(fragment) {
    let childNodes = fragment.childNodes
    this.toArray(childNodes).forEach(node => {
      // 编译子节点：元素，指令
      if (this.isElementNode(node)) {
        this.compileElement(node)
      }
      if (this.isTextNode(node)) {
        this.compileText(node)
      }
      // 如果还有子节点，递归
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }

  compileElement(node) {
    // v-text、v-html、v-model、v-on:click
    // 获取当前节点的所有属性，过滤v-属性
    let attributes = node.attributes
    this.toArray(attributes).forEach(attr => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        let type = attrName.slice(2)
        let expr = attr.value
        CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
        if (this.isEventDirective(type)) {
          CompileUtil['eventHandler'](node, this.vm, type, expr)
        }
      }
    })
  }

  compileText(node) {
    // 插值表达式
  }

  /**
   * 工具方法
   */
  toArray(likeArray) {
    return [].slice.apply(likeArray)
  }
  isElementNode(node) {
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  isEventDirective(type) {
    // on:click
    return type.split(':')[0] === 'on'
  }
}

let CompileUtil = {
  text(node, vm, expr) {
    node.textContent = this.getVMValue(vm, expr)
  },
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(vm, expr)
  },
  model(node, vm, expr) {
    let that = this
    node.value = this.getVMValue(vm, expr)
    // 实现双向绑定，给node注册input事件，当value发生改变时，修改对应的数据
    node.addEventListener('input', function() {
      // 给node注册事件时，this指向的是node
      that.setVMValue(vm, expr, this.value)
    })
  },
  eventHandler(node, vm, type, expr) {
    let eventType = type.split(':')[1]
    let fn = vm.$methods && vm.$methods[expr]
    if (eventType && fn) {
      // 给node注册事件，this指向的是node，需要使用bind修改this指向，返回一个新的函数
      node.addEventListener(eventType, fn.bind(vm))
    }
  },
  // 获取VM中的数据
  getVMValue(vm, expr) {
    // car[color]
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  },
  setVMValue(vm, expr, value) {
    let data = vm.$data
    // data[car][color]
    expr.split('.').forEach((c, i, a) => {
      if (i < a.length - 1) {
        data = data[c]
      } else {
        data[c] = value
      }
    })
  }
}