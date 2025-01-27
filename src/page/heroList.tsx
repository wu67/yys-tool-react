import { useEffect, useState, useMemo } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { useAtom } from 'jotai'
import { Table, Checkbox, App } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import useCommon from '@/useCommon'
import { allHeroList, notIncludedListSelector, userData } from '@/store'
import { IBaseHero, IHero, hero_book_shards } from '@/interface'
import '@/style/src/heroList.scss'
import DialogSetNotIncluded from '@/components/dialogSetNotIncluded'

export default function HeroList() {
  const { message } = App.useApp()
  const { getNotIncluded, updateUserNotIncluded } = useCommon()
  const [heroList] = useAtom<IBaseHero[]>(allHeroList)
  const [notIncludedList] = useAtom(notIncludedListSelector)

  const [userList]: any[] = useAtom(userData)

  const rarityList = [
    {
      name: 'SP',
      value: 'SP',
    },
    {
      name: 'SSR',
      value: 'SSR',
    },
    {
      name: 'SR',
      value: 'SR',
    },
    {
      name: 'R',
      value: 'R',
    },
    {
      name: 'N',
      value: 'N',
    },
    {
      name: '素材',
      value: 'MATERIAL',
    },
    {
      name: '联动',
      value: 'INTERACTIVE',
    },
  ]

  const [shards, setShards] = useState([] as any[])

  const getShards = function () {
    interface IBaseHeroTableItem extends IHero {
      key: React.Key
    }

    const result = heroList
      .map((item: IBaseHero) => {
        const obj: IBaseHeroTableItem = {
          name: item.name,
          rarity: item.rarity,
          id: item.id,
          key: item.id,
          shards: [],
          included: [],
          have: [],
          required: 0,
          holdings: 0,
          bookMaxShards: 0,
        }
        // 联动
        if (item.interactive === true) {
          obj.interactive = true
        }

        userList.forEach((user: any, index: number) => {
          // 处理持有的碎片和召唤所需碎片数
          user.data.hero_book_shards.forEach((hero: hero_book_shards) => {
            if (obj.id === hero.hero_id) {
              obj.bookMaxShards = hero.book_max_shards
              obj.shards[index] = hero.shards
            }
          })

          obj.included[index] = !notIncludedList[index].includes(item.id)
          obj.have[index] = Array.from(
            new Set(user.data.heroes.map((item: any) => item.hero_id)),
          ).includes(item.id)
        })

        obj.holdings = obj.shards.reduce((sum, current) => {
          sum += current
          return sum
        }, 0)

        const notIncludedCount = obj.included.reduce((sum, current) => {
          // 检查收录状态，根据收录状态计算总需求量
          return current ? sum : ++sum
        }, 0)

        const temp = obj.bookMaxShards * notIncludedCount - obj.holdings
        obj.required = temp > 0 ? temp : '-'
        // obj.key = item.id
        return obj
      })
      .sort((a: IBaseHero, b: IBaseHero) => b.id - a.id)
    setShards(result)
  }
  const transformRarityName = function (rarity: string) {
    let result = ''
    rarityList.forEach((item) => {
      if (item.value === rarity) {
        result = item.name
      }
    })
    return result
  }

  const [checkList, setCheckList] = useState<string[]>(['SP', 'SSR'])

  const [isIndeterminate, setIsIndeterminate] = useState(true)
  const handleCheckAllChange = function (e: CheckboxChangeEvent) {
    setCheckAll(e.target.checked)
    setCheckList(e.target.checked ? rarityList.map((item) => item.value) : [])
    setIsIndeterminate(false)
  }

  const [checkAll, setCheckAll] = useState(false)
  const handleCheckedRarityChange = function (value: string[]) {
    setCheckList(value)
    setIsIndeterminate(value.length > 0 && value.length < rarityList.length)
  }

  const filterIncluded = function (value: any, row: any, index: number) {
    return value === row.included[index]
  }
  const filterHave = function (value: any, row: any, index: number) {
    return value === row.have[index]
  }

  const [currentEditNotIncludedUserIndex, setCurrentEditNotIncludedUserIndex] =
    useState(0)
  const [dialogSetNotIncludedVisible, setDialogSetNotIncludedVisible] =
    useState(false)

  const setNotIncluded = function (userIndex: number) {
    setCurrentEditNotIncludedUserIndex(userIndex)
    setDialogSetNotIncludedVisible(true)
  }

  const changeNotIncluded = function (newCheckedData: number[]) {
    updateUserNotIncluded(currentEditNotIncludedUserIndex, {
      id: userList[currentEditNotIncludedUserIndex].data.player.id,
      value: newCheckedData,
    })
      .then(() => {
        message.success(`设置未收录成功`)
      })
      .catch((e: Error) => {
        message.error(e.message || '设置未收录出错')
      })
  }

  useEffect(() => {
    getNotIncluded()
  }, [])
  useEffect(() => {
    if (notIncludedList.length) {
      getShards()
    }
  }, [notIncludedList])

  const shardsListView = useMemo(() => {
    let result = []
    if (checkList.indexOf('INTERACTIVE') !== -1) {
      result = shards.filter((item: IHero) => {
        return checkList.indexOf(item.rarity) !== -1 || item.interactive
      })
    } else {
      result = shards.filter((item: IHero) => {
        return (
          checkList.indexOf(item.rarity) !== -1 &&
          !(typeof item.interactive !== 'undefined')
        )
      })
    }
    return result
  }, [checkList, shards])

  const columns: ColumnsType<any> = [
    {
      dataIndex: 'id',
      title: '',
      width: 50,
      render: (_value, _row, index: number) => index + 1,
    },
    {
      dataIndex: 'id',
      title: 'ID',
      width: 80,
    },
    {
      dataIndex: 'name',
      title: '名称',
      width: 110,
    },
    {
      dataIndex: 'rarity',
      title: '稀有度',
      width: 80,
      render: (rarity, row) => {
        return (
          <div className={`rarity ${row.rarity}`}>
            {transformRarityName(rarity)}
          </div>
        )
      },
    },
  ]
  const userColumns: ColumnsType<any> = userList.map(
    (user: any, userIndex: number) => {
      const result = [
        {
          dataIndex: `shards${userIndex}`,
          title: '持有碎片',
          width: 110,
          render: (_value: any[], row: any) => row.shards[userIndex],
        },
        {
          dataIndex: `included${userIndex}`,
          title: '收录状态',
          width: 110,
          filters: [
            { text: '已收录', value: true },
            { text: '未收录', value: false },
          ],
          onFilter: (value: string, row: any) =>
            filterIncluded(value, row, userIndex),
          render: (_value: any[], row: any) => {
            return (
              <div className={row.included[userIndex] ? '' : 'not-included'}>
                {row.included[userIndex] ? '' : '未收录'}
              </div>
            )
          },
        },
        {
          dataIndex: `name${userIndex}`,
          title: '仓检',
          width: 110,
          filters: [
            { text: '仓库中有', value: true },
            { text: '仓库中无', value: false },
          ],
          onFilter: (value: string, row: any) =>
            filterHave(value, row, userIndex),
          render: (_value: any[], row: any) => {
            return (
              <div className={row.have[userIndex] ? '' : 'have-not'}>
                {row.have[userIndex] ? '' : '仓库中无'}
              </div>
            )
          },
        },
      ]
      const uColumn = {
        dataIndex: `userName${userIndex}`,
        children: result,
        title: () => {
          return (
            <div className="flex items-center justify-center">
              <div>{user.data.player.name}&nbsp;</div>
              <div
                className="btnSetNotIncluded"
                onClick={() => setNotIncluded(userIndex)}
              >
                设置未收录
              </div>
            </div>
          )
        },
      }

      return uColumn
    },
  )
  const columns2: ColumnsType<any> = [
    {
      dataIndex: 'name',
      title: '名称',
      width: 110,
    },
    {
      dataIndex: 'holdings',
      title: '共有碎片',
      width: 85,
    },
    {
      dataIndex: 'required',
      title: '仍缺',
      width: 80,
    },
  ]
  const tableColumn: ColumnsType<any> = columns.concat(userColumns, columns2)

  return (
    <div className="hero-list">
      {dialogSetNotIncludedVisible && (
        <DialogSetNotIncluded
          name={userList[currentEditNotIncludedUserIndex].data.player.name}
          heroList={heroList}
          notIncluded={notIncludedList[currentEditNotIncludedUserIndex]}
          setModalParentNotIncluded={changeNotIncluded}
          setModalParentVisible={setDialogSetNotIncludedVisible}
        ></DialogSetNotIncluded>
      )}
      <div
        className=""
        style={{ marginBottom: 8 }}
      >
        <div className="flex items-center">
          <div>主属性：</div>
          <Checkbox
            indeterminate={isIndeterminate}
            onChange={handleCheckAllChange}
            checked={checkAll}
          >
            全选
          </Checkbox>
        </div>
        <Checkbox.Group
          onChange={handleCheckedRarityChange}
          value={checkList}
          options={rarityList.map((attr) => {
            return {
              label: attr.name,
              value: attr.value,
            }
          })}
        ></Checkbox.Group>
      </div>
      <Table
        columns={tableColumn}
        dataSource={shardsListView}
        pagination={false}
        rowClassName={(_record, index: number) =>
          index % 2 === 1 ? 'table-row-zebra' : ''
        }
        size="small"
        bordered
      ></Table>
    </div>
  )
}
