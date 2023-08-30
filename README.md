# waterfall
## 使用方法

1. 在 HTML 文件中引入waterfall.js。
2. 创建一个 HTML 容器 myWaterfallContainer， `<div class="waterfall-wrapper"></div>`用于容纳瀑布流的布局。
3. 初始化 Waterfall 实例，示例如下：

```HTML
<div id="myWaterfallContainer">
    <div class="waterfall-wrapper">
        <div class="waterfall-item">
            <div class="content">Your content goes here</div>
        </div>
        <div class="waterfall-item">
            <div class="content"><div class="content">Your content goes here</div></div>
        </div>
        ...
    </div>
</div>
```

```javascript
var myWaterfall = new Waterfall({
    container: "#myWaterfallContainer",
    ...
});

// 更新布局/属性
myWaterfall.update();
myWaterfall.update({
    column: 3,  // 布局的总列数
    gap: 10, // 元素之间的距离
    resize: true  // 开启宽度自适应
});

// 追加内容
myWaterfall.append("Your content goes here");
myWaterfall.append("<div class='content'>Your content goes here</div>");
