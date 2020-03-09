/**
 * 专门负责解析模板
 */
class Compile {
  constructor(el, vm) {
    // el: new vue传递的选择器
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    // vm: new的vue实例
    this.vm = vm

    // 编译模板
    if (this.el) {
      // 1. 把el中所有的子节点都放入到内存中，fragment
      let fragment = this.node2fragment(this.el)
      // 2. 在内存中编译fragment
      this.compile(fragment)
      // 3. 把fragment一次性地添加到页面
      this.el.appendChild(fragment)
    }
  }

  /** 核心方法 */
  node2fragment(node) {
    let fragment = document.createDocumentFragment()
    // let fragment = new DocumentFragment()
    // 把el中所有的子节点挨个添加到文档碎片中
    let childNodes = node.childNodes // NodeList
    this.toArray(childNodes).forEach(node => {
      // 把所有的子节点添加到fragment中
      fragment.appendChild(node)
    })
    return fragment
  }

  /**
   * 编译文档碎片（内存中）
   * @param {*} frament 
   */
  compile(fragment) {
    let childNodes = fragment.childNodes
    this.toArray(childNodes).forEach(node => {
      // 编译子节点
      // 如果是元素，需要解析指令
      if (this.isElementNode(node)) {
        this.compileElement(node)
      }
      // 如果是文本节点，需要解析插值表达式
      if (this.isTextNode(node)) {
        this.compileText(node)
      }

      // 如果当前节点还有子节点，需要递归地解析
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }

  // 解析html标签
  compileElement (node) {
    // console.log(node)
    // 1. 获取到当前节点下所有的属性
    let attributes = node.attributes
    this.toArray(attributes).forEach(attr => {
      // 2. 解析vue的指令（所有以v-开头的属性）
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        let type = attrName.slice(2)
        let expr = attr.value

        // 解析v-on指令
        if (this.isEventDirective(type)) {
          // 给当前元素注册事件即可
          CompileUtil['eventHandler'](node, this.vm, type, expr)
        } else {
          // 如果存在，再调用
          CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
        }
      }
    })
  }

  // 解析文本节点
  compileText (node) {
    // console.log('需要解析文本')
    CompileUtil.mustache(node, this.vm)
  }

  /** 工具方法 */
  toArray (likeArray) {
    return [].slice.call(likeArray)
  }
  isElementNode (node) {
    // nodeType: 节点的类型 1：元素节点 3：文本节点
    return node.nodeType === 1
  }
  isTextNode (node) {
    return node.nodeType === 3
  }
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  isEventDirective(attrName) {
    return attrName.split(':')[0] === 'on'
  }
}

let CompileUtil = {
  mustache (node, vm) {
    let txt = node.textContent
    let reg = /\{\{(.+)\}\}/
    if (reg.test(txt)) {
      // 开始和结束可能有空格
      let expr = RegExp.$1.trim()
      // node.textContent = txt.replace(reg, this.vm.$data[expr])
      node.textContent = txt.replace(reg, this.getVMValue(vm, expr))
    }
  },
  // 处理v-text指令
  text(node, vm, expr) {
    node.textContent = this.getVMValue(vm, expr)
  },
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(vm, expr)
  },
  model(node, vm, expr) {
    node.value = this.getVMValue(vm, expr)
  },
  eventHandler(node, vm, type, expr) {
    let eventType = type.split(':')[1]
    let fn = vm.$methods && vm.$methods[expr]
    if (eventType && fn) {
      // 注意：给node注册事件，this默认会绑定到node上，使用bind修改this指向
      node.addEventListener(eventType, fn.bind(vm))
    }
  },
  // 用于获取VM中的数据
  getVMValue (vm, expr) {
    // 获取data中的数据
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  }
}