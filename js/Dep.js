// Dep 类，订阅者

class Dep {
  constructor() {
    // 存储订阅者
    this.subs = [];
  }

  // 添加订阅者
  addSub(sub) {
    // 如果订阅者存在，并且有 update 方法
    if (sub && sub.update) {
      this.subs.push(sub);
    }
  }

  // 通知订阅者
  notify() {
    // 遍历订阅者，并执行更新功能即可
    this.subs.forEach(sub => {
      // 调用订阅者的数据更新方法
      sub.update();
    });
  }
}
