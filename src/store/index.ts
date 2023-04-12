import { atom, selector, DefaultValue } from 'recoil'
import util from '@/utils'
import {
  IBaseHero,
  IEquipTypePrototype,
  IEquipAttrPrototype,
  IEquip,
  SubAttr,
  IEquipCustom,
} from '@/interface'

// 装备数据
export const equipData = atom({
  key: 'equipData',
  default: [] as IEquipTypePrototype[],
})

export const equipMapSelector = selector({
  key: 'equipMapSelector',
  get: ({ get }) => {
    let result: { [x: string]: string } = {}
    get(equipData).forEach((item: IEquipTypePrototype) => {
      result[`${item.id}`] = item.name
    })
    return result
  },
})

export const allHeroList = atom({
  key: 'allHeroList',
  default: [] as IBaseHero[],
})

export const attrData = atom({
  key: 'attrData',
  default: [
    {
      key: 'Speed',
      name: '速度',
      nick: '速',
      minStep: 2.4,
      avgStep: 2.7,
      maxStep: 3,
    },
    {
      key: 'CritRate',
      name: '暴击',
      nick: '暴',
      minStep: 2.4,
      avgStep: 2.7,
      maxStep: 3,
    },
    {
      key: 'AttackRate',
      name: '攻击加成',
      nick: '攻',
      minStep: 2.4,
      avgStep: 2.7,
      maxStep: 3,
    },
    {
      key: 'CritPower',
      name: '暴击伤害',
      nick: '爆',
      minStep: 3.2,
      avgStep: 3.6,
      maxStep: 4,
    },
    {
      key: 'EffectHitRate',
      name: '效果命中',
      nick: '命',
      minStep: 3.2,
      avgStep: 3.6,
      maxStep: 4,
    },
    {
      key: 'EffectResistRate',
      name: '效果抵抗',
      nick: '抗',
      minStep: 3.2,
      avgStep: 3.6,
      maxStep: 4,
    },
    {
      key: 'HpRate',
      name: '生命加成',
      nick: '生',
      minStep: 2.4,
      avgStep: 2.7,
      maxStep: 3,
    },
    {
      key: 'DefenseRate',
      name: '防御加成',
      nick: '防',
      minStep: 2.4,
      avgStep: 2.7,
      maxStep: 3,
    },
    {
      key: 'Attack',
      name: '攻击',
      nick: '',
    },
    {
      key: 'Defense',
      name: '防御',
      nick: '',
    },
    {
      key: 'Hp',
      name: '生命',
      nick: '',
    },
  ],
})

export const attrMapSelector = selector({
  key: 'attrMapSelector',
  get: ({ get }) =>
    get(attrData).reduce(
      (
        result: {
          [x: string]: string
        },
        current: IEquipAttrPrototype,
      ) => {
        result[`${current.key}`] = current.name
        return result
      },
      {},
    ),
})

// 有效属性列表. 除去小攻击 小防御 小生命之外的均为有效
export const effectiveAttrSelector = selector({
  key: 'effectiveAttrSelector',
  get: ({ get }) => get(attrData).slice(0, 8),
})

export const notPercentAttr = atom({
  key: 'notPercentAttr',
  default: ['Speed', 'Attack', 'Defense', 'Hp'] as string[],
})

export const notIncludedList = atom({
  key: 'notIncludedList',
  default: [] as any[],
})

export const notIncludedListSelector = selector({
  key: 'notIncludedListSelector',
  get: ({ get }) => get(notIncludedList),
  // payload { index: num, value }. index: -1新增， -2整组替换，>-1目标值替换
  set: ({ get, set }, payload: any) => {
    let temp: number[] = Object.assign([], get(notIncludedList))
    if (payload.index === -1) {
      temp.push(payload.value)
    } else if (payload.index === -2) {
      temp = payload.value
    } else {
      temp[payload.index] = payload.value
    }

    set(notIncludedList, payload instanceof DefaultValue ? payload : temp)
  },
})

interface IUserData {
  data: any
  [x: string]: any
}

// 原始用户数据
export const userData = atom({
  key: 'userData',
  default: [] as IUserData[],
})

export const userSelector = selector({
  key: 'userSelector',
  // 经过处理的用户数据列表
  get: ({ get }) => {
    return get(userData).map((user: any) => {
      let newUser = JSON.parse(JSON.stringify(user))
      const notPercentAttrList: string[] = get(notPercentAttr)
      const equipDataList = get(equipData)
      const attrList: any[] = get(attrData)

      newUser.data.hero_equips = user.data.hero_equips.map((item: IEquip) => {
        const result: IEquipCustom & SubAttr = {
          ...item,
          id: item.id,
          single_attrs: [],
          born: item.born,
          level: item.level,
          pos: item.pos,
          quality: item.quality,
          suit_id: item.suit_id,
          // 副属性条数，俗称 腿
          randomAttrsLength: item.random_attrs.length || 0,
          mainAttr: {
            type: item.base_attr.type,
            value: 0,
          },
          effectAttrCount: 0,
        }
        const effectiveAttr = equipDataList.filter(
          (suit: any) => suit.id === item.suit_id,
        )[0].effectiveAttr
        // 处理副属性
        for (const rAttr of item.random_attrs) {
          if (notPercentAttrList.indexOf(rAttr.type) === -1) {
            result[`${rAttr.type}`] = util.multiply(rAttr.value)
          } else {
            result[`${rAttr.type}`] = rAttr.value
          }
          // 计算副属性的有效属性评分. 强化到几次就是几分. 直接用中位数摆烂了.
          if (effectiveAttr.indexOf(rAttr.type) !== -1) {
            const attr = attrList.filter((a: any) => a.key === rAttr.type)[0]

            result.effectAttrCount =
              result.effectAttrCount +
              Math.round((result[`${rAttr.type}`] || 0) / attr.avgStep)
          }
        }

        // 处理主属性
        if (notPercentAttrList.indexOf(item.base_attr.type) === -1) {
          result.mainAttr.value = util.multiply(item.base_attr.value)
        } else {
          result.mainAttr.value = item.base_attr.value
        }

        // 处理首领魂的固定属性 全是加成百分比属性. 当前版本最多只会有1条固定属性
        if (item.single_attrs.length > 0) {
          result.single_attrs.push({
            type: item.single_attrs[0].type,
            value: util.multiply(item.single_attrs[0].value),
          })
          // 御魂评分. 固定属性如果是有效属性, 算3分
          if (effectiveAttr.indexOf(item.single_attrs[0].type) !== -1) {
            result.effectAttrCount = result.effectAttrCount + 3
          }
        }

        return result
      })

      return newUser
    })
  },
  // payload { index: num, value }. index: -1新增， -2整组替换，>-1目标值替换
  set: ({ get, set }, payload: any) => {
    let newUser: any[] = Object.assign([], get(userData))
    if (payload.index === -1) {
      newUser.push(payload.value)
    } else if (payload.index === -2) {
      newUser = payload.value
    } else {
      newUser[payload.index] = payload.value
    }
    set(userData, payload instanceof DefaultValue ? payload : newUser)
  },
})
