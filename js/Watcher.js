// Watcher 类，订阅者

class Watcher {
  constructor(vm, key, callback) {
    // 当前 vue 实例
    this.vm = vm;

    // 要操作的属性名（键）
    this.key = key;

    // 数据变化后要执行的回调函数
    this.callback = callback;

    // 触发 Observer 类中的 Getter 前，将当前订阅者实例存储给 Dep 类
    // 这么做是为了防止，不是通过 Watcher 触发的 Getter 的情况也生成订阅者
    Dep.target = this;

    // 记录属性更改之前的值，用于进行更新状态检测（导致 Observer 类中 Getter 的触发）
    this.oldValue = vm[key];

    // 以后可能会再创建新的 Watcher，上述操作完毕以后，需要清除 target，用于存储下一个 Watcher 实例
    Dep.target = null;
  }

  // 封装数据变化时更新视图的功能
  update() {
    // 获取更新的新数据
    const newValue = this.vm[this.key];

    // 如果新旧数据一样，那么无需进行更新操作
    if (newValue === this.oldValue) {
      return;
    }

    // 数据改变，调用更新后的回调函数
    this.callback(newValue);
  }
}
