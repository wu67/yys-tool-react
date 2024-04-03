import { useEffect, useState } from 'react'
import type { MenuProps } from 'antd'
import { Menu, Spin } from 'antd'
import { useSetAtom } from 'jotai'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

import allHeroJSON from '@/assets/all_hero.json'
import damoJSON from '@/assets/damo.json'
import equipJSON from '@/assets/equip.json'
import { IBaseHero, IEquipTypePrototype } from '@/interface'
import { allHeroList, equipData } from '@/store'
import useCommon from '@/useCommon'
import './app.scss'

export default function App() {
  const updateHeroList = useSetAtom(allHeroList)
  const updateEquipData = useSetAtom(equipData)
  // 获取固定数据
  useEffect(() => {
    if (allHeroJSON) {
      const list = allHeroJSON.map((item) => {
        const result: IBaseHero = {
          name: item.name,
          rarity: item.level,
          id: item.id,
        }

        if (item.interactive) {
          result.interactive = true
        }
        return result
      })
      updateHeroList(list.concat(damoJSON))
    }
    let equipList: IEquipTypePrototype[] = []
    if (equipJSON) {
      equipList = equipJSON.map((item) => {
        return {
          id: item.id,
          // 个人理解的有效属性. 暂定为固定的几个属性.
          effectiveAttr: item.effectiveAttr,
          name: item.name,
        }
      })
    }
    updateEquipData(equipList)
  }, [updateHeroList, updateEquipData])

  const { getUserData } = useCommon()

  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getUserData().then(() => {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    })
  }, [])

  const [currentPage, setCurrentPage] = useState('')
  const menu = [
    {
      label: '碎片列表',
      key: 'heroList',
    },
    {
      label: '御魂列表',
      key: 'equipList',
    },
    {
      label: '御魂分析',
      key: 'equipAnalysis',
    },
    {
      label: '用户数据',
      key: 'userData',
    },
    {
      label: '关于',
      key: 'aboutThis',
    },
  ]
  const reactRouteLocation = useLocation()
  const nav = useNavigate()
  useEffect(() => {
    if (reactRouteLocation.pathname.length < 2) {
      // nav('/userData')
      return
    }
    let result = 'aboutThis'
    for (const item of menu) {
      if (reactRouteLocation.pathname.indexOf(item.key) !== -1) {
        result = item.key
      }
    }
    setCurrentPage(result)
  }, [reactRouteLocation])

  const onMenuSelect: MenuProps['onClick'] = (e) => {
    if (e.key) {
      setCurrentPage(e.key)
      nav(`/${e.key}`)
    }
  }

  return (
    <div className="layout-app">
      <div className="menu-wrap">
        <Menu
          items={menu}
          onClick={onMenuSelect}
          selectedKeys={[currentPage]}
          mode="horizontal"
          theme="light"
        ></Menu>
      </div>

      <Spin
        spinning={loading}
        size="large"
        tip="正在加载数据"
      >
        <div className="contain">{!loading && <Outlet></Outlet>}</div>
      </Spin>
    </div>
  )
}
