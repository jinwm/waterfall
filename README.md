# waterfall
## 使用方法

1. 在 HTML 文件中引入waterfall.js。在加载之前，确保已引入jQuery库。
2. 创建一个 HTML 容器，比如 `<div class="waterfall-wrapper"></div>`，用于容纳瀑布流的布局。
3. 初始化 Waterfall 实例，传入适当的参数，示例如下：

```javascript
var myWaterfall = new Waterfall({
    container: "#myWaterfallContainer",
    gap: 20,
    column: 3
});

myWaterfall.update({
    gap: 10,
    column: 2
});

myWaterfall.append("Your content goes here");
