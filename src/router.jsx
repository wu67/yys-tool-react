import { createHashRouter } from 'react-router-dom'
import App from 'src/App'
import ErrorPage from 'src/page/error-page'
import HeroList from 'src/page/heroList'
import EquipList from 'src/page/equipList'
import EquipAnalysis from 'src/page/equipAnalysis'
import UserData from 'src/page/userData'
import AboutThis from 'src/page/aboutThis'

const router = createHashRouter([
  {
    path: '/',
    element: <App></App>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: 'heroList',
        element: <HeroList></HeroList>,
      },
      {
        path: 'equipList',
        element: <EquipList></EquipList>,
      },
      {
        path: 'equipAnalysis',
        element: <EquipAnalysis></EquipAnalysis>,
      },
      {
        path: 'userData',
        element: <UserData></UserData>,
      },
      {
        path: 'aboutThis',
        element: <AboutThis></AboutThis>,
      },
      // react route 的默认路由无效; index设置无作用, 在app.tsx里面拦截又太繁琐(每遇到一个多层路由都得写一遍重定向逻辑, 更何况redirect方法也失效, 天坑)
      {
        path: '',
        element: <UserData></UserData>,
      },
    ],
  },
])

export default router
