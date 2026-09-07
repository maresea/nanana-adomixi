import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Index from '../pages/Index';
import ClerkDashboard from '../pages/dashboard/ClerkDashboard';
import LeaderDashboard from '../pages/dashboard/LeaderDashboard';
import SpecialistDashboard from '../pages/dashboard/SpecialistDashboard';
import DocumentDetail from '../pages/documents/DocumentDetail';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Index />,
          },
          {
            path: 'clerk/dashboard',
            element: (
              <ProtectedRoute allowedRoles={['CLERK']} />
            ),
            children: [{ index: true, element: <ClerkDashboard /> }],
          },
          {
            path: 'leader/dashboard',
            element: (
              <ProtectedRoute allowedRoles={['LEADER']} />
            ),
            children: [{ index: true, element: <LeaderDashboard /> }],
          },
          {
            path: 'specialist/dashboard',
            element: (
              <ProtectedRoute allowedRoles={['SPECIALIST']} />
            ),
            children: [{ index: true, element: <SpecialistDashboard /> }],
          },
          {
            path: 'documents/:id',
            element: <DocumentDetail />,
          }
        ],
      },
    ],
  },
]);

