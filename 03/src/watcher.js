/**
 * wather模块负责把compiler和observer模块关联起来
 */
class Watcher {
  // 当前实例，data中数据的名字，数据发生改变后调用的回调函数
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb

    Dep.target = this // this就是当前的watcher
    // 保存旧数据
    this.oldValue = this.getVMValue(vm, expr)
    Dep.target = null // 清空watcher，方便下一个watcher使用
  }

  // 对外暴露的方法，用于更新页面
  update() {
    // 对比expr对应的数据是否发生了改变，若改变了，则调用cb
    let oldValue = this.oldValue
    let newValue = this.getVMValue(this.vm, this.expr)
    if (newValue !== oldValue) {
      this.cb(newValue, oldValue)
    }
  }

  // 获取VM中的数据
  getVMValue(vm, expr) {
    let data = vm.$data
    expr.split('.').forEach((key, i, a) => {
      data = data[key]
    })
    return data
  }
}

/**
 * Dep管理所用的订阅者和通知订阅者
 */
class Dep {
  constructor() {
    this.subs = []
  }

  // 添加订阅者
  addSub(watcher) {
    this.subs.push(watcher)
  }

  // 通知订阅者
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}