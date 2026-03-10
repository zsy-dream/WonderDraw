import { createBrowserRouter, Outlet } from 'react-router-dom';
import GalleryPage from './pages/GalleryPage';
import WorkspacePage from './pages/WorkspacePage';
import DetailPage from './pages/DetailPage';
import ProgressPage from './pages/ProgressPage';
import TeacherPage from './pages/TeacherPage';
import FAQPage from './pages/FAQPage';
import NavBar from './components/NavBar';

// 布局组件：全局导航栏 + 页面内容
function Layout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <GalleryPage />,
      },
      {
        path: '/workspace',
        element: <WorkspacePage />,
      },
      {
        path: '/detail/:id',
        element: <DetailPage />,
      },
      {
        path: '/progress/:userId',
        element: <ProgressPage />,
      },
      {
        path: '/teacher',
        element: <TeacherPage />,
      },
      {
        path: '/faq',
        element: <FAQPage />,
      },
    ],
  },
]);

export default router;
