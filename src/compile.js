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
      console.log(fragment)
      // 2. 在内存中编译fragment

      // 3. 把fragment一次性地添加到页面
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

  /** 工具方法 */
  toArray (likeArray) {
    return [].slice.call(likeArray)
  }
}