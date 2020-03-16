/**
 * watcher模块负责把compiler模块和observer模块关联起来
 */
class Watcher {
  // vm：当前实例
  // expr：data中数据的名字
  // cb：一旦数据发生了改变，需要调用cb
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb


    // this表示的新创建的watcher对象
    // 存储到Dep.target属性上
    Dep.target = this
    // 需要把expr的旧值存储起来
    this.oldValue = this.getVMValue(vm, expr)
    // 清空Dep.target，方便下一个订阅者使用
    Dep.target = null
  }

  // 对外暴露的方法，用户更新页面 
  update() {
    // 对比expr是否发生了改变，如果发生了改变，需要调用cb
    let oldValue = this.oldValue
    let newValue = this.getVMValue(this.vm, this.expr)
    if (oldValue !== newValue) {
      this.cb(newValue, oldValue)
    }
  }

  // 用于获取VM中的数据
  getVMValue(vm, expr) {
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  }
}

/**
 * 用于管理所有的订阅者和通知订阅者
 */
class Dep {
  constructor() {
    // 管理订阅者
    this.subs = []
  }

  // 添加订阅者
  addSub(watcher) {
    this.subs.push(watcher)
  }

  // 通知
  notify() {
    // 通知所有的订阅者
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}