/**
 * observer用于给data中所有的数据添加getter和setter
 * 方便在获取或者设置data中数据的时候，实现我们的逻辑
 */
class Observer {
  constructor(data) {
    this.data = data
    this.walk(data)
  }

  /**
   * 核心方法
   */
  // 遍历data中所有的数据，都添加上getter和setter方法
  walk (data) {
    // 简单类型，就return
    if (!data || typeof data !== 'object') {
      return
    }

    Object.keys(data).forEach(key => {
      // 给data对象中的key，设置getter和setter
      this.defineReactive(data, key, data[key])
      // 如果daa[key]是复杂类型，就递归walk
      this.walk(data[key])
    })
  }

  // 定义响应式的数据（数据劫持）
  // data中的每一个数据都应该维护一个dep对象
  // dep保存了所有的订阅了该数据的订阅者
  defineReactive(obj, key, value) {
    const that = this
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        // 如果Dep.target中有watcher对象，存储到订阅的数组中
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        if (value === newValue) {
          return
        }
        value = newValue
        // 如果newValue是一个对象，也应该对它进行劫持
        // 场景：直接更改了vm.$data.obj，把obj直接替换了，所以要对新对象进行劫持
        that.walk(newValue)

        // 需要调用watcher的update方法
        // window.watcher.update()

        // 发布通知，让所有的订阅者更新内容
        dep.notify()
      }
    })
  }
}