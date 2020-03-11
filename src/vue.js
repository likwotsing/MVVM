/**
 * 定义一个类，用于创建vue实例
 */
class Vue {
  constructor(options = {}) {
    // 给vue实例增加属性
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods

    // 监视data中的数据
    new Observer(this.$data)

    // 把data中所有的数据代理到了vm上（挂到了）
    this.proxy(this.$data)

    // 把methods中所有的数据代理到了vm上
    this.proxy(this.$methods)

    // 如果指定了el参数，对el进行解析
    if (this.$el) {
      // compile负责解析模板的内容
      // 需要：模板和数据
      const c = new Compile(this.$el, this)
      // console.log('c', c)
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
