import useCommon from 'src/useCommon'
import { useRecoilValue } from 'recoil'
import { userData } from 'src/store'
import { Card, Modal, message } from 'antd'
import 'src/style/src/userData.scss'

export default function UserData() {
  const {
    commonNotIncluded,
    formatTime,
    updateUserData,
    getUserData,
    deleteUserData,
    updateUserNotIncluded,
  } = useCommon()

  const user = useRecoilValue(userData)

  const onUserDataInput = (e: any, index: number) => {
    const files = e.target.files || e.dataTransfer.files
    const file = files[0]
    if (file.type !== 'application/json') {
      message.error('读取数据出错，请确认选择了游戏数据json文件')
      return
    }

    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      let newUserData: any = {}
      if (e.target && e.target.result) {
        newUserData = JSON.parse(e.target.result as string)
      }
      const newID = newUserData.data.player.id
      let newUserIndex = index

      user.forEach((userItem: any, currentIndex: number) => {
        if (userItem.data.player.id === newID) {
          // 说明该ID已经在数据库中了, 此时不是新增, 而应是更新
          newUserIndex = currentIndex
        }
      })

      // 写入indexed DB
      updateUserData(newUserIndex, newUserData)

      if (newUserIndex === -1) {
        // 不是新增用户数据的话，不必更新未收录数据
        updateUserNotIncluded(newUserIndex, {
          id: newUserData.data.player.id,
          value: commonNotIncluded,
        })
      }
    }
    fileReader.readAsText(file)
  }
  const delUser = (player: any) => {
    Modal.confirm({
      title: '提示',
      content: `确定删除 ${player.name} 吗? 删除数据不可恢复。`,
      onOk() {
        deleteUserData(player.id).then(() => {
          getUserData()
        })
      },
      onCancel() {},
    })
  }
  const calcDrawCount = (jade: number, amulet: number) => {
    const temp = Math.floor(jade / 1000) * 11 + amulet
    // 不足一千勾的零散勾玉
    let restJade = jade % 1000

    // 持有符咒和勾玉在商店按1000:11兑换的符咒之和
    let rest = Math.floor(temp)

    let sum = 0

    // 模拟抽卡
    do {
      // 抽数+1
      sum++
      // 余票-1
      rest--

      if (sum < 500 && sum % 50 === 0) {
        // 500 抽以内，每抽50抽会送5抽
        rest += 5

        if (sum === 300 || sum === 400) {
          // 第300抽、400抽会送1000勾即11票
          rest += 11
        }
      } else if (sum <= 1000 && sum % 100 === 0) {
        // 到达500抽后，每抽100抽会送10抽, 第500抽本身也是送10票的。
        rest += 10
        if (sum === 600 || sum === 800 || sum === 1000) {
          // 未算 600、800、1000抽各送500勾
          restJade += 500
          if (restJade >= 1000) {
            // 凑齐1000勾换算成11票
            restJade -= 1000
            sum += 11
          }
        }
      }
    } while (rest > 0)

    return sum
  }

  const cardHTML = user.map((userItem, index) => {
    return (
      <Card
        className="user-card"
        key={userItem.data.player.id | index}
        title={
          <div className="flex between card-title">
            <span>
              lv.{userItem.data.player.level}&nbsp;{userItem.data.player.name}
            </span>
            <div className="flex">
              <label htmlFor={`updateInput${index}`}>
                <span className="btn-update">更新</span>
              </label>
              &nbsp;&nbsp;
              <span
                className="btn-delete"
                onClick={() => delUser(userItem.data.player)}
              >
                删除
              </span>
            </div>
            <input
              id={`updateInput${index}`}
              type="file"
              className="display-none"
              accept="application/json"
              onChange={($event) => onUserDataInput($event, index)}
            />
          </div>
        }
      >
        <div className="resources">
          <div className="flex">
            <div className="resources-key">勾玉</div>
            <div className="resources-value">{userItem.data.currency.jade}</div>
          </div>
          <div className="flex">
            <div className="resources-key">蓝票</div>
            <div className="resources-value">
              {userItem.data.currency.mystery_amulet}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">紫票</div>
            <div className="resources-value">
              {userItem.data.currency.ar_amulet}
            </div>
          </div>
          <div className="flex">
            <div>
              预计有&nbsp;
              {calcDrawCount(
                userItem.data.currency.jade,
                userItem.data.currency.mystery_amulet +
                  userItem.data.currency.ar_amulet,
              )}
              &nbsp;抽
            </div>
          </div>
          <br />
          <div className="flex">
            <div className="resources-key">魂玉</div>
            <div className="resources-value">
              {userItem.data.currency.s_jade}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">金蛇皮</div>
            <div className="resources-value">
              {userItem.data.currency.reverse_scale}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">金币</div>
            <div className="resources-value">{userItem.data.currency.coin}</div>
          </div>
          <div className="flex">
            <div className="resources-key">体力</div>
            <div className="resources-value">
              {userItem.data.currency.action_point}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">樱饼</div>
            <div className="resources-value">
              {userItem.data.currency.auto_point}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">荣誉</div>
            <div className="resources-value">
              {userItem.data.currency.honor}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">皮肤券</div>
            <div className="resources-value">
              {userItem.data.currency.skin_token}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">SP皮肤券</div>
            <div className="resources-value">
              {userItem.data.currency.sp_skin_token}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">痴卷</div>
            <div className="resources-value">
              {userItem.data.currency.foolery_pass}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">御灵门票</div>
            <div className="resources-value">
              {userItem.data.currency.totem_pass}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">御札</div>
            <div className="resources-value">
              {userItem.data.currency.ofuda}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">金御札</div>
            <div className="resources-value">
              {userItem.data.currency.gold_ofuda}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">紫蛇皮</div>
            <div className="resources-value">
              {userItem.data.currency.scale}
            </div>
          </div>

          <br />
          <div className="flex start">
            <div className="resources-key">导出时间</div>
            <div className="resources-value date">
              {formatTime(new Date(userItem.timestamp), 'YYYY-MM-DD HH:mm')}
            </div>
          </div>
          <div className="flex">
            <div className="resources-key">用户ID</div>
            <div className="resources-value">{userItem.data.player.id}</div>
          </div>
        </div>
      </Card>
    )
  })

  return (
    <div className="page-user-data">
      <div>
        <div className="btn-add-user-data-wrap">
          <label htmlFor="userDataInput-1">
            <span className="ant-btn ant-btn-primary">新增</span>
          </label>
        </div>
        <input
          id="userDataInput-1"
          className="display-none"
          type="file"
          accept="application/json"
          onChange={($event) => onUserDataInput($event, -1)}
        />
      </div>

      <div className="flex wrap">{cardHTML}</div>
    </div>
  )
}
