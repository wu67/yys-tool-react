import { useState, useEffect } from 'react'
import { Tabs, Card, Spin, Tooltip } from 'antd'
import { useAtom } from 'jotai'
import { attrMapSelector, equipData, userSelector } from '@/store'
import { IEquipCustom, SubAttr, IEquipTypePrototype } from '@/interface'
import { clsx } from 'clsx'
import { transNumberToChinese, getAttrSum } from '@/utils'

export default function EquipAnalysis() {
  const [loading, setLoading] = useState(false)

  const getImageURL = function (suitCode: number) {
    return new URL(`/src/assets/suit_icon/${suitCode}.png`, import.meta.url)
      .href
  }

  const [equipList] = useAtom(equipData)
  const [attrMap] = useAtom(attrMapSelector)
  const [userList] = useAtom(userSelector)
  // 重点套装 版本之子
  const importantSuit = [
    300002, 300010, 300012, 300019, 300021, 300023, 300034, 300079, 300080,
  ]
  const [currentUser, setCurrentUser] = useState('0')

  interface suitData {
    name: string
    id: number
    position: suitPositionData[][]
  }
  interface suitPositionData {
    name?: string
    mainAttr: {
      type: string
      value: number
    }
    value: number
  }
  const [aData, setAData] = useState<suitData[]>([])
  // 散件速度计算
  const [scatteredSuit, setScatteredSuit] = useState<number[]>([])
  // 16满速个数统计
  const [fullCount, setFullCount] = useState(0)
  const [fullCount15, setFullCount15] = useState(0)
  const [fullCount17, setFullCount17] = useState(0)
  const [doubleSpeedPrototypeCount, setDoubleSpeedPrototypeCount] = useState(0)
  // 速度胚子个数
  const [speedPrototypeCount, setSpeedPrototypeCount] = useState(0)
  const initData = function (attrName = 'Speed') {
    let fullCount = 0
    let fullCount15 = 0
    let fullCount17 = 0
    setSpeedPrototypeCount(0)
    setDoubleSpeedPrototypeCount(0)
    setLoading(true)
    // 散件
    const scatteredSuitData: suitData = {
      name: '散件',
      id: -111,
      position: [[], [], [], [], [], []],
    }
    const temp = equipList.map((equip: IEquipTypePrototype) => {
      const finalEquipData: suitData = {
        ...equip,
        // 6个位置，按属性排序
        position: [[], [], [], [], [], []],
      }

      userList[parseInt(currentUser)].data.hero_equips.forEach(
        (item: IEquipCustom & SubAttr) => {
          if (item.suit_id === equip.id) {
            const sum = getAttrSum(item, attrName)

            if (
              (sum > 15 && item.pos !== 1) ||
              (sum > 57 + 15 && item.pos === 1)
            )
              fullCount15 = fullCount15 + 1
            if (
              (sum > 16 && item.pos !== 1) ||
              (sum > 57 + 16 && item.pos === 1)
            )
              fullCount = fullCount + 1
            if (
              (sum > 17 && item.pos !== 1) ||
              (sum > 57 + 17 && item.pos === 1)
            )
              fullCount17 = fullCount17 + 1

            if (
              item.level === 0 &&
              item['Speed'] &&
              item.randomAttrsLength === 4
            ) {
              if (item.pos !== 1) {
                setSpeedPrototypeCount(speedPrototypeCount + 1)
              }
              if (item.mainAttr.type === 'Speed') {
                setDoubleSpeedPrototypeCount(doubleSpeedPrototypeCount + 1)
              }
            }

            const tempMainAttr = JSON.parse(JSON.stringify(item.mainAttr))
            finalEquipData.position[item.pos].push({
              mainAttr: tempMainAttr,
              value: sum,
            })
            scatteredSuitData.position[item.pos].push({
              name: equip.name,
              mainAttr: tempMainAttr,
              value: sum,
            })
          }
        },
      )
      setFullCount(fullCount)
      setFullCount15(fullCount15)
      setFullCount17(fullCount17)

      for (const item of finalEquipData.position) {
        item.sort((a, b) => b.value - a.value)
      }

      for (const item of scatteredSuitData.position) {
        item.sort((a, b) => b.value - a.value)
      }
      return finalEquipData
    })

    scatteredSuitData.position = scatteredSuitData.position.map((p) => {
      return p.length > 4 ? p.slice(0, 4) : p
    })
    temp.unshift(scatteredSuitData)
    setAData(temp)
    // 散件总速度计算
    setScatteredSuit(
      scatteredSuitData.position.reduce((total: number[], current) => {
        total[0] = (current[0].value || 0) + (total[0] || 0)
        total[1] = (current[1].value || 0) + (total[1] || 0)
        total[2] = (current[2].value || 0) + (total[2] || 0)

        return total
      }, []),
    )
    setTimeout(function () {
      setLoading(false)
    }, 500)
  }
  useEffect(() => {
    if (userList.length > 0) {
      initData()
    }
  }, [userList, currentUser])

  const getColorClass = function (index: number, number: number) {
    if (
      (index !== 1 && number >= 17.5) ||
      (index === 1 && number >= 57 + 17.5)
    ) {
      return 'text-white font-medium bg-violet-700'
    } else if (
      (index !== 1 && number >= 17) ||
      (index === 1 && number >= 57 + 17)
    ) {
      return 'text-white font-medium bg-red-600'
    } else if (
      (index !== 1 && number > 16.5) ||
      (index === 1 && number > 57 + 16.5)
    ) {
      return 'text-white font-medium bg-orange-400'
    } else if (
      (index !== 1 && number > 15) ||
      (index === 1 && number > 57 + 15)
    ) {
      return 'text-white font-medium bg-teal-700'
    } else if (
      (index !== 1 && number > 13.5) ||
      (index === 1 && number > 57 + 13.5)
    ) {
      return 'bg-teal-100'
    }
  }

  return (
    <div className="mx-auto my-0 w-[1600px] pb-5 pl-4">
      <Tabs
        items={userList.map((user: any, userIndex: number) => {
          return {
            label: user.data.player.name,
            key: `${userIndex}`,
          }
        })}
        onTabClick={(key) => {
          setCurrentUser(key)
        }}
      ></Tabs>

      <div className="mb-1 flex items-center justify-center space-x-2">
        {scatteredSuit.map((suit: number, suitIndex: number) => {
          return (
            <div
              key={suitIndex}
              className="rounded-sm border border-solid border-gray-c px-1"
            >
              散件{transNumberToChinese(suitIndex + 1)}速:
              {suit.toFixed(3)}
            </div>
          )
        })}

        <div className="rounded-sm border border-solid border-gray-c px-1">
          满速17+: {fullCount17}个
        </div>
        <div className="rounded-sm border border-solid border-gray-c px-1">
          满速16+: {fullCount}个
        </div>
        <div className="rounded-sm border border-solid border-gray-c px-1">
          满速15+: {fullCount15}个
        </div>
        <div className="rounded-sm border border-solid border-gray-c px-1">
          双速胚子：{doubleSpeedPrototypeCount}个
        </div>
        <div className="rounded-sm border border-solid border-gray-c px-1">
          速度胚子：{speedPrototypeCount}个
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="items-center-wrap flex flex-wrap justify-start">
          {aData.map((equip: suitData, equipIndex: number) => {
            return (
              <Card
                styles={{
                  header: { padding: '0 0 0 7px' },
                  body: { padding: '20px 0 10px 7px' },
                }}
                className={`mb-2.5 mr-2 min-h-[140px] w-[149px] ${
                  importantSuit.indexOf(equip.id) !== -1
                    ? 'border-orange-200 bg-orange-100'
                    : ''
                }`}
                key={equipIndex}
                title={
                  <div className="flex items-center">
                    {equip.id > 0 && (
                      <img
                        src={getImageURL(equip.id)}
                        alt="equip-icon"
                        className="mr-1.5 h-8 w-8 rounded-full border-2 border-solid border-gray-c"
                      />
                    )}
                    <div>{equip.name}</div>
                  </div>
                }
              >
                {equip.position.map((p, pIndex) => {
                  return (
                    <div
                      className="mb-1"
                      key={pIndex}
                    >
                      <div className="flex items-center space-x-0.5">
                        <div>位置{transNumberToChinese(pIndex + 1)}&nbsp;</div>
                        {p.length > 0 && (
                          <div
                            className={clsx(
                              'flex min-w-11 items-center justify-center rounded px-1',
                              getColorClass(pIndex, p[0].value),
                            )}
                          >
                            <Tooltip
                              placement="top"
                              title={'主 ' + attrMap[`${p[0].mainAttr.type}`]}
                            >
                              {pIndex === 1 && p[0].value > 59
                                ? (p[0].value - 57).toFixed(2)
                                : pIndex !== 1 && p[0].value > 0
                                  ? p[0].value.toFixed(2)
                                  : ''}
                            </Tooltip>
                          </div>
                        )}
                        {p.length > 1 &&
                          ((pIndex !== 1 && p[1].value > 15) ||
                            (pIndex === 1 && p[1].value > 57 + 15)) && (
                            <Tooltip
                              title={
                                '2速 主' +
                                attrMap[`${p[1].mainAttr.type}`] +
                                ', ' +
                                (pIndex === 1
                                  ? (p[1].value - 57).toFixed(2)
                                  : p[1].value.toFixed(2)) +
                                '速'
                              }
                            >
                              <div
                                className={clsx(
                                  'rounded px-1',
                                  getColorClass(pIndex, p[1].value),
                                )}
                              >
                                &nbsp;&nbsp;
                              </div>
                            </Tooltip>
                          )}
                        {p.length > 2 &&
                          ((pIndex !== 1 && p[2].value > 15) ||
                            (pIndex === 1 && p[2].value > 57 + 15)) && (
                            <Tooltip
                              title={
                                '3速 主' +
                                attrMap[`${p[2].mainAttr.type}`] +
                                ', ' +
                                (pIndex === 1
                                  ? (p[2].value - 57).toFixed(2)
                                  : p[2].value.toFixed(2)) +
                                '速'
                              }
                            >
                              <div
                                className={clsx(
                                  'rounded px-1',
                                  getColorClass(pIndex, p[2].value),
                                )}
                              >
                                &nbsp;&nbsp;
                              </div>
                            </Tooltip>
                          )}
                      </div>
                    </div>
                  )
                })}
              </Card>
            )
          })}
        </div>
      </Spin>
    </div>
  )
}
