/**
 * observer用于给数据添加setter和getter，方便添加我们的逻辑
 */
class Observer {
  constructor(data) {
    this.data = data

    this.walk(data)
  }

  // 遍历data中所有数据，都添加getter和setter
  walk(data) {
    if (!data || typeof data !== 'object') {
      return
    }

    Object.keys(data).forEach(key => {
      // 给data对象中key设置getter和setter
      this.defineReactive(data, key, data[key])

      // 如果data[key]是复杂数据，递归walk
      this.walk(data[key])
    })
  }

  // 设置响应式数据
  defineReactive(obj, key, value) {
    const that = this
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log('get')
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        if (newValue === value) {
          return
        }
        value = newValue
        // 如果newValue是新对象，需要对其进行walk
        that.walk(newValue)
        
        // 执行wather的update方法
        // window.watcher.update()
        dep.notify()
      }
    })
  }
}