/**
 * 定义一个类，用于创建vue实例
 */
class Vue {
  constructor(options = {}) {
    // 给vue实例增加属性
    this.$el = options.el
    this.$data = options.data

    // 如果指定了el参数，对el进行解析
    if (this.$el) {
      // compile负责解析模板的内容
      // 需要：模板和数据
      const c = new Compile(this.$el, this)
      console.log('c', c)
    }
  }
}