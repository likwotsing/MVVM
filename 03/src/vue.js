
class Vue {
  constructor(options = {}) {
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    this.$data = options.data
    this.$methods = options.methods

    // 给数据添加setter和getter
    new Observer(this.$data)

    // 把data中所有的数据挂载到vm上
    this.proxy(this.$data)
    // 把data中所有方法挂载到vm上
    this.proxy(this.$methods)

    // 解析模板
    if (this.$el) {
      new Compiler(this.$el, this)
    }
  }

  proxy(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get() {
          return data[key]
        },
        set(newValue) {
          if (newValue === data[key]) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}