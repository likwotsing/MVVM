class Vue {
  constructor(options = {}) {
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods
    
    // 编译指令
    if (this.$el) {
      new Compiler(this.$el, this)
    }
  }
}