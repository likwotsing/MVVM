/**
 * 负责解析模板
 */
class Compiler {
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm

    // 编译模板
    if(this.el) {
      // 1. 把el中所有的子节点都放到内存中，fragment
      let fragment = this.node2fragment(this.el)
      // console.dir(fragment)
      // 2. 在内存中编译fragment
      this.compile(fragment)
      // 3. 把fragment一次性地添加到页面
      this.el.appendChild(fragment)
    }
  }

  // 核心方法
  node2fragment(node) {
    let fragment = new DocumentFragment()
    // 把el中所有的子节点挨个添加到文档碎片中
    let childNodes = node.childNodes // NodeList
    this.toArray(childNodes).forEach(node => {
      fragment.appendChild(node)
    })
    return fragment
  }

  compile(fragment) {
    let childNodes = fragment.childNodes
    this.toArray(childNodes).forEach(node => {
      // 编译子节点
      // 如果是元素，需要解析v-指令
      if(this.isElementNode(node)) {
        this.compileElement(node)
      }
      // 如果是文本，需要解析插值表达式
      if(this.isTextNode(node)) {
        this.compileText(node)
      }
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }

  // 解析html标签
  compileElement(node) {
    // 获取当前节点下的所有属性
    let attributes = node.attributes
    // 解析vue的指令(以v-开头的属性)
    this.toArray(attributes).forEach(attr => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        let type = attrName.slice(2)
        let expr = attr.value
        // 解析v-on指令
        if (this.isEventDirective(type)) {
          CompileUtil['eventHanler'](node, this.vm, type, expr)
        } else {
          CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
        }
      }
    })
  }

  // 解析文本节点
  compileText(node) {
    CompileUtil.mustache(node, this.vm)
  }

  // 工具方法
  toArray(likeArray) {
    return [].slice.call(likeArray)
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
  isEventDirective(attrName) {
    return attrName.split(':')[0] === 'on'
  }
}

CompileUtil = {
  // 处理插值表达式
  mustache(node, vm) {
    let txt = node.textContent
    let reg = /\{\{(.+)\}\}/g
    if(reg.test(txt)){
      let expr = RegExp.$1
      node.textContent = txt.replace(reg, this.getVMValue(vm, expr))
      new Watcher(vm, expr, newValue => {
        node.textContent = newValue
      })
    }
  },
  // 处理v-text指令
  text(node, vm, expr) {
    node.textContent = this.getVMValue(vm, expr)
    new Watcher(vm, expr, newValue => {
      node.textContent = newValue
    })
  },
  // 处理v-html指令
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(vm, expr)
    new Watcher(vm, expr, newValue => {
      node.innerHTML = newValue
    })
  },
  model(node, vm, expr) {
    const self = this
    node.value = this.getVMValue(vm, expr)
    // 实现数据双向绑定，给node注册input事件，当当前元素的value发生改变时，修改对应的数据
    node.addEventListener('input', function() {
      self.setVMValue(vm, expr, this.value)
    })

    // window.watcher = new Watcher(vm, expr, function(newValue) {
    //   node.value = newValue
    // })

    new Watcher(vm, expr, newValue => {
      node.value = newValue
    })
  },
  eventHanler(node, vm, type, expr) {
    let eventType = type.split(':')[1]
    let fn = vm.$methods && vm.$methods[expr]
    if (eventType && fn) {
      // 给node添加事件，this会绑定到node上，使用bind修改this指向
      node.addEventListener(eventType, fn.bind(vm))
    }
  },
  // 用于获取VM中的数据
  getVMValue(vm, expr) {
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  },
  setVMValue(vm, expr, value) {
    let data = vm.$data
    expr.split('.').forEach((item, index, arr) => {
      // 可能是复杂对象，需要使用点分隔处理
      if (index < arr.length - 1) {
        data = data[item]
      } else {
        data[item] = value
      }
    })
  }
}