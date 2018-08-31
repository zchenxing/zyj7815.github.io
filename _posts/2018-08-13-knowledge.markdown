---
layout: post
title: ES知识点梳理
date: 2018-08-13 17:02:00 +0800
description: ES知识点梳理
img: common/js-1.png # Add image post (optional)
tags: [Javascript]
---



### ES知识点梳理

> - 变量类型
    - JS 的数据类型分类和判断
    - 值类型和引用类型

> - 原型与原型链（继承）
    - 原型和原型链定义
    - 继承写法

> - 作用域和闭包
    - 执行上下文
    - this
    - 闭包是什么

> - 异步
    - 同步 vs 异步
    - 异步和单线程
    - 前端异步的场景

> - ES6/7 新标准的考查
    - 箭头函数
    - Module
    - Class
    - Set 和 Map
    - Promise...


## 变量类型

js的数据类型有6种
- Boolean
- String
- Number
- Null
- Undefined
- Symbol（ES6中定义）

* **注意：** 原始类型不包含Object*


> 题目： ==类型判断用到哪些方法==

    1. typeof xxx 得到的值有一下类型：`boolean`、`string`、`number`、`null`、`function`、`undefined`、`symbol`

    2. instanceof, 可以用来判断是否为Array。使用typeof无法判断，但可以使用`[1, 2] instanceof Array`来判断

    3. Object.constructor 使用判断数组, [1, 2].constructor === Array





> 题目：==值类型和引用类型的区别==

    引用类型可以通过`typeof` 为 `object` 和 `function` 来判断。
    JS会在堆中分配一块内存给引用类型，而值类型不会。



## 原型与原型链

> 题目：==如何理解JavaScript的原型==
    
    - 所有的引用类型，都具有对象特性，即可自由扩展属性
    - 所有的应用类型，都有`__proto__`属性，属性值为一个普通对象
    - 所有函数，都有一个`prototype`的属性，属性也是一个普通对象
    - 所有引用类型，`__prop__`属性都指向它的构造函数`prototype`属性
    
1. 对象的可扩展性
```js
var obj = {}
obj.name = "jack"

function fn () {}
fn.a = 100;
```

2. 引用类型的`__proto__`属性值指向它的构造函数的`prototype`属性值
```js
fn.__proto__ === Function.prototype
```

> 题目：==如何理解js中的原型链==
    
    通过原型我们知道，js对象都有一个`__proto__`属性，
    这个`__proto__`指向这个对象的构造函数的`prototype`。
    当试图得到一个对象属性时，如果这个对象本身没有这个属性，
    那么它就会去它的`__proto__`中查找，逐级向上查找，知道找到为止。
    若在最上层`Object.prototype.__proto__`中没有找到，则会报错。

一个简单的例子
```js
function F1(name) {
    this.name = name;
}

F1.prototype.say = function() {
    console.log(this.name)
}

var f1 = new F1('Sam')
f1.say()
```

在执行`say()`时，f1本身没有这个函数，那么它就是去`f1.__proto__`，即`F1.prototype`中查找。在`F1.prototype`找到了该函数并执行。

如果没有找到的话，就会`到F1.prototype.__proto__`即`Object.prototype`中查找。再没有找到，就到`Object.prototype.__proto__`中查找。若是最上层没找到，则报错。




## 执行上下文

分析以下代码
```js
console.log(a) // undefined
var a = 10;

console.log(b) // 报错
b = 20;
```

js在执行之前，要全文解析，发现`var`关键字，知道有个变量`a`，便存入执行上下文中。而`b`没有找到关键字`var`，没有在执行上下文中提前占位。在执行代码时，由于变量`a`已经存在执行上下文中，只是还没有赋值，即为`undefined`。而在执行上下文中没有找到b的引用，就会报错。

另外，一个函数执行之前，也会创建一个函数上下文环境，跟**全局上下文**差不多，不过函数 执行上下文 会多出`this`、`arguments`和函数的参数。


#### this
`this`的值在执行的时候才能确认，定义的时候不能确认。因为`this`是执行上下文环境的一部分，而执行上下文需要在代码执行之前确认。

```js
var a = {
    name: 'A',
    fn: function () {
        console.log(this.name)
    }
}
a.fn()  // this === a
a.fn.call({name: 'B'})  // this === {name: 'B'}
var fn1 = a.fn
fn1()  // this === window...
```


#### 作用域

> 题目：==如何理解 JS 的作用域和作用域链==

每一个变量、函数都有其作用的范围，超出作用不得使用，这个叫做作用域。JS的作用域无非就是全局作用域和局部作用域，在ES6加入块级作用域。

作用域链就是根据在内部函数可以访问外部函数变量的这种机制，用链式查找决定哪些数据能被内部函数访问。



## ES6语法

> 题目：==ES6 模块化如何使用？==

```
// 创建一个module.js的文件
export default {
    a: 100
}

// 引用文件
import plugin from './module'
console.log(plugin)
```


> 题目：==ES6 class 和普通构造函数的区别==

    1. class 是一种新的语法形式，是class Name {...}这种形式，和函数的写法完全不一样
    2. 两者对比，构造函数函数体的内容要放在 class 中的constructor函数中，constructor即构造器，初始化实例时默认执行
    3. class 中函数的写法是add() {...}这种形式，并没有function关键字...
    4. 继承方式