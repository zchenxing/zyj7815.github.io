---
layout: post
title: 实现组件化开发
date: 2018-02-24 16:00:00 +0800
description: JavaScript 对闭包的理解
img: 
tags: [Javascript] 
---

在项目开发中，组件化、模块化、工程化开发越来越受到重视。组件化可以帮我们实现代码的高内聚、可重用和可重用，将复杂的组件抽象出来，也更易于维护。

我们先通过组件化方式，编写一个点赞的功能组件：

```js
class LikeButton {
    render () {
      return `
        <button id='like-btn'>
          <span class='like-text'>赞</span>
          <span>👍</span>
        </button>
      `
    }
  }
```


再调用这个组件，需要注意的是，要先写类方法，才能调用，不然编译会报错。
```js
const wrapper = document.querySelector(".wrapper")
const likeButton = new LikeButton()
wrapper.innerHTML = likeButton.render()
```

这是一个很简单的结构复用，但是没有往里面添加事件，点击根本没有反应，所以需要往DOM中添加事件。但是`LikeButton`虽然有个`Button`，但是这个根本就是个字符串，DOM事件的API只有DOM结构才能用。

假设我们现在有个函数`createDOMFromSreing`，往这个函数传入`HTML`字符串，它会把相应的DOM元素返回回来。
```js
const createDOMFromString = (domString) => {
    const div = docment.createElement('div')
    div.innerHTML = domString
    return div
}

```


这时候我们再改一下`LikeButton`类
```js
class LikeButton {
    render() {
        this.el = createDOMFromString(`
        <button class='like-button'>
            <span class='like-text'>点赞</span>
            <span>👍</span>
        </button>
      `)
      
      this.el.addEventListener('click', () => console.log('click'), false)
      return this.el
    }
}
```


现在`render()`函数返回的不在是一串字符串，而是有这段HTML字符串所生成的DOM，在返回的DOM元素中添加DOM事件再返回。

因为现在的`render()`返回的是DOM元素，所以不能用`innerHTML`插入到wrapper，而需要用DOM API插入。

```js
var wrapper = document.querySelector('.wrapper')

const likeButton = new LikeButton()
wrapper.appendChild(likeButton.render())

```

现在点击按钮，在控制台就会输出`click`，事件绑定好了。


上面的例子，可以再改造一下

```javascript
  
    class LikeButton {
        constructor() {
            this.state = {
                isLiked: false
            }
        }

        changeLikeText() {
            const likeText = this.el.querySelector('.like-text')
            this.state.isLiked = !this.state.isLiked
            likeText.innerHTML = this.state.isLiked ? '取消' : '点赞'
        }

        render() {
            this.el = createDOMFromString(
                `
                <button class='like-button'>
                    <span class='like-text'>点赞</span>
                    <span>👍</span>
                </button>
            `
            )
            this.el.addEventListener('click', this.changeLikeText.bind(this), false)
            return this.el
        }
    }

    const wrapper = document.querySelector('.wrapper')
    const like = new LikeButton()
    wrapper.appendChild(like.render())
```
上面的代码，给`LikeButton`添加了构造函数，这个构造函数会给每个`LikeButton`的实例添加一个对象`state`，`state`保存了每个按钮的点赞状态，现在在项目中就可以直接调用了。

但是从`changeLikeText()`这个函数中可以看出，在点击按钮的时候，仍然会一直操作DOM，而我们需要的是减少手动操作DOM。

##### 状态改变 -> 构建新的 DOM 元素更新页面
这里提出一种解决方案：**如果状态发送改变，就调用`render()`方法，构造一个新的 DOM 元素**


```js
class LikeButton {
    constructor() {
        this.state = {isLick: false}        
    }
    
    setState(state) {
        this.state = state
        this.el = this.render()
    }
    
    changeLikeText() {
        this.setState({
            isLike: !this.state.isLike
        })
    }
 
    render () {
        this.el = createDOMFromString(`
            <button class='like-btn'>
                <span class='like-text'>${this.state.isLiked ? '取消' : '点赞'}</span>
                <span>👍</span>
            </button>
        `)
        this.el.addEventListener('click', this.changeLikeText.bind(this), false)
        return this.el
    }
}
```
这里也只修改了几个地方
    
1. `render()`函数中的状态会根据`this.state`的不同而不同
2. 新增`setState`函数，它会设置实例`state`，然后重新调用`render`方法
3. 当用户点击按钮时，`changeLikeText`会构建新的`state`对象，这个`state`会传入`setState`函数中

也就是说，当你调用`setState`时，组件就会重新渲染。

其实仔细看你会发现，重新渲染的DOM元素并没有插入到页面中。所以需要知道这个组件发生了改变，并将新的DOM元素更新到页面中

重新修改一下`setState`函数
```js
...

    setState(state) {
        const oldEl = this.el
        this.state = state
        this.el = render()
        if(this.onstateChange) {
            this.onStateChange(oldEl, this.el)
        }
    }
...
```

使用组件时：

```
const likeButton = new LikeButton()
wrapper.appendChild(likeButton.render()) //第一次插入DOM元素
likeButton.onStateChange = (oldEl, newEl) => {
    wrapper.insertBefore(newEl, oldEl) // 插入新的元素
    wrapper.removeChild(old)    //删除旧的元素
}

```

这里每次调用`setState`都会调用`onStateChange`方法，而这个方法是实例化以后被设置的，所以可以自定义`onStateChange`。**这里做的事情是，每当`setState`中构造完新的DOM元素后，就会通过`onStateChange`告知外部插入新的DOM元素，然后删除旧的DOM元素，页面就更新了**

但是这样做真的太暴力了，每次`setState`都要重新构造、新增、删除。少的操作还好，但是如有大量的操作，对性能影响相当大。


为了灵活，我们可以将这种模式抽象出来，放到一个`Component`类中
```js

class Component {
    setState(state) {
        const oldEl = this.el
        this.state = state
        this._renderDOM()
        if(this.onStateChange) this.onStateChange(oldEl, this.el)
    }
    
    _renderDOM() {
        this.el = createDOMFromString(this.render())
        if(this.onClick) {
            this.el.addEventListener('click', this.onClick.bind(this), false)
        }
        return this.el
    }
}
```

这是一个组件父类`Component`，所有的组件都可以继承这个父类类构建。它定义了两个方法，一个是`setState`，一个是私有方法`_renderDOM`。`_renderDOM`会调用`this.render()`来构建 DOM 元素并监听`onClick`事件。

还有一个额外的`mount`方法，就是把组件的DOM元素插入页面，并在`setState`的时候更新页面

```
const mount = (component, wrapper) => {
    wrapper.appendChild(component._renderDOM())
    component.onStateChange = (oldEl, newEl) => {
        wrapper.insertBefore(newEl, oldEl)
        wrapper.removeChild(oldEl)
    }
}

```

这样的话我们重新写点赞组件就会变成：
```js

class LikeButton extends Component {
    constructor() {
        super()
        this.state = {isLike: false}
    }
    
    onClick() {
        this.setState({
            isLike: !this.state.isLike
        })
    }
    
    render() {
        return 
            `<button class='like-btn'>
                <span class='like-text'>${this.state.isLiked ? '取消' : '点赞'}</span>
                <span>👍</span>
            </button>`
    }
}

const wrapper = document.querySelector('.wrapper')
mount(new LikrButton(), wrapper)
```


在实际的开发中，我们可能需要给组件传入一些自定义的配置数据。例如传入一个颜色，那我们就要在`Component`的构造函数中修改一下
```js
...
    constructor(props = {}) {
        this.props = props
    }
...
```



通过`super(props)`把`props`传给父类，这样就可以通过`this.props`获取相关数据了
```js
// Class LikeButton
...
    constructor(props) {
        super(props)
        this.state = {
            isLike: false
        }
    }
    ......
     
    render () {
        return `
            <button class='like-btn' style="background-color: ${this.props.bgColor}">
                <span class='like-text'>
                    ${this.state.isLiked ? '取消' : '点赞'}
                </span>
                <span>👍</span>
            </button>
        `
    }
...


mount(new LikeButton({ bgColor: 'red' }), wrapper)


```
我们将传入的参数`this.props.bgColor`来生成不同的`style`属性，这样我们就可以自定义颜色了。


再将上面的代码整理一下，就是实现一段组件化的功能。

```javascript
  const createDOMFromString = (domString) => {
        const div = document.createElement('div')
        div.innerHTML = domString
        return div
    }

    const mount = (component, wrapper) => {
        wrapper.appendChild(component._renderDOM())
        component.onStateChange = (oldEl, newEl) => {
            wrapper.insertBefore(newEl, oldEl)
            wrapper.removeChild(oldEl)
        }
    }

    
    class Component {
        constructor(props) {
            this.props = props
        }

        setState(state) {
            const oldEl = this.el
            this.state = state
            this._renderDOM()
            if (this.onStateChange) this.onStateChange(oldEl, this.el)
        }

        _renderDOM() {
            this.el = createDOMFromString(this.render())
            if (this.onClick) {
                this.el.addEventListener('click', this.onClick.bind(this), false)
            }
            return this.el
        }
    }

    class LikeButton extends Component{
        constructor(props) {
            super(props)
            this.state = { isLiked: false }
        }

        onClick() {
            this.setState({
                isLiked: !this.state.isLiked
            })
        }

        render() {
            return `
                <button class='like-btn' style="background-color: ${this.props.bgColor}">
                    <span class='like-text'>${this.state.isLiked ? '取消' : '点赞'}</span>
                    <span>👍</span>
                </button>
            `
        }
    }

    const wrapper = document.querySelector('.wrapper')
    mount(new LikeButton({bgColor: '#ff8888'}), wrapper)
```