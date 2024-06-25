import { Checkbox, Select, Tabs, Table, Pagination } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { useAtom } from 'jotai'
import { useEffect, useState, useMemo } from 'react'
import useCommon from '@/useCommon'
import { transNumberToChinese, getAttrSum } from '@/utils'
import { IEquipAttrPrototype, IEquipCustom } from '@/interface'
import {
  attrMapSelector,
  effectiveAttrSelector,
  equipMapSelector,
  userSelector,
  attrData,
  equipData,
} from '@/store'
import '@/style/src/equipList.scss'

export default function EquipList() {
  const { formatTime } = useCommon()
  const [effectiveAttrList] = useAtom(effectiveAttrSelector)
  const [equipMap] = useAtom(equipMapSelector)
  const [equipDataList] = useAtom(equipData)
  const [attrMap] = useAtom(attrMapSelector)

  const transAttrToName = function (attr: string) {
    return attrMap[attr]
  }

  const [attrList] = useAtom(attrData)

  const [isIndeterminateAllAttr, setIsIndeterminateAllAttr] = useState(false)
  const [checkAllAttr, setCheckAllAttr] = useState(true)
  // 勾选全部属性change
  const handleCheckAllAttrChange = function (e: CheckboxChangeEvent) {
    setCheckAllAttr(e.target.checked)
    setCheckAttrList(
      e.target.checked
        ? attrList.map((item: IEquipAttrPrototype) => item.key)
        : [],
    )
    setIsIndeterminateAllAttr(false)
    setCurrentPage(1)
  }

  const [checkAttrList, setCheckAttrList] = useState<string[]>(
    attrList.map((item: IEquipAttrPrototype) => item.key),
  )
  // 单个属性被勾选change
  const handleCheckedAttrChange = function (value: string[]) {
    setCheckAttrList(value)
    setIsIndeterminateAllAttr(
      value.length > 0 && value.length < attrList.length,
    )
    setCurrentPage(1)
  }

  const checkListOrigin = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  const [checkLevelList, setCheckLevelList] = useState<number[]>(
    checkListOrigin.slice(),
  )
  const [isIndeterminateAllLevel, setIsIndeterminateAllLevel] = useState(false)
  const handleCheckAllLevelChange = function (e: CheckboxChangeEvent) {
    setCheckAllLevel(e.target.checked)
    setCheckLevelList(e.target.checked ? checkListOrigin.slice() : [])
    setIsIndeterminateAllLevel(false)
    setCurrentPage(1)
  }
  const [checkAllLevel, setCheckAllLevel] = useState(true)
  const handleCheckedLevelChange = function (value: number[]) {
    // setCheckAllLevel(16 === value.length)
    setCheckLevelList(value)
    setIsIndeterminateAllLevel(value.length > 0 && value.length < 16)
    setCurrentPage(1)
  }

  // 位置过滤相关
  const [checkAllPosition, setCheckAllPosition] = useState(true)
  const [isIndeterminateAllPosition, setIsIndeterminateAllPosition] =
    useState(false)
  const checkPositionOrigin = [0, 1, 2, 3, 4, 5]
  const [checkPositionList, setCheckPositionList] = useState<number[]>(
    checkPositionOrigin.slice(),
  )

  const handleCheckAllPositionChange = function (e: CheckboxChangeEvent) {
    setCheckAllPosition(e.target.checked)
    setCheckPositionList(e.target.checked ? checkPositionOrigin.slice() : [])
    setIsIndeterminateAllPosition(false)
    setCurrentPage(1)
  }
  const handleCheckedPositionChange = function (value: number[]) {
    setCheckPositionList(value)
    // setCheckAllPosition(6 === value.length)
    setIsIndeterminateAllPosition(value.length > 0 && value.length < 6)
    setCurrentPage(1)
  }
  // 这个change只用到了排序
  const onTableChange = function (
    _pagination: any,
    _filters: any,
    sorter: any,
  ) {
    // 无视分页, 没用到这个封装, 数据全部手动分页, 正经业务谁会select * from table 不limit啊, 想炒老板吗
    onTableSortChange({ prop: sorter.columnKey, order: sorter.order })
  }
  const onTableSortChange = function ({
    prop,
    order,
  }: {
    prop: string
    order: string
  }) {
    // 默认按 获得时间 排序
    let sortMethod = (a: IEquipCustom, b: IEquipCustom) => b.born - a.born

    if (order === 'descend') {
      // 从高到低
      sortMethod = (a, b) => getAttrSum(b, prop) - getAttrSum(a, prop)
    } else if (order === 'ascend') {
      // 从低到高
      sortMethod = (a, b) => getAttrSum(a, prop) - getAttrSum(b, prop)
    } else {
      // 此时order为空
    }
    if (prop === 'effectAttrCount') {
      if (order === 'descend') {
        sortMethod = (a, b) => b.effectAttrCount - a.effectAttrCount
      } else if (order === 'ascend') {
        sortMethod = (a, b) => a.effectAttrCount - b.effectAttrCount
      }
    }
    setList(list.slice().sort(sortMethod))
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  // 被过滤过的数据，未分页过的。
  const [list, setList] = useState([])

  const ifEquipUseless = function (count: number, level: number) {
    return (level === 0 && count <= 2) || (level === 15 && count <= 4)
  }

  const initPageSize = function () {
    const equipListPageSize = localStorage.getItem('equipListPageSize')
    if (equipListPageSize) {
      setPageSize(parseInt(equipListPageSize))
    } else {
      localStorage.setItem('equipListPageSize', `${pageSize}`)
    }
  }

  // 将数据分页。动辄上千行数据，全部渲染的话，会比较耗时
  const listView = useMemo(
    () =>
      list.length < pageSize
        ? list
        : list.slice(
            (currentPage - 1) * pageSize,
            list.length > currentPage * pageSize
              ? currentPage * pageSize
              : list.length,
          ),
    [list, currentPage, pageSize],
  )

  useEffect(() => {
    if (loaded) {
      setCurrentPage(1)
      localStorage.setItem('equipListPageSize', `${pageSize}`)
    }
  }, [pageSize])

  const [currentUser, setCurrentUser] = useState('0')

  const [checkEquipType, setCheckEquipType] = useState(0)
  const [randomAttrsLengthFilter, setRandomAttrsLengthFilter] = useState('')

  useEffect(() => {
    if (loaded) {
      generateList()
    }
  }, [
    currentUser,
    checkAllAttr,
    checkAttrList,
    checkAllLevel,
    checkLevelList,
    checkAllPosition,
    checkPositionList,
    checkEquipType,
    randomAttrsLengthFilter,
  ])

  const [userList] = useAtom(userSelector)
  const generateList = () => {
    if (!userList[parseInt(currentUser)]) return

    const tempList = userList[parseInt(currentUser)].data.hero_equips
      .filter((item: IEquipCustom) => {
        return (
          checkAttrList.indexOf(item.mainAttr.type) !== -1 &&
          item.quality === 6 &&
          checkLevelList.indexOf(item.level) !== -1 &&
          checkPositionList.indexOf(item.pos) !== -1 &&
          (checkEquipType > 0 ? checkEquipType === item.suit_id : true)
        )
      })
      .filter((item: IEquipCustom) => {
        if (randomAttrsLengthFilter === '1') {
          return item.randomAttrsLength === 4
        } else if (randomAttrsLengthFilter === '2') {
          return item.randomAttrsLength !== 4
        }
        return true
      })
      .sort((a: IEquipCustom, b: IEquipCustom) => b.born - a.born)
      .map((item: IEquipCustom, index: number) => {
        return Object.assign({}, item, { key: index })
      })

    setList(tempList)
  }
  const [loaded, setLoaded] = useState(false)
  // mount
  useEffect(() => {
    initPageSize()
    generateList()
    setLoaded(true)
  }, [])
  // 以下为html部分
  // 生成表格列.
  const columns: ColumnsType = [
    {
      dataIndex: 'pos',
      key: 'pos',
      title: '',
      width: 50,
      render: (_value, _row, index) => index + 1,
      fixed: 'left',
    },
    {
      dataIndex: 'pos',
      key: 'pos',
      title: '位置',
      width: 50,
      render: (pos: number) => <div>{transNumberToChinese(pos + 1)}</div>,
      fixed: 'left',
    },
    {
      dataIndex: 'level',
      key: 'level',
      title: '等级',
      width: 60,
      fixed: 'left',
    },
    {
      dataIndex: 'suit_id',
      key: 'suit_id',
      title: '御魂类型',
      width: 90,
      render: (i: string) => equipMap[`${i}`],
      fixed: 'left',
    },
    {
      dataIndex: 'mainAttr',
      key: 'mainAttr',
      width: 140,
      title: '主属性',
      render: (mainAttr: any, row: any) => (
        <div className="attr-name flex items-center">
          <div className="main">{transAttrToName(mainAttr.type)}</div>
          {row.single_attrs.length > 0 && (
            <div className="fixed-name">
              &nbsp;|&nbsp;{transAttrToName(row.single_attrs[0].type)}
            </div>
          )}
        </div>
      ),
      fixed: 'left',
    },
  ]
  const effectAttrColumns: ColumnsType = effectiveAttrList.map((attr) => {
    return {
      dataIndex: `${attr.key}`,
      key: `${attr.key}`,
      width: 125,
      title: `${attr.name}`,
      sorter: true,
      render: (_value: number, row: any) => {
        return (
          <div className="relative flex items-center">
            {pageSize > 20 && (
              <div className="attr-nick absolute">{attr.nick}</div>
            )}
            {row.mainAttr.type === attr.key && (
              <div className="attr-value main">{row.mainAttr.value}</div>
            )}
            {row[`${attr.key}`] && (
              <div className="attr-value random">
                {row.mainAttr.type === attr.key ? '+' : ''}
                {row[`${attr.key}`].toFixed(2)}
              </div>
            )}
            {row.single_attrs.length > 0 &&
              row.single_attrs[0].type === attr.key && (
                <div className="attr-value fixed-value">
                  +{row.single_attrs[0].value}
                </div>
              )}
          </div>
        )
      },
    }
  })

  const tableColumns: any[] = columns.concat(effectAttrColumns).concat([
    {
      dataIndex: 'effectAttrCount',
      key: 'effectAttrCount',
      width: 80,
      title: '收益',
      render: (value: number, row: any) => {
        const className = `${
          ifEquipUseless(row.effectAttrCount, row.level) ? 'useless' : ''
        }`
        return <div className={className}>{value}</div>
      },
      fixed: 'right',
      sorter: true,
    },
    {
      dataIndex: 'randomAttrsLength',
      key: 'randomAttrsLength',
      width: 45,
      title: '腿',
      fixed: 'right',
    },
    {
      dataIndex: 'born',
      key: 'born',
      width: 140,
      title: '获得时间',
      render: (born: number) => {
        return (
          <div className="born-time">
            {formatTime(
              new Date((born - new Date().getTimezoneOffset() * 60) * 1000),
              'YYYY-MM-DD HH:mm',
            )}
          </div>
        )
      },
      fixed: 'right',
    },
  ])

  return (
    <div className="page-equip-list">
      <div className="">
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
      </div>

      <div className="attr-filter-wrap flex items-center">
        <div>主属性：</div>
        <Checkbox
          indeterminate={isIndeterminateAllAttr}
          onChange={handleCheckAllAttrChange}
          checked={checkAllAttr}
        >
          全选
        </Checkbox>
        <Checkbox.Group
          onChange={handleCheckedAttrChange}
          value={checkAttrList}
          options={attrList.map((attr) => {
            return {
              label: attr.name,
              value: attr.key,
            }
          })}
        ></Checkbox.Group>
      </div>
      <div className="attr-filter-wrap flex items-center">
        <div>等级：</div>
        <Checkbox
          checked={checkAllLevel}
          indeterminate={isIndeterminateAllLevel}
          onChange={handleCheckAllLevelChange}
        >
          全选
        </Checkbox>
        <Checkbox.Group
          value={checkLevelList}
          onChange={handleCheckedLevelChange}
          options={checkListOrigin.map((item) => {
            return {
              label: `+${item}`,
              value: item,
            }
          })}
        ></Checkbox.Group>
      </div>
      <div className="attr-filter-wrap flex items-center">
        <div className="flex items-center">
          <div>位置：</div>
          <Checkbox
            indeterminate={isIndeterminateAllPosition}
            checked={checkAllPosition}
            onChange={handleCheckAllPositionChange}
          >
            全选
          </Checkbox>
          <Checkbox.Group
            value={checkPositionList}
            onChange={handleCheckedPositionChange}
            options={checkPositionOrigin.map((item) => {
              return {
                label: `${transNumberToChinese(item + 1)}号位`,
                value: item,
              }
            })}
          ></Checkbox.Group>
        </div>

        <div
          className="flex items-center"
          style={{ marginLeft: 60 }}
        >
          <div>种类：</div>
          <Select
            defaultValue={checkEquipType}
            value={checkEquipType}
            style={{ width: 100 }}
            onChange={setCheckEquipType}
            options={[
              { label: '全部', value: 0 },
              ...equipDataList.map((item) => {
                return {
                  label: item.name,
                  value: item.id,
                }
              }),
            ]}
          ></Select>
        </div>
        <div
          className="flex items-center"
          style={{ marginLeft: 40 }}
        >
          <div>副属性：</div>
          <Select
            value={randomAttrsLengthFilter}
            style={{ width: 100 }}
            onChange={setRandomAttrsLengthFilter}
            options={[
              {
                value: '',
                label: '全部',
              },
              {
                value: '1',
                label: '4腿',
              },
              {
                value: '2',
                label: '瘸腿',
              },
            ]}
          ></Select>
        </div>
      </div>
      <div>
        <Table
          dataSource={listView}
          columns={tableColumns}
          pagination={false}
          size="small"
          scroll={{ x: 1600 }}
          bordered
          onChange={onTableChange}
          rowClassName={(_record, index: number) =>
            index % 2 === 1 ? 'table-row-zebra' : ''
          }
        ></Table>
      </div>
      <div className="pagination-wrap flex items-center justify-center">
        <Pagination
          current={currentPage}
          defaultCurrent={currentPage}
          pageSize={pageSize}
          total={list.length}
          showTotal={(total: number) => `共 ${total} 项`}
          pageSizeOptions={[5, 10, 15, 20, 40, 100]}
          onChange={(page) => setCurrentPage(page)}
          onShowSizeChange={(_current, size) => setPageSize(size)}
        ></Pagination>
      </div>
    </div>
  )
}
