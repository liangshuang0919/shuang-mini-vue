// Compiler 类，编译模板

class Compiler {
  constructor(vm) {
    // 存储 vue 实例
    this.vm = vm;

    // 存储挂在元素
    this.el = vm.$el;

    // 调用初始化模板编译的方法
    this.compile(this.el);
  }

  // 模板编译的基础方法
  compile(el) {
    // 存储挂载元素中所有的子节点
    const childNodes = el.childNodes;

    // 对子节点进行遍历
    // childNodes 是一个伪数组，先通过 Array.from() 转换为真实的数组
    Array.from(childNodes).forEach(node => {
      // 检测节点类型（文本节点、元素节点）
      if (isTextNode(node)) {
        // 如果是文本节点，调用编译文本节点内容的方法
        this.compileText(node);
      } else if (isElementNode(node)) {
        // 如果是元素节点，调用编译元素节点内容的方法
        this.compileElement(node);
      }

      // 检测当前节点是否存在子节点
      if (node.childNodes && node.childNodes.length) {
        // 如果存在子节点，再次编译其子节点
        this.compile(node);
      }
    });
  }

  // 封装文本节点的编译方法
  compileText(node) {
    // 通过正则表达式匹配 mustache 语法：{{}}
    const reg = /\{\{(.+?)\}\}/g;

    // 去除内容中不必要的空格与换行
    const value = node.textContent.replace(/\s/g, '');

    // 声明数组存储多段文本
    const arrText = [];

    // 记录已经操作过的位置的索引值
    let lastIndex = 0;

    // 记录当前提取内容的索引
    let currentIndex;

    // 通过正则匹配出的结果
    let result;

    // 循环，只要匹配 value 值有内容，那么就进行操作处理
    while (result = reg.exec(value)) {
      // 本次提取内容的初始索引值
      currentIndex = result.index;

      // 处理普通文本
      if (currentIndex > lastIndex) {
        // 如果当前索引大于已经操作过的位置的索引
        // 则表示中间有一部分没有进行处理，即没有 mustache 语法包裹的文本内容，将这个未处理的内容存入 arrText 中
        arrText.push(value.slice(lastIndex, currentIndex));
      }

      // 处理 mustache 差值表达式的内容（去除空格的操作 trim() 可省略）
      const key = result[1].trim();
      // 根据 key 获取对应属性值，存储到 arrText
      arrText.push(this.vm[key]);

      // 更新 lastIndex
      lastIndex = currentIndex + result[0].length;

      // 进行视图更新
      // 记录 arrText 数组最后一个元素的索引
      const position = arrText.length - 1;
      // 创建订阅者，watcher 实时订阅数据变化
      new Watcher(this.vm, key, newValue => {
        // 数据变化，修改 arrText 数组中对应的数据
        arrText[position] = newValue;

        // 更新节点中的内容
        node.textContent = arrText.join('');

        console.log(newValue);
      });

      // 页面初始渲染
      node.textContent = arrText.join('');
    }
  }

  // 封装元素节点处理方法
  compileElement(node) {
    console.log(node.attributes);

    // 获取属性节点（node.attributes 是一个伪数组，先转换成数组，之后遍历）
    Array.from(node.attributes).forEach(attr => {
      // 保存属性名称，并检测属性的功能
      let attrName = attr.name;

      // 判断当前属性名是否是指令（v-）
      if (!isDirective(attrName)) {
        // 如果当前节点的属性不是一个指令，后续操作不再执行
        return;
      }

      // 如果当前节点的属性是一个指令
      // 获取是哪个指令（v- 后面的指令名）
      attrName = attrName.slice(2);

      // 获取指令绑定的属性（键）
      const key = attr.value;

      // 封装 update 方法，用于进行不同指令的分配
      this.update(node, key, attrName);
    });
  }

  // 用于进行指令分配的方法
  update(node, key, attrName) {
    // 名称处理
    const updateFn = this[attrName + 'Updater'];

    // 检测并调用
    // 这里需要使用 call 更改 this 指向，因为 update 中没有具体的 updateFn 方法，所以显示的绑定给 Compiler 类去执行
    updateFn && updateFn.call(this, node, key, this.vm[key]);
  }

  // v-text 处理
  textUpdater(node, key, value) {
    // 给元素设置初始内容
    node.textContent = value;

    // 订阅数据变化
    new Watcher(this.vm, key, newValue => {
      // 更新视图
      node.textContent = newValue;
    });
  }

  // v-model 处理
  modelUpdater(node, key, value) {
    // 给元素设置初始内容
    // 这里使用到是 node.value，因为双向数据绑定 v-model 都是绑定在 input 输入框中的
    node.value = value;

    // 订阅数据变化
    new Watcher(this.vm, key, newValue => {
      node.value = newValue;
    });

    // 监听 input 事件，实现双向绑定
    node.addEventListener('input', () => {
      // 更新数据
      this.vm[key] = node.value;
    });
  }
}

// 判断节点是否为元素节点
function isElementNode(node) {
  // 元素节点的 nodeType 为 1
  return node.nodeType === 1;
}

// 判断节点是否为文本节点
function isTextNode(node) {
  // 文本节点的 nodeType 为 3
  return node.nodeType === 3;
}

// 判断属性名，是否为指令
function isDirective(attrName) {
  return attrName.startsWith('v-');
}
