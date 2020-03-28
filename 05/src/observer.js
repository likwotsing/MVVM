/**
 * 给data中的数据添加getter和setter
 * 方便实现我们的逻辑
 */
class Observer {
  constructor(data) {
    this.data = data

    this.walk(data)
  }

  // 遍历data中的数据，实现数据响应式
  walk(data) {
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
      this.walk(data[key])
    })
  }

  defineReactive(obj, key, value) {
    const that = this
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        if (newValue === value) {
          return
        }
        value = newValue
        that.walk(newValue)

        // window.watcher.update()
        dep.notify()
      }
    })
  }
}