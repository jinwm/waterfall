(function () {
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
        container = document.querySelector(params.container);
        wrapper = container.querySelector('.waterfall-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'waterfall-wrapper';
            container.innerHTML = '';
            container.appendChild(wrapper);
        }
        items = Array.from(wrapper.querySelectorAll('.waterfall-item')).map(function (item, index) {
            return {
                index,
                el: item
            }
        });
        gap = params.gap || gap;
        column = params.column || column;
        wrapWidth = wrapper.offsetWidth - gap * (column - 1);
        resize = params.resize || resize;
        resize && waterfallResize();
        if (items.length > 0) {
            !observerChild() && waterfallUpdate();
        }

        this.update = waterfallUpdate;
        this.append = waterfallAppend;
    };

    // 监听内容变化更新布局
    function observerChild() {
        if (window.MutationObserver) {
            mutationObserver = new MutationObserver(function (mutationsList, observer) {
                clearTimeout(observerTimer);
                observerTimer = setTimeout(function () {
                    waterfallUpdate();
                }, 100)
            }).observe(wrapper, {
                attributes: true,
                childList: true,
                subtree: true
            });
            return true;
        }
        return false;
    }

    // 响应宽度
    function waterfallResize() {
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeTimer = null;
                wrapWidth = wrapper.offsetWidth - gap * (column - 1);
                waterfallUpdate();
            }, 100);
        })
    }

    // 追加内容
    function waterfallAppend(content) {
        waterfallItems += '<div class="waterfall-item fadeIn">' + content + '</div>'
        clearTimeout(appendTimer);
        appendTimer = null;
        appendTimer = setTimeout(function () {
            wrapper.innerHTML = wrapper.innerHTML + waterfallItems;
            waterfallItems = '';
            fadeInFn(Array.from(wrapper.querySelectorAll('.waterfall-item.fadeIn')), 100, function (items) {
                items.forEach(function (item) {
                    item.classList.remove('fadeIn');
                })
            });
            waterfallUpdate();
        }, 100)
    }

    // 淡入动画
    function fadeInFn(els, duration, callback) {
        let opacity = 0,
            translateY = gap,
            j = 10,
            time = 0,
            timer;
        els.forEach(function (item) {
            item.style.opacity = opacity;
            item.style.transform = 'translate3d(0, -' + translateY + 'px, 0)';
        })
        timer = setInterval(function () {
            time += duration / j;
            if (time >= duration) {
                clearInterval(timer);
                callback && callback(els);
            }
            opacity = opacity + 1 / j;
            translateY -= gap / j;
            els.forEach(function (item) {
                item.style.opacity = opacity;
                item.style.transform = 'translate3d(0, -' + translateY + 'px, 0)';
            })
        }, duration / j);
    }

    // 获取元素在布局中的位置
    function getWaterfallIndex(item) {
        let index = item.index,
            x = index % column,
            y = Math.floor(index / column),
            pTop = 0,
            pLeft = x * wrapWidth / column + gap * x;

        if (y > 0) {
            let sibIndex = index;
            for (let i = 0; i < y; i++) {
                sibIndex = sibIndex - column;
                pTop += items[sibIndex].el.offsetHeight;
            }
            pTop += gap * y;
        }

        return {
            pTop,
            pLeft
        }
    }

    // 更新布局
    function waterfallUpdate(params) {
        items = Array.from(wrapper.querySelectorAll('.waterfall-item')).map(function (item, index) {
            return {
                index,
                el: item
            }
        });

        if (params) {
            if (params.gap) {
                gap = params.gap;
                wrapWidth = wrapper.offsetWidth - gap * (column - 1);
            }
            if (params.column) {
                column = params.column;
                vertical = Math.ceil(items.length / column);
            }
            if (params.resize) {
                resize = params.resize;
                resize && waterfallResize();
            }
        }

        let wrapperHeight = 0;
        items.forEach(function (item) {
            let offset = getWaterfallIndex(item);
            let _wrapperHeight = offset.pTop + item.el.offsetHeight;
            wrapperHeight = _wrapperHeight > wrapperHeight ? _wrapperHeight : wrapperHeight;
            item.el.style.overflow = 'hidden';
            item.el.style.position = 'absolute';
            item.el.style.transition = 'all .3s';
            item.el.style.width = wrapWidth / column + 'px';
            item.el.style.top = offset.pTop + 'px';
            item.el.style.left = offset.pLeft + 'px';
        })

        wrapper.style.width = '100%';
        wrapper.style.height = wrapperHeight + 'px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.position = 'relative';
    }
})()
