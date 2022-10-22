// import useCommon from 'src/useCommon'
import { useState, useEffect } from 'react'
import { Tabs, Card, Spin, Tooltip } from 'antd'
import { useRecoilState, useRecoilValue } from 'recoil'
import { attrMapSelector, equipData, userSelector } from 'src/store'
import { IEquipCustom, SubAttr, IEquipTypePrototype } from 'src/interface'
import util from 'src/utils'
import 'src/style/src/equipAnalysis.scss'
import classnames from 'classnames'

export default function EquipAnalysis() {
  const transNumberToChinese = function (value: number) {
    return util.transNumberToChinese(value)
  }

  let [loading, setLoading] = useState(false)

  const getImageURL = function (suitCode: number) {
    // vite 用
    // return new URL(`/src/assets/suit_icon/${suitCode}.png`, import.meta.url).href
    return require(`/src/assets/suit_icon/${suitCode}.png`)
  }

  const [equipList] = useRecoilState(equipData)
  const attrMap = useRecoilValue(attrMapSelector)
  const [userList] = useRecoilState(userSelector)
  // 重点套装 版本之子
  const importantSuit = [
    300002, 300010, 300012, 300019, 300021, 300023, 300034, 300079, 300080,
  ]
  let [currentUser, setCurrentUser] = useState('0')

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
  let [aData, setAData] = useState<suitData[]>([])
  // 散件速度计算
  let [scatteredSuit, setScatteredSuit] = useState<number[]>([])
  // 16满速个数统计
  let [fullCount, setFullCount] = useState(0)
  let [fullCount15, setFullCount15] = useState(0)
  let [fullCount17, setFullCount17] = useState(0)
  let [doubleSpeedPrototypeCount, setDoubleSpeedPrototypeCount] = useState(0)
  // 速度胚子个数
  let [speedPrototypeCount, setSpeedPrototypeCount] = useState(0)
  const initData = function (attrName = 'Speed') {
    let fullCount = 0
    let fullCount15 = 0
    let fullCount17 = 0
    setSpeedPrototypeCount(0)
    setDoubleSpeedPrototypeCount(0)
    setLoading(true)
    // 散件
    let scatteredSuitData: suitData = {
      name: '散件',
      id: -111,
      position: [[], [], [], [], [], []],
    }
    let temp = equipList.map((equip: IEquipTypePrototype) => {
      const finalEquipData: suitData = {
        ...equip,
        // 6个位置，按属性排序
        position: [[], [], [], [], [], []],
      }

      userList[parseInt(currentUser)].data.hero_equips.forEach(
        (item: IEquipCustom & SubAttr) => {
          if (item.suit_id === equip.id) {
            let sum = util.getAttrSum(item, attrName)

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
                speedPrototypeCount += 1
              }
              if (item.mainAttr.type === 'Speed') {
                doubleSpeedPrototypeCount += 1
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

      for (let item of finalEquipData.position) {
        item.sort((a, b) => b.value - a.value)
      }

      for (let item of scatteredSuitData.position) {
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

  return (
    <div className="page-equip-analysis">
      <div className="content-top"></div>
      <Tabs
        items={userList.map((user: any, userIndex: number) => {
          return {
            label: user.data.player.name,
            key: userIndex,
          }
        })}
        onTabClick={(key) => {
          setCurrentUser(key)
        }}
      ></Tabs>

      <div className="flex center extendCountArea">
        {scatteredSuit.map((suit: number, suitIndex: number) => {
          return (
            <div key={suitIndex}>
              散件{transNumberToChinese(suitIndex + 1)}速:
              {suit.toFixed(3)}
            </div>
          )
        })}

        <div>满速17+: {fullCount17}个</div>
        <div>满速16+: {fullCount}个</div>
        <div>满速15+: {fullCount15}个</div>
        <div>双速胚子：{doubleSpeedPrototypeCount}个</div>
        <div>速度胚子：{speedPrototypeCount}个</div>
      </div>

      <Spin spinning={loading}>
        <div className="flex wrap">
          {aData.map((equip: suitData, equipIndex: number) => {
            return (
              <Card
                className={`equip-item ${
                  importantSuit.indexOf(equip.id) !== -1 ? 'important' : ''
                }`}
                key={equipIndex}
                title={
                  <div className="flex">
                    {equip.id > 0 && (
                      <img
                        src={getImageURL(equip.id)}
                        alt="equip-icon"
                        className="background"
                      />
                    )}
                    <div>{equip.name}</div>
                  </div>
                }
              >
                {equip.position.map((p, pIndex) => {
                  return (
                    <div className="position" key={pIndex}>
                      <div className="flex analysis-item">
                        <div>位置{transNumberToChinese(pIndex + 1)}&nbsp;</div>
                        {p.length > 0 && (
                          <div
                            className={classnames({
                              'analysis-value': true,
                              neck:
                                (pIndex !== 1 && p[0].value > 13.5) ||
                                (pIndex === 1 && p[0].value > 57 + 13.5),
                              full:
                                (pIndex !== 1 && p[0].value > 15) ||
                                (pIndex === 1 && p[0].value > 57 + 15),
                              rare:
                                (pIndex !== 1 && p[0].value > 16.5) ||
                                (pIndex === 1 && p[0].value > 57 + 16.5),
                              extreme:
                                (pIndex !== 1 && p[0].value >= 17) ||
                                (pIndex === 1 && p[0].value >= 57 + 17),
                              european:
                                (pIndex !== 1 && p[0].value >= 17.5) ||
                                (pIndex === 1 && p[0].value >= 57 + 17.5),
                            })}
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
                                className={classnames({
                                  'analysis-value': true,
                                  neck:
                                    (pIndex !== 1 && p[1].value > 13.5) ||
                                    (pIndex === 1 && p[1].value > 57 + 13.5),
                                  full:
                                    (pIndex !== 1 && p[1].value > 15) ||
                                    (pIndex === 1 && p[1].value > 57 + 15),
                                  rare:
                                    (pIndex !== 1 && p[1].value > 16.5) ||
                                    (pIndex === 1 && p[1].value > 57 + 16.5),
                                  extreme:
                                    (pIndex !== 1 && p[1].value >= 17) ||
                                    (pIndex === 1 && p[1].value >= 57 + 17),
                                  european:
                                    (pIndex !== 1 && p[1].value >= 17.5) ||
                                    (pIndex === 1 && p[1].value >= 57 + 17.5),
                                })}
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
                                className={classnames({
                                  'analysis-value': true,
                                  neck:
                                    (pIndex !== 1 && p[2].value > 13.5) ||
                                    (pIndex === 1 && p[2].value > 57 + 13.5),
                                  full:
                                    (pIndex !== 1 && p[2].value > 15) ||
                                    (pIndex === 1 && p[2].value > 57 + 15),
                                  rare:
                                    (pIndex !== 1 && p[2].value > 16.5) ||
                                    (pIndex === 1 && p[2].value > 57 + 16.5),
                                  extreme:
                                    (pIndex !== 1 && p[2].value >= 17) ||
                                    (pIndex === 1 && p[2].value >= 57 + 17),
                                  european:
                                    (pIndex !== 1 && p[2].value >= 17.5) ||
                                    (pIndex === 1 && p[2].value >= 57 + 17.5),
                                })}
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
