(function (n) {
    let container = null,
        wrapper = null,
        wrapWidth = null,
        items = null,
        gap = 10,
        column = 2,
        vertical = 0,
        appendTimer = null,
        resize = false,
        waterfallItems = '',
        resizeTimer = null,
        mutationObserver,
        observerTimer = null;

    window.Waterfall = function (params) {
        container = n(params.container);
        container.find('.waterfall-wrapper').length === 0 && container.html('<div class="waterfall-wrapper"></div>');
        wrapper = container.find('.waterfall-wrapper');
        gap = params.gap || gap;
        column = params.column || column;
        wrapWidth = wrapper.width() - gap * (column - 1);
        resize = params.resize || resize;
        resize && waterfallResize();
        this.update = waterfallUpdate;
        this.append = waterfallAppend;
        observerChild();
    };

    // 监听属性/内容变化更新布局
    function observerChild() {
        mutationObserver = new MutationObserver(function (mutationsList, observer) {
            clearTimeout(observerTimer);
            observerTimer = setTimeout(function () {
                waterfallUpdate();
            }, 100)
        }).observe(wrapper[0], {
            attributes: true,
            childList: true,
            subtree: true
        });
    }

    // 响应宽度
    function waterfallResize() {
        n(window).on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeTimer = null;
                wrapWidth = wrapper.width() - gap * (column - 1);
                waterfallUpdate();
            }, 100);
        })
    }

    // 追加元素
    function waterfallAppend(content) {
        waterfallItems += '<div class="waterfall-item" style="opacity:0;">' + content + '</div>'
        clearTimeout(appendTimer);
        appendTimer = null;
        appendTimer = setTimeout(function () {
            waterfallItems = n(waterfallItems);
            wrapper.append(waterfallItems);
            waterfallItems.css('opacity', 0).animate({
                'opacity': '1'
            }, 100)
            waterfallItems = '';
            waterfallUpdate();
        }, 100)
    }

    // 更新布局
    function waterfallUpdate(params) {
        if (params && params.gap) {
            gap = params.gap;
            wrapWidth = wrapper.width() - gap * (column - 1);
        }
        if (params && params.column) {
            column = params.column;
            vertical = Math.ceil(items.length / column);
        }
        if (params && params.resize) {
            resize = params.resize;
            resize && waterfallResize();
        }
        items = wrapper.find('.waterfall-item');
        let wrapperHeight = 0;
        n.each(items, function (index, item) {
            let offset = getWaterfallIndex(item);
            let _wrapperHeight = offset.top + n(item).height();
            wrapperHeight = _wrapperHeight > wrapperHeight ? _wrapperHeight : wrapperHeight;

            n(item).css({
                'overflow': 'hidden',
                'position': 'absolute',
                'transition': 'all .3s',
                'width': wrapWidth / column,
                'top': offset.top,
                'left': offset.left
            })
        })

        wrapper.css({
            'width': '100%',
            'height': wrapperHeight,
            'overflow': 'hidden',
            'position': 'relative'
        })
    }

    // 获取元素在布局中的位置
    function getWaterfallIndex(item) {
        let index = n(item).index(),
            x = index % column,
            y = Math.floor(index / column),
            top = 0,
            left = x * wrapWidth / column + gap * x;

        if (y > 0) {
            let sibIndex = index;
            for (let i = 0; i < y; i++) {
                sibIndex = sibIndex - column;
                top += items.eq(sibIndex).height();
            }
            top += gap * y;
        }

        return {
            top,
            left
        }
    }
})($)
