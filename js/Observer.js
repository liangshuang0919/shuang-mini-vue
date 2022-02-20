// Observer 类，发布者

class Observer {
  // 接收绑定在实例上的数据对象，将这个对象的属性转换为 Getter/Setter
  constructor(data) {
    // 1、存储所有数据
    this.data = data;

    // 2、调用遍历数据对象函数
    this.walk(data);
  }

  // 封装用于数据遍历的方法
  walk(data) {
    // 遍历整个数据对象，将每个属性都设置为 Getter/Setter
    Object.keys(data).forEach(key => this.convert(key, data[key]));
  }

  // 封装用于将对象转换为响应式数据的方法
  convert(key, value) {
    // 调用 defineReactive() 函数，将该数据属性设置为私有函数
    defineReactive(this.data, key, value);
  }
}

// 为对象定义一个响应式的属性
function defineReactive(data, key, value) {
  // 初始化 Dep 实例对象
  const dep = new Dep();

  // 调用检测属性值类型函数
  judgeType(value);

  // 使用 Object.defineProperty() 进行劫持数据
  Object.defineProperty(data, key, {
    configurable: true, // 可配置
    enumerable: true, // 可枚举
    // 获取数据
    get() {
      console.log('获取了属性');

      // 当 Dep 的 target 属性存在，即通过 Watcher 触发的 Getter，那么就添加订阅者
      Dep.target && dep.addSub(Dep.target);

      return value
    },
    // 设置数据
    set(newValue) {
      console.log('设置了属性');

      // 判断数据是否发生了改变，没有改变就不需要进行数据的更新
      if (newValue === value) {
        return;
      }

      value = newValue; // 更新数据
      judgeType(value); // 调用检测属性值类型函数

      // 当数据变化时，调用 dep 的 notify 方法，让其通知订阅者
      dep.notify();
    }
  });
}

// 用来检测 data 中属性的数据类型
function judgeType(value) {
  // 如果当前的属性值存在，并且为对象类型的时候
  if (value && typeof value === 'object') {
    // 创建新的发布者实例对象，继续监听该属性值的变化
    return new Observer(value);
  }
}
