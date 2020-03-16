/**
 * observer用于给data中所有的数据添加getter和setter
 * 方便在获取或者设置data中数据的时候，实现我们的逻辑
 */
class Observer {
  constructor(data) {
    this.data = data
    this.walk(data)
  }

  // 核心方法
  // 遍历data中的数据，都添加getter和setter
  walk (data) {
    // 简单类型，就return
    if (!data || typeof data !== 'object') {
      return
    }

    Object.keys(data).forEach(key => {
      // 给data中的key设置getter和setter
      this.defineReactive(data, key, data[key])
      // 如果data[key]是复杂类型，应该递归walk
      this.walk(data[key])
    })
  }

  // 定义响应式的数据
  defineReactive(obj, key, value) {
    const that = this
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        // 如果Dep.target中有watcher对象，就存储到订阅的数组中
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        if (value === newValue) {
          return
        }
        value = newValue
        // 如果newValue是一个对象，也应该改对它进行劫持
        that.walk(newValue)

        // window.watcher.update()

        // 发布通知，让所有的订阅者更新内容
        dep.notify()
      }
    })
  }
}