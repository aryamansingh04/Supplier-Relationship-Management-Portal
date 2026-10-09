import { Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { SupplierLayout } from '../layouts/SupplierLayout.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { ForgotPassword } from '../pages/auth/ForgotPassword.jsx';
import { AdminDashboard } from '../pages/admin/Dashboard.jsx';
import { SupplierManagement } from '../pages/admin/SupplierManagement.jsx';
import { SupplierDetail } from '../pages/admin/SupplierDetail.jsx';
import { RFQManagement } from '../pages/admin/RFQManagement.jsx';
import { RFQDetail } from '../pages/admin/RFQDetail.jsx';
import { BidComparison } from '../pages/admin/BidComparison.jsx';
import { PurchaseOrders } from '../pages/admin/PurchaseOrders.jsx';
import { GoodsReceiving } from '../pages/admin/GoodsReceiving.jsx';
import { AuditLogs } from '../pages/admin/AuditLogs.jsx';
import { AdminInvoices } from '../pages/admin/AdminInvoices.jsx';
import { SupplierDashboard } from '../pages/supplier/Dashboard.jsx';
import { SupplierRFQs } from '../pages/supplier/RFQs.jsx';
import { MyBids } from '../pages/supplier/MyBids.jsx';
import { SupplierOrders } from '../pages/supplier/Orders.jsx';
import { SupplierOrderHistory } from '../pages/supplier/OrderHistory.jsx';
import { SupplierInvoices } from '../pages/supplier/Invoices.jsx';
import { SupplierProfile } from '../pages/supplier/Profile.jsx';
import { Notifications } from '../pages/supplier/Notifications.jsx';
import { NegotiationRoom } from '../pages/NegotiationRoom.jsx';
import { NotFound } from '../pages/NotFound.jsx';
import { RootRedirect } from '../components/RootRedirect.jsx';


export const appRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <RootRedirect /> },
      { path: '/home', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPassword /> },

    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'suppliers', element: <SupplierManagement /> },
      { path: 'suppliers/:supplierId', element: <SupplierDetail /> },
      { path: 'rfqs', element: <RFQManagement /> },
      { path: 'rfqs/:id', element: <RFQDetail /> },
      { path: 'bids', element: <BidComparison /> },
      { path: 'bids/negotiate/:bidId', element: <NegotiationRoom /> },
      { path: 'orders', element: <PurchaseOrders /> },
      { path: 'receipts-reviews', element: <GoodsReceiving /> },
      { path: 'invoices', element: <AdminInvoices /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'audit-logs', element: <AuditLogs /> },
    ],
  },
  {
    path: '/supplier',
    element: <SupplierLayout />,
    children: [
      { index: true, element: <SupplierDashboard /> },
      { path: 'rfqs', element: <SupplierRFQs /> },
      { path: 'bids', element: <MyBids /> },
      { path: 'bids/negotiate/:bidId', element: <NegotiationRoom /> },
      { path: 'orders', element: <SupplierOrders /> },
      { path: 'invoices', element: <SupplierInvoices /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'history', element: <SupplierOrderHistory /> },
      { path: 'profile', element: <SupplierProfile /> },
    ],
  },
  { path: '*', element: <NotFound /> },
];

