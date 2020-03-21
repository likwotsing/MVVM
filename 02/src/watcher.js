/**
 * watcher模块负责把compile模块和observer模块关联起来
 */
class Watcher {
  // vm: 当前实例
  // expr：data中数据的名字
  // cb：如果数据改变了，就调用cb
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb

    // this就是当前wathcer对象
    // 存储到Dep的target属性上
    Dep.target = this
    
    // test
  
    // 把旧值存储起来, 用于和新值对比
    // 获取数据时，会执行getter，getter里会检测Dep.target
    this.oldValue = this.getVMValue(vm, expr)

    // 清空Dep.target，方便下一个watcher使用
    Dep.target = null
  }

  // 对外暴露的方法，用户更新页面
  update() {
    // 对比expr对应的值，是否发生了改变，如果改变了，就调用cb
    let oldValue = this.oldValue
    let newValue = this.getVMValue(this.vm, this.expr)
    if (oldValue !== newValue) {
      this.cb(newValue, oldValue)
    }
  }

  // 工具函数
  // 获取VM中的数据
  getVMValue(vm, expr) {
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  }
}

/**
 * Dep用于管理所有的订阅者和通知订阅者
 */
class Dep {
  constructor() {
    this.subs = []
  }

  // 添加订阅者
  addSub(watcher) {
    this.subs.push(watcher)
  }

  // 通知
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}