# waterfall
## 使用方法

1. 在 HTML 文件中引入waterfall.js。在加载之前，确保已引入jQuery库。
2. 创建一个 HTML 容器 myWaterfallContainer， `<div class="waterfall-wrapper"></div>`用于容纳瀑布流的布局。
3. 初始化 Waterfall 实例，示例如下：


```javascript
var myWaterfall = new Waterfall({
    container: "#myWaterfallContainer",
    column: 2,
    gap: 20
});

```html
<div id="myWaterfallContainer">
    <div class="waterfall-wrapper">
        <div class="waterfall-item">
            <div class="content">Your content goes here</div>
        </div>
        <div class="waterfall-item">
            <div class="content">Your content goes here</div>
        </div>
        ...
    </div>
</div>

更新布局
myWaterfall.update({
    column: 3,  // 列数
    gap: 10 // 间距
});

追加内容
myWaterfall.append("Your content goes here");
myWaterfall.append("<div class='content'>Your content goes here</div>");
