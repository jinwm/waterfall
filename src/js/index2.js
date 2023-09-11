(function () {
    let container = null,
        wrapper = null,
        wrapWidth = null,
        wrapperHeight = 0,
        loadedItems = [],
        itemAll = [],
        gap = 10,
        column = 2,
        vertical = 0,
        resize = false,
        resizeTimer = null,
        mutationObserver,
        observerTimer = null,
        renderStart = false,
        contentsTimer = null,
        loadLastIndex = 0,
        lazyLoadNum = 10,
        lazy = false,
        isInit = true;

    window.Waterfall = function (params) {
        container = document.querySelector(params.container);
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.boxSizing = 'border-box';
        container.style.overflowY = 'auto';

        wrapper = container.querySelector('.waterfall-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'waterfall-wrapper';
            container.innerHTML = '';
            container.appendChild(wrapper);
        }
        itemAll = Array.from(wrapper.querySelectorAll('.waterfall-item')).reduce((pre, cur, index) => pre.push({
            index,
            el: cur
        }) && pre, []);
        gap = params.gap || gap;
        column = params.column || column;
        lazy = params.lazy || lazy;
        wrapWidth = wrapper.offsetWidth - gap * (column - 1);
        resize = params.resize || resize;
        resize && waterfallResize();

        if (itemAll.length > 0) {
            isInit = false;
            waterfallAppendLazy([...itemAll.map(item => item)], loadLastIndex);
        }

        let appendFn;
        if (lazy) {
            appendFn = function () {
                isInit && (contentsTimer = setTimeout(function () {
                    isInit = false;
                    waterfallAppendLazy([...itemAll.map(item => item)], loadLastIndex);
                }, 100))
            }
        } else {
            appendFn = function () {
                contentsTimer = setTimeout(function () {
                    isInit = false;
                    waterfallAppend([...itemAll.map(item => item)], loadLastIndex);
                }, 100)
            }
        }

        // if (loadedItems.length > 0) {
        //     !observerChild() && waterfallUpdate();
        // }

        observerChild();

        this.update = function (params) {
            waterfallUpdate(loadedItems, 0, params);
        };

        this.append = function (content) {
            clearTimeout(contentsTimer);
            itemAll.push(createItem(content));
            appendFn();
        };

        container.addEventListener('scroll', function (e) {
            if (container.scrollTop + container.offsetHeight >= container.scrollHeight * .9) {
                renderStart = true;
            }
        })
    };

    function createItem(content) {
        let waterfallItem = document.createElement('div');
        waterfallItem.className = 'waterfall-item';
        waterfallItem.innerHTML = content;
        return {
            index: itemAll.length,
            el: waterfallItem
        }
    }

    // 监听内容变化更新布局
    function observerChild() {
        if (window.MutationObserver) {
            mutationObserver = new MutationObserver(function (mutationsList, observer) {
                clearTimeout(observerTimer);
                observerTimer = setTimeout(function () {
                    waterfallUpdate();
                }, 300)
            }).observe(wrapper, {
                attributes: true,
                childList: true,
                subtree: true
            });
        } else {
            if (loadedItems.length > 0) {
                waterfallUpdate();
            }
        }
    }

    // 响应宽度
    function waterfallResize() {
        if (!resize) {
            return window.onresize = null;
        }
        window.onresize = handleResize;

        function handleResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeTimer = null;
                wrapWidth = wrapper.offsetWidth - gap * (column - 1);
                waterfallUpdate();
            }, 100);
        }
    }

    function waterfallAppendLazy(appendItems, startIndex = 0, endIndex = lazyLoadNum) {
        let obTimer = null,
            _appendItems = appendItems.slice(startIndex, endIndex),
            _appendItemsLength = _appendItems.length,
            num = 0;

        // 一
        // _appendItems.map(async (item, index) => {
        //     await appendItem(item);
        //     loadLastIndex++;
        //     if (index == _appendItems.length - 1) {
        //         endIndex = wrapper.querySelectorAll('.waterfall-item').length;
        //         let wrapperHeight = waterfallUpdate(appendItems, endIndex).wrapperHeight;
        //         if (wrapperHeight < container.offsetHeight * 1.2) { // 当前加载完毕，但内容高度不足以触发‘触底’事件
        //             obTimer = setInterval(() => {
        //                 if (itemAll.length > endIndex) {
        //                     clearInterval(obTimer);
        //                     renderStart = false;
        //                     waterfallAppendLazy(itemAll, endIndex, endIndex + lazyLoadNum);
        //                 }
        //             }, 100)
        //         } else {
        //             obTimer = setInterval(() => {
        //                 if (renderStart && itemAll.length > endIndex) {
        //                     clearInterval(obTimer);
        //                     renderStart = false;
        //                     waterfallAppendLazy(itemAll, endIndex, endIndex + lazyLoadNum);
        //                 }
        //             }, 100)
        //         }
        //     }
        // })

        // 二
        loopItems(_appendItems);
        async function loopItems(data) {
            if (data.length == 0) return;
            let item = data[0];
            await appendItem(item);
            loadLastIndex++;
            num++;
            let wrapperHeight = waterfallUpdate([item], item.index).wrapperHeight;
            // console.log(num , _appendItemsLength - 1);
            if (num == _appendItemsLength) {
                endIndex = wrapper.querySelectorAll('.waterfall-item').length;
                // console.log('wrapperHeight', wrapperHeight, container.offsetHeight);
                if (wrapperHeight < container.offsetHeight * 1.2) { // 当前加载完毕，但内容高度不足以触发‘触底’事件
                    obTimer = setInterval(() => {
                        if (itemAll.length > endIndex) {
                            clearInterval(obTimer);
                            renderStart = false;
                            waterfallAppendLazy(itemAll, endIndex, endIndex + lazyLoadNum);
                        }
                    }, 100)
                } else {
                    obTimer = setInterval(() => {
                        if (renderStart && itemAll.length > endIndex) {
                            clearInterval(obTimer);
                            renderStart = false;
                            waterfallAppendLazy(itemAll, endIndex, endIndex + lazyLoadNum);
                        }
                    }, 100)
                }
            } else {
                loopItems(data.splice(1));
            }
        }
    }

    function waterfallAppend(appendItems, startIndex = loadLastIndex) {
        let _appendItems = appendItems.slice(startIndex);

        loopItems(_appendItems);

        async function loopItems(data) {
            if (data.length == 0) return;
            let item = data[0];
            await appendItem(item);
            waterfallUpdate([item], item.index);
            loadLastIndex++;
            if (data.length > 1) {
                loopItems(data.splice(1));
            }
        }
    }

    // 追加内容
    function appendItem(item) {
        return new Promise(function (res, rej) {
            wrapper.appendChild(item.el);
            let fadeIn = fadeInInit([item], 100);
            let timer = setInterval(() => {
                if (item.el.offsetHeight) {
                    clearInterval(timer);
                    loadedItems.push(item);
                    fadeIn.start();
                    res(item);
                }
            }, 50)

            // await wrapper.appendChild(item.el);
            // let fadeIn = fadeInInit([item], 100);
            // loadedItems.push(item);
            // fadeIn.start();
            // res(item);
        })
    }

    // 淡入动画
    function fadeInInit(data, duration, callback) {
        let opacity = 0,
            translateY = gap,
            step = 10,
            time = 0,
            timer;
        data.forEach(function (item) {
            item.el.style.opacity = opacity;
            item.el.style.transform = 'translate3d(0, -' + translateY + 'px, 0)';
        })

        function fadeIn() {
            timer = setInterval(function () {
                time += duration / step;
                if (time >= duration) {
                    clearInterval(timer);
                    timer = null;
                    callback && callback(data);
                }
                opacity = opacity + 1 / step;
                translateY -= gap / step;
                data.forEach(function (item) {
                    item.el.style.opacity = opacity;
                    item.el.style.transform = 'translate3d(0, -' + translateY + 'px, 0)';
                })
            }, duration / step);

            return this;
        }

        return {
            start: fadeIn
        }
    }

    // 获取元素在布局中的位置
    function getWaterfallOffset(item) {
        let index = item.index,
            x = index % column,
            y = Math.floor(index / column),
            pTop = 0,
            pLeft = x * wrapWidth / column + gap * x;

        // console.log(item.index);

        if (y > 0) {
            let sibIndex = index;
            for (let i = 0; i < y; i++) {
                sibIndex -= column;
                pTop += itemAll[sibIndex].el.offsetHeight;
            }
            pTop += gap * y;
        }

        return {
            pTop,
            pLeft
        }
    }

    // 更新布局
    function waterfallUpdate(data = loadedItems, segIndex = 0, params) {
        if (params) {
            if (params.gap) {
                gap = params.gap;
                wrapWidth = wrapper.offsetWidth - gap * (column - 1);
            }
            if (params.column) {
                column = params.column;
                vertical = Math.ceil(data.length / column);
            }
            if (typeof params.resize === 'boolean') {
                if (params.resize && !resize) {
                    resize = true;
                    waterfallResize();
                } else if (params.resize === false) {
                    resize = false;
                    waterfallResize();
                }
            }
        }

        data.forEach(function (item, index) {
            let offset = getWaterfallOffset(item);
            let _wrapperHeight = offset.pTop + item.el.offsetHeight;
            wrapperHeight = _wrapperHeight > wrapperHeight ? _wrapperHeight : wrapperHeight;

            if (segIndex >= index || segIndex == 0) {
                item.el.style.overflow = 'hidden';
                item.el.style.position = 'absolute';
                item.el.style.transition = 'all .3s';
                item.el.style.width = wrapWidth / column + 'px';
                item.el.style.top = offset.pTop + 'px';
                item.el.style.left = offset.pLeft + 'px';
            }

        })
        wrapper.style.width = '100%';
        wrapper.style.height = wrapperHeight + 'px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.position = 'relative';

        return {
            wrapperHeight
        }
    }
})()
