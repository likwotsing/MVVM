class Vue {
  constructor(options = {}) {
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods

    // el存在时，进行解析
    // 解析模板, 需要模板和数据
    if (this.$el) {
      const c = new Compiler(this.$el, this)
      console.log(c)
    }
  }
}