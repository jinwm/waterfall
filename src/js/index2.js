(function () {
    let container = null,
        wrapper = null,
        wrapWidth = null,
		wrapperHeight = 0,
        items = [],
		contents = [],
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
			item.classList.add('append');
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
		
        // if (items.length > 0) {
        //     !observerChild() && waterfallUpdate();
        // }
		observerChild();

        // this.update = waterfallUpdate;
        // this.append = waterfallAppend;
		
		this.update = function(params){
			waterfallUpdate(items,params);
		};
        this.append = function(innerHtml){
			clearTimeout(appendTimer);
			contents.push(innerHtml);
			appendTimer = null;
			appendTimer = setTimeout(function () {
				waterfallAppend(contents);
				contents = [];
			}, 100)
		};
    };

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
        }else{
			if (items.length > 0) {
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

    // 追加内容
    function waterfallAppend(data) {
		let appendItems = data.map(function(content,index){
			let waterfallItem = document.createElement('div');
			waterfallItem.className = 'waterfall-item append';
			waterfallItem.innerHTML = content;
			return {
			    index,
			    el: waterfallItem
			}
		}),
		oldItemLength = 0;
		loopAppend(appendItems);
		
		function loopAppend(appendItems){
			let elFadeIn = fadeInInit([appendItems[0]], 100);
			wrapper.appendChild(appendItems[0].el);
			let timer = setInterval(function(){
				let newItemLength = wrapper.querySelectorAll('.waterfall-item.append').length;
				if(newItemLength > oldItemLength){
					clearInterval(timer);
					waterfallUpdate([appendItems[0]]);
					items.push(appendItems[0]);
					elFadeIn.fadeIn();
					oldItemLength++;
					if(appendItems.length>1){
						loopAppend(appendItems.splice(1));
					}else{
						items.forEach(function(item){
							item.el.classList.remove('append');
						})
					}
				}
			},0)
		}
    }

    // 淡入动画
    function fadeInInit(data, duration, callback) {
        let opacity = 0,
            translateY = gap,
            j = 10,
            time = 0,
            timer;
        data.forEach(function (item) {
            item.el.style.opacity = opacity;
            item.el.style.transform = 'translate3d(0, -' + translateY + 'px, 0)';
        })
		
		function fadeIn(){
			timer = setInterval(function () {
			    time += duration / j;
			    if (time >= duration) {
			        clearInterval(timer);
					timer = null;
			        callback && callback(data);
			    }
			    opacity = opacity + 1 / j;
			    translateY -= gap / j;
			    data.forEach(function (item) {
			        item.el.style.opacity = opacity;
			        item.el.style.transform = 'translate3d(0, -' + translateY + 'px, 0)';
			    })
			}, duration / j);
			
			return this;
		}
		
		return {fadeIn};
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
                sibIndex -= column;
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
    function waterfallUpdate(data,params) {
		data = data || items;
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
        data.forEach(function (item) {
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
