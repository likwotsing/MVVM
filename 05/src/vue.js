class Vue {
  constructor(options = {}) {
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods

    // 把数据代理到vm实例上
    this.proxy(this.$data)
    this.proxy(this.$methods)

    // 数据响应式
    new Observer(this.$data)

    // 编译指令
    new Compiler(this.$el, this)
  }

  proxy(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
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