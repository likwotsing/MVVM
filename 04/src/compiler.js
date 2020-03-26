/**
 * compiler用来编译模板，指令解析
 */
class Compiler {
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm

    // 1. 把el下所有的子节点放到文档碎片中
    let fragment = this.node2fragment(this.el)
    // 2. 编译文档碎片
    this.compile(fragment)
    // 3. 把文档碎片插入到el元素下
    this.el.appendChild(fragment)
  }

  /**
   * 核心函数
   */
  node2fragment(node) {
    let fragment = new DocumentFragment()
    let childNodes = node.childNodes
    Array.from(childNodes).forEach(node => {
      fragment.appendChild(node)
    })
    return fragment
  }

  compile(fragment) {
    let childNodes = fragment.childNodes
    Array.from(childNodes).forEach(node => {
      // 判断节点是文本节点，还是元素节点
      if (this.isElementNode(node)) {
        this.compileElement(node)
      }
      if (this.isTextNode(node)) {
        this.compileText(node)
      }
      // 如果存在子节点，递归
      if (node.children) {
        this.compile(node)
      }
    })
  }

  compileElement(node) {
    // 判断是否是vue指令
    let attributes = node.attributes
    Array.from(attributes).forEach(attr => {
      let attrName = attr.name
      // 判断是否是vue指令
      if (this.isDirective(attrName)) {
        // v-on:click
        let type = attrName.slice(2)
        let expr = attr.value
        if (this.isEventDirective(attrName)) {
          CompileUtil['eventHandler'](node, this.vm, type, expr)
        } else {
          CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
        }
      }
    })
  }

  compileText(node) {
    CompileUtil.mustache(node, this.vm)
  }

  /**
   * 工具函数
   */
  isElementNode(node) {
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isDirective(attrName) { // v-text
    return attrName.indexOf('v-') === 0
  }
  isEventDirective(attrName) {
    return attrName.indexOf('v-on') === 0
  }
}

let CompileUtil = {
  mustache(node, vm) {
    let text = node.textContent
    let reg = /\{\{(.+)\}\}/
    if (reg.test(text)) {
      let expr = RegExp.$1
      node.textContent = text.replace(reg, this.getVMValue(vm, expr))
      new Watcher(expr, vm, newValue => {
        node.textContent = newValue
      })
    }
  },
  text(node, vm, expr) {
    node.textContent = this.getVMValue(vm, expr)

    new Watcher(expr, vm, newValue => {
      node.textContent = newValue
    })
  },
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(vm, expr)
    new Watcher(expr, vm, newValue => {
      node.innerHTML = newValue
    })
  },
  model(node, vm, expr) {
    const that = this
    node.value = this.getVMValue(vm, expr)
    // 双向绑定
    node.addEventListener('input', function(e) {
      // this.setVMValue(node, vm, expr, this.value)
      that.setVMValue(vm, expr, e.target.value)
    })
    new Watcher(expr, vm, newValue => {
      node.value = newValue
    })
  },
  eventHandler(node, vm, type, expr) {
    // type: on:click
    let eventType = type.split(':')[1]
    let fn = vm.$methods[expr]
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm))
    }
  },
  getVMValue(vm, expr) {
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  },
  setVMValue(vm, expr, value) {
    let data = vm.$data
    expr.split('.').forEach((c, i, a) => {
      if (i < a.length - 1) {
        data = data[c]
      } else {
        data[c] = value
      }
    })
  }
}