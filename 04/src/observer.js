/**
 * observer用来设置data的getter和setter
 * 在数据改变的时候，可以处理我们的逻辑
 */
class Observer {
  constructor(data) {
    this.data = data
    
    this.walk(data)
  }

  // 遍历data中的数据，设置setter和getter
  walk(data) {
    if (!data || typeof data !== 'object' || data === null) {
      return
    }
    // 遍历data中的数据，设置响应式数据
    for(let key in data) {
      this.defineReactive(data, key, data[key])
      this.walk(data[key])
    }
  }

  defineReactive(data, key, value) {
    const that = this
    const dep = new Dep()
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get() {
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        if (newValue === value) {
          return
        }
        value = newValue
        // 如果新值是对象，需要递归walk
        that.walk(newValue)

        // window.watcher.update()
        dep.notify()
      }
    })
  }
}