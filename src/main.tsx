import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import locale from 'antd/es/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import router from './router'

import '@/style/index.scss'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <ConfigProvider locale={locale} theme={{
    components: {
      Card: {
        headerHeight: 44
      }
    }
  }}>
    <RecoilRoot>
      <RouterProvider router={router}></RouterProvider>
    </RecoilRoot>
  </ConfigProvider>,
)
