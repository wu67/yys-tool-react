export function transNumberToChinese(num: number) {
  return ['零', '一', '二', '三', '四', '五', '六', '七'][num]
}

export function multiply(value: number, ratio = 100) {
  return parseFloat((value * ratio).toPrecision(12))
}

// 计算单个御魂中某个属性的总值
export function getAttrSum(equip: any, attrName: string) {
  let sum = 0
  sum += equip[`${attrName}`] || 0

  // 主属性
  if (equip.mainAttr.type === attrName) {
    sum = sum + equip.mainAttr.value
  }
  // （首领魂）固定属性
  if (
    equip.single_attrs.length > 0 &&
    equip.single_attrs[0].type === attrName
  ) {
    sum = sum + equip.single_attrs[0].value
  }
  return sum
}
