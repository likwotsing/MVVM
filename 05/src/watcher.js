/**
 * watcher模块用来把compiler和observer模块关联起来
 */
class Watcher {
  constructor(expr, vm, cb) {
    this.expr = expr
    this.vm = vm
    this.cb = cb

    Dep.target = this
    this.oldValue = this.getVMValue(vm, expr)
    Dep.target = null
  }

  // 暴露给外部的方法，当数据发生改变后，调用cb
  update () {
    let newValue = this.getVMValue(this.vm, this.expr)
    if (newValue !== this.oldValue) {
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

  addSub(watcher) {
    this.subs.push(watcher)
  }

  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}