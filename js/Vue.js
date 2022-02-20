// Vue 类，用来创建 vue 实例对象

class Vue {
  // 设置参数
  constructor(options) {
    // 1、存储属性
    this.$options = options || {};

    // 存储 el 挂载节点
    // 判断 el 值的类型，并进行相应处理（因为 vue 挂载节点时，可以传递节点的 id 名，也可以直接传递一个节点元素）
    const { el } = options;
    this.$el = typeof el === 'string' ? document.querySelector(el) : el;

    // 存储 data 数据
    this.$data = options.data || {};

    // 2、将 data 属性注入到 vue 实例中
    _proxyData(this, this.$data);

    // 3、创建 Observer 实例，监视 data 数据的变化
    new Observer(this.$data);

    // 4、调用 Compiler 类，进行模板编译
    new Compiler(this);
  }
}

// 封装将 data 属性注入到 vue 实例的函数
// 参数一 target：要进行挂载的实例对象
// 参数二 data：要进行注入的数据
function _proxyData(target, data) {
  // 遍历整个数组的属性名，根据属性名进行数据劫持操作
  Object.keys(data).forEach(key => {
    // 使用 Object.defineProperty() 进行数据劫持
    Object.defineProperty(target, key, {
      configurable: true, // 可配置
      enumerable: true, // 可枚举
      // 获取数据
      get() {
        return data[key]; // 返回数据
      },
      // 设置数据
      set(newValue) {
        data[key] = newValue; // 更新数据
      }
    });
  });
}
