class Compiler {
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm

    // 获取el下所有子节点，保存到文档碎片中
    let fragment = this.node2fragment(this.el)
    console.dir(fragment)
    // 编译
    this.compile(fragment)
    // 添加到el下
    this.el.appendChild(fragment)
  }

  // 核心方法
  node2fragment(node) {
    let childNodes = node.childNodes
    let fragment = new DocumentFragment()
    Array.from(childNodes).forEach(node => {
      fragment.appendChild(node)
    })
    return fragment
  }

  compile(fragment) {
    let childNodes = fragment.childNodes
    Array.from(childNodes).forEach(node => {
      // 判断node是文本节点，还是元素节点，进行编译
      if (this.isElementNode(node)) {
        this.compileElementNode(node)
      }
      if (this.isTextNode(node)) {
        this.compileTextNode(node)
      }
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }

  compileElementNode(node) {
    // 获取所有属性，找到vue指令，解析
    let attrs = node.attributes
    Array.from(attrs).forEach(attr => {
      // 是否是vue指令
      let attrName = attr.name
      let expr = attr.value
      if (this.isDirective(attrName)) {
        let type = attrName.slice(2)
        // 是否是事件
        if (this.isEventDirective(attrName)) {
          CompileUtil['eventHandler'](node, this.vm, type, expr)
        } else {
          CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
        }
      }
    })
  }

  compileTextNode(node) {
    CompileUtil['mustache'](node, this.vm)
  }

  // 工具方法
  isElementNode(node) {
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isDirective(attrName) {
    return attrName.slice(0, 2) === 'v-'
  }
  isEventDirective(attrName) {
    return attrName.indexOf('v-on') === 0
  }
}

let CompileUtil = {
  mustache(node, vm) {
    let reg = /\{\{(.+)\}\}/
    let text = node.textContent
    if (reg.test(text)) {
      let expr = RegExp.$1
      node.textContent = text.replace(reg, this.getVMValue(vm, expr))
    }
  },
  text(node, vm, expr) {
    node.textContent = this.getVMValue(vm, expr)
  },
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(vm, expr)
  },
  model(node, vm, expr) {
    const that = this
    node.value = this.getVMValue(vm, expr)
    // 实现双向绑定
    node.addEventListener('input', function() {
      that.setVMValue(vm, expr, this.value)
    })
  },
  eventHandler(node, vm, type, expr) {
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
    expr.split('.').forEach((key, i, arr) => {
      if (i < arr.length -1) {
        data = data[key]
      } else {
        data[key] = value
      }
    })
  }
}