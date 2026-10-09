import { Bell, Gauge, History, Inbox, LayoutDashboard, Package, ReceiptText, ShoppingBag, Star, Truck, UserRound } from 'lucide-react';
import { Outlet, Navigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout.jsx';

const supplierItems = [
  { label: 'Dashboard', to: '/supplier', icon: LayoutDashboard, end: true },
  {
    section: 'Procurement Flow',
    items: [
      { label: '1. RFQ Sourcing Inbox', to: '/supplier/rfqs', icon: Inbox },
      { label: '2. My Bids', to: '/supplier/bids', icon: ReceiptText },
      { label: '3. Active Orders', to: '/supplier/orders', icon: Truck },
      { label: '4. Invoices', to: '/supplier/invoices', icon: ReceiptText },
    ],
  },
  {
    section: 'Account & History',
    items: [
      { label: 'Notifications', to: '/supplier/notifications', icon: Bell },
      { label: 'History', to: '/supplier/history', icon: History },
      { label: 'Profile', to: '/supplier/profile', icon: UserRound },
    ],
  },
];

export function SupplierLayout() {
  const storedUser = sessionStorage.getItem('srm_user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user || user.role !== 'supplier') {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout items={supplierItems} title="Supplier Portal" subtitle="Partner Workspace">
      <Outlet />
    </DashboardLayout>
  );
}
