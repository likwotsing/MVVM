/**
 * 负责编译模板
 */
class Compiler {
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm

    // 编译节点
    // 把el下所有子元素添加到文档碎片中
    let fragment = this.node2fragment(this.el)
    // 编译文档文档碎片
    this.compile(fragment)
    // 把文档碎片插入到el下
    this.el.appendChild(fragment)
  }

  /**
   * 核心方法
   */
  // 把node节点转换成文档碎片
  node2fragment(node) {
    let chlidNodes = node.childNodes
    let fragment = new DocumentFragment()
    Array.from(chlidNodes).forEach(node => {
      fragment.appendChild(node)
    })
    return fragment
  }

  
  compile(fragment) {
    let childNodes = fragment.childNodes
    Array.from(childNodes).forEach(node => {
      // 元素节点、文本节点
      if (this.isElementNode(node)) {
        this.compileElement(node)
      }
      if (this.isTextNode(node)) {
        this.compileText(node)
      }

      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }

  compileElement(node) {
    let attributes = node.attributes
    Array.from(attributes).forEach(attr => {
      let attrName = attr.name
      // 判断是否是vue指令
      if (this.isDirective(attrName)) {
        // v-text msg
        let type = attrName.slice(2)
        let expr = attr.value
        if (this.isEventDirective(attrName)) {
          ComplieUtil['eventHandler'](node, this.vm, type, expr)
        } else {
          ComplieUtil[type] && ComplieUtil[type](node, this.vm, expr)
        }
      }
    })

  }

  compileText(node) {
    // 解析差值表达式
    ComplieUtil['mustache'](node, this.vm)
  }

  // 工具方法
  isElementNode(node) {
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isDirective(attrName) {
    // v-text
    return attrName.indexOf('v-') === 0
  }
  isEventDirective(attrName) {
    // v-on:click
    return attrName.split(':')[0] === 'v-on'
  }
}

let ComplieUtil = {
  mustache(node, vm) {
    // {{msg}}
    let reg = /\{\{(.+)\}\}/
    let text = node.textContent
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
    // 添加双向绑定
    node.addEventListener('input', function() {
      that.setVMValue(vm, expr, this.value)
    })
    new Watcher(expr, vm, newValue => {
      node.value = newValue
    })

    // window.watcher = new Watcher(expr, vm, newValue => {
    //   node.value = newValue
    // })
  },
  eventHandler(node, vm, type, expr) {
    // v-on:click
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
    expr.split('.').forEach((key, i, a) => {
      if (i < a.length - 1) {
        data = data[key]
      } else {
        data[key] = value
      }
    })
  }
}