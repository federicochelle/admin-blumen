import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShell from '../app/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from '../auth/ProtectedRoute'
import Audit from '../pages/Audit'
import Login from '../pages/Login'
import Plants from '../pages/Plants'
import Rooms from '../pages/Rooms'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/salas" replace />,
          },
          {
            path: 'salas',
            element: <Rooms />,
          },
          {
            path: 'plantas',
            element: <Plants />,
          },
          {
            path: 'auditoria',
            element: <Audit />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
])
