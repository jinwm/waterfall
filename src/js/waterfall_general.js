// 瀑布流布局更加通用版本----兼容小程序、网页
const waterfall = ([...data], { columnWidth = 200, columnNum = 2, gap = 20 }) => {
  // 如果没有数据，直接返回空数组
  if (data.length === 0) return {
    wrapper: null, columns: [], data
  };

  // 初始化列数组
  const columns = Array.from({ length: columnNum }, () => []);

  /**
   * 获取当前高度最小的列索引
   * @returns {number} - 最小高度列的索引
   */
  function getMinColumnIndex() {
    let minIndex = 0;
    for (let i = 1; i < columns.length; i++) {
      if (totalHeight(columns[i]) < totalHeight(columns[minIndex])) {
        minIndex = i;
      }
    }
    return minIndex;
  }

  /**
   * 计算给定列中所有元素的高度总和
   * @param {Array} column - 列数组
   * @returns {number} - 高度总和
   */
  function totalHeight(column) {
    return column.reduce((acc, cur) => acc + (cur.height || 0), 0);
  }

  /**
   * 根据列索引计算新元素的位置
   * @param {number} columnIndex - 列索引
   * @returns {Object} - 包含left和top属性的对象
   */
  function calculatePosition(columnIndex, rowIndex) {
    const x = columnIndex * (columnWidth + gap) - gap;
    const y = totalHeight(columns[columnIndex]) + rowIndex * gap;
    return { x, y };
  }

  // 对每个元素进行布局
  data.forEach((item) => {
    const columnIndex = getMinColumnIndex();
    const rowIndex = columns[columnIndex].length;
    const { y, x } = calculatePosition(columnIndex, rowIndex);

    // 设置元素位置
    item.position = { columnIndex, rowIndex, x, y };

    // 将元素添加到对应的列中
    columns[columnIndex].push(item);
  });

  // 计算包装器尺寸
  const wrapper = {
    width: (columnWidth + gap) * columnNum - gap,
    height: Math.max(...columns.map(item => totalHeight(item) + gap)) - gap
  };

  return { wrapper, columns, data };
};
