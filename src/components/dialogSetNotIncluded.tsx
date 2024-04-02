import { Modal, Transfer } from 'antd'
import { useEffect, useState } from 'react'
import type { TransferDirection } from 'antd/es/transfer'
import { IBaseHero } from '@/interface'
import '@/style/src/dialogSetNotIncluded.scss'

interface IProps {
  name: string
  heroList: IBaseHero[]
  notIncluded: number[]
  setModalParentVisible: React.Dispatch<React.SetStateAction<boolean>>
  setModalParentNotIncluded(arg: number[]): void
}
export default function DialogSetNotIncluded(props: IProps) {
  const [visible, setModalVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [notIncluded, setNotIncluded] = useState([] as string[])
  interface ITransferData {
    title: string
    key: string
    chosen?: boolean
    rarity?: string
  }
  const [transferData, setTransferData] = useState([] as ITransferData[])
  useEffect(() => {
    setModalVisible(true)
  }, [])
  useEffect(() => {
    setTitle(`设置未收录 - ${props.name}`)
    setTransferData(
      props.heroList.map((item) => {
        return {
          rarity: item.rarity,
          // 这个逻辑非常怪, 既要求要这个数据键名, 但又要在Transfer上写render属性, 不然直接显示空白...
          title: item.name,
          key: `${item.id}`,
          chosen: false,
        }
      }),
    )
    setNotIncluded(props.notIncluded.map((item) => `${item}`))
  }, [props])

  const handleOk = () => {
    props.setModalParentNotIncluded(notIncluded.map((item) => parseInt(item)))
    setModalVisible(false)
    props.setModalParentVisible(false)
  }

  const handleCancel = () => {
    setModalVisible(false)
    props.setModalParentVisible(false)
  }

  const onChange = (
    nextTargetKeys: React.Key[],
    direction: TransferDirection,
    moveKeys: React.Key[],
  ) => {
    console.log(moveKeys, 'moveKeys')
    setNotIncluded(nextTargetKeys.map(String))
  }

  const filterOption = (inputValue: string, option: ITransferData) => {
    return option.title.indexOf(inputValue) > -1 || inputValue === option.rarity
  }

  return (
    <div className="">
      <Modal
        className="dialog-set-not-included"
        open={visible}
        title={title}
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <Transfer
          dataSource={transferData}
          targetKeys={notIncluded}
          titles={['已收录', '未收录']}
          onChange={onChange}
          showSearch
          filterOption={filterOption}
          render={(record) => record.title}
        ></Transfer>
      </Modal>
    </div>
  )
}
