import { RouterProvider } from 'react-router-dom';
import router from './router';
import { UserProvider } from './contexts/UserContext';
import { DemoProvider } from './contexts/DemoContext';
import DemoControlPanel from './components/DemoControlPanel';
import './index.css';

function App() {
  return (
    <DemoProvider>
      <UserProvider>
        <RouterProvider router={router} />
        <DemoControlPanel />
      </UserProvider>
    </DemoProvider>
  );
}

export default App;
