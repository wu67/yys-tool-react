import Dexie from 'dexie'
import { useState } from 'react'
import $dayjs from 'dayjs'
import { useSetRecoilState } from 'recoil'
import $db from './db'
import { userSelector, notIncludedListSelector } from '@/store'

export default function useCommon() {
  const db = $db
  const setUserByIndex = useSetRecoilState(userSelector)
  const setNotIncluded = useSetRecoilState(notIncludedListSelector)

  // 这个值永远也不需要被代码更新
  const [commonNotIncluded] = useState([
    387, 386, 373, 360, 359, 337, 336, 319, 313, 314, 310, 309, 308, 305, 294,
  ])
  let [stest, updateStest] = useState(0)

  const formatTime = (date: any, format = 'YYYY-MM-DD HH:mm:ss') => {
    let str = ''
    if (date) {
      str = $dayjs(date).format(format)
    }
    return str
  }
  const updateUserData = (index = -1, value: any) => {
    if (index === -1) {
      db.user.add({
        user_id: value.data.player.id,
        content: value,
      })
    } else {
      db.user.update(value.data.player.id, {
        user_id: value.data.player.id,
        content: value,
      })
    }
    setUserByIndex({
      index: index,
      value: value,
    })
  }
  const getUserData = () => {
    let result: any[] = []

    // if (Array.isArray(user) && user.length > 0) {
    //   return Promise.resolve(user)
    // }
    return db.user
      .each((user) => {
        result.push(user.content)
      })
      .then(() => {
        setUserByIndex({
          index: -2,
          value: result,
        })
        return result
      })
      .catch(() => {
        console.log('getUserData error')
      })
  }
  const deleteUserData = (id: number | string) => {
    let pArray = []
    if (id === 'all') {
      pArray = [db.user.clear(), db.not_included.clear()]
      return Promise.all(pArray)
    } else {
      pArray = [
        db.user.where({ user_id: id }).delete(),
        db.not_included.where({ user_id: id }).delete(),
      ]
      return Promise.all(pArray)
    }
  }
  const updateUserNotIncluded = (index = -1, data: any) => {
    let target = null
    if (index === -1) {
      target = db.not_included.add({
        user_id: data.id,
        content: Dexie.deepClone(data.value),
      })
    } else {
      target = db.not_included.update(data.id, {
        user_id: data.id,
        content: Dexie.deepClone(data.value),
      })
    }
    setNotIncluded({
      index: index,
      value: data.value,
    })
    return target
  }
  const getNotIncluded = () => {
    let result: number[][] = []
    return db.not_included
      .each((record: any) => {
        result.push(record.content)
      })
      .then(() => {
        setNotIncluded({
          index: -2,
          value: result,
        })
        return result
      })
  }
  return {
    stest,
    updateStest,
    db,
    commonNotIncluded,
    formatTime,
    updateUserData,
    getUserData,
    deleteUserData,
    updateUserNotIncluded,
    getNotIncluded,
  }
}
