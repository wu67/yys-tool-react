import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import locale from 'antd/es/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import router from './router'

import 'src/style/index.scss'
import 'src/style/flex-custom.scss'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <ConfigProvider locale={locale}>
    <RecoilRoot>
      <RouterProvider router={router}></RouterProvider>
    </RecoilRoot>
  </ConfigProvider>,
)
