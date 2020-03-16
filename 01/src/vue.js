class Vue {
  constructor(options = {}) {
    // 给vue实例增加属性
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods

    // 监视数据
    new Observer(this.$data)

    // 把this.$data中的数据代理到vm上
    this.proxy(this.$data)

    // 把methods上所有数据代理到vm上
    this.proxy(this.$methods)

    // 如果指定了el参数，对el参数进行解析
    if(this.$el) {
      // compiler负责解析模板的内容
      // 需要：模板和数据
      const c = new Compiler(this.$el, this)
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
          if (data[key] === newValue) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}
