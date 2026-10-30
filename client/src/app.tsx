import { Route, Routes } from 'react-router-dom';

import ApiConsole from './pages/ApiConsole/ApiConsole';
import NotFound from './pages/NotFound/NotFound';
import StockLayout from './pages/stock/StockLayout';
import OverviewView from './pages/stock/views/OverviewView';
import ReserveView from './pages/stock/views/ReserveView';
import WipView from './pages/stock/views/WipView';

const RoutesComponent = () => (
  <Routes>
    <Route path="/" element={<StockLayout />}>
      <Route index element={<OverviewView />} />
      <Route path="wip" element={<WipView />} />
      <Route path="reserve" element={<ReserveView />} />
      <Route path="api-console" element={<ApiConsole />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default RoutesComponent;
