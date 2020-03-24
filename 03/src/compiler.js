/**
 * 用来编译模板
 */
class Compiler {
  // 传递选择器、实例
  constructor(el, vm) {
    this.el = el
    this.vm = vm

    // 1.把el下所有子节点保存到文档碎片中
    let fragment = this.node2fragment(this.el)
    // 2. 编译文档碎片，识别vue指令
    this.compile(fragment)
    // 3.把文档碎片插入到el下
    this.el.appendChild(fragment)
  }

  /**
   * 核心方法
   */
  node2fragment(node) {
    let childNodes = node.childNodes
    let fragment = new DocumentFragment()
    this.toArray(childNodes).forEach(node => {
      fragment.appendChild(node)
    })
    return fragment
  }

  // 编译模板
  compile(fragment) {
    let childNodes = fragment.childNodes
    // 文本节点、元素节点
    this.toArray(childNodes).forEach(node => {
      if (this.isElementNode(node)) { // 元素节点
        this.compileElement(node)
      }
      if (this.isTextNode(node)) {
        this.compileText(node)
      }

      // 如果节点有子节点，则递归
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }

  compileElement(node) {
    // 获取当前节点的所有属性， 解析vue指令
    let attributes = node.attributes
    this.toArray(attributes).forEach(attr => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        let type = attrName.slice(2)
        let expr = attr.value
        // 是否是事件指令
        if (this.isEventDirective(type)) {
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
   * 工具方法
   */
  toArray(node) {
    return [].slice.call(node)
  }
  isElementNode(node) { // 元素节点
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isDirective(attr) {
    return attr.startsWith('v-')
  }
  isEventDirective(attr) {
    return attr.split(':')[0] === 'on'
  }

}

let CompileUtil = {
  mustache(node, vm) {
    let text = node.textContent
    let reg = /\{\{(.+)\}\}/
    if (reg.test(text)) {
      let expr = RegExp.$1
      node.textContent = text.replace(reg, this.getVMValue(vm, expr))
      // 添加watcher
      new Watcher(vm, expr, function(newValue) {
        node.textContent = newValue
      })
    }
  },
  text(node, vm, expr) {
    node.textContent = this.getVMValue(vm, expr)
    // 添加watcher
    new Watcher(vm, expr, function(newValue) {
      node.textContent = newValue
    })
  },
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(vm, expr)
    // 添加watcher
    new Watcher(vm, expr, function(newValue) {
      node.innerHTML = newValue
    })
  },
  model(node, vm, expr) {
    let that = this
    node.value = this.getVMValue(vm, expr)
    // 双向绑定
    node.addEventListener('input', function(e) {
      // vm.$data.expr = this.value
      // e.target.value
      that.setVMValue(vm, expr, this.value) 
    })

    // 添加watcher
    new Watcher(vm, expr, function(newValue) {
      node.value = newValue
    })
  },
  eventHandler(node, vm, type, expr) {
    let eventType = type.split(':')[1]
    let fn = vm.$methods[expr]
    if (eventType && fn) {
      // 修改this指向，指向vue实例
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