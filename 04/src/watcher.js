/**
 * watcher模块用来把compiler和observer模块关联起来
 */
class Watcher {
  // 当data中某个数据发生改变时，调用cb
  constructor(expr, vm, cb) {
    this.expr = expr
    this.vm = vm
    this.cb = cb

    Dep.target = this
    this.oldValue = this.getVMValue(vm, expr)
    Dep.target = null
  }

  // 暴露在外面，数据改变后，更新页面 
  update() {
    let oldValue = this.oldValue
    let newValue = this.getVMValue(this.vm, this.expr)
    if (newValue !== oldValue) {
      this.cb(newValue)
    }
  }

  getVMValue(vm, expr) {
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  }
}

class Dep {
  constructor() {
    this.subs = []
  }

  // 添加watcher
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