/**
 * observer用于给data中的数据添加getter和setter
 * 方便在获取或者设置数据时，实现我们的逻辑
 */
class Observer {
  constructor(data) {
    this.data = data
    this.walk(data)
  }

  // 遍历data中所有的数据，都添加getter和setter
  walk(data) {
    // 判断是否是简单类型
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach(key => {
      // 给data对象中的key，设置getter和setter
      this.defineReactive(data, key, data[key])

      // 如果data[key]是复杂类型，就递归walk
      this.walk(data[key])
    })
  }

  // 定义响应式数据
  defineReactive(obj, key, value) {
    const that = this
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        // 如果Dep.target存在，就添加到订阅对象里
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        if (newValue === value) {
          return
        }
        value = newValue

        // 如果newValue是一个新对象，也需要对其进行监听
        // this指向的是当前obj，不是实例
        that.walk(newValue)

        // window.watcher.update()
        dep.notify()
      }
    })
  }
}