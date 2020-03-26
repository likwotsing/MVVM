class Vue {
  constructor(options = {}) {
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods

    // 把所有的数据都代理到vm上
    this.proxy(this.$data)
    this.proxy(this.$methods)

    // 设置响应式数据
    new Observer(this.$data, this)
    // 编译模板
    new Compiler(this.$el, this)
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