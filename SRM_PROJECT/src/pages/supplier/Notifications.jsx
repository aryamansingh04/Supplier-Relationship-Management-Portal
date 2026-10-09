import { Bell, FileText, ShoppingCart, Star, AlertTriangle, CheckCircle, Info, FileCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';

const allNotifications = [
  {
    id: 1,
    category: 'sourcing',
    icon: 'FileText',
    iconColor: 'text-violet-600 bg-violet-50',
    title: 'New RFQ invitation: Precision CNC Aluminum Housings',
    body: 'You have been invited to submit a bid. Deadline: Jun 10, 2026.',
    time: '12 min ago',
    read: false,
    type: 'Business',
  },
  {
    id: 2,
    category: 'orders',
    icon: 'ShoppingCart',
    iconColor: 'text-blue-600 bg-blue-50',
    title: 'PO-88021 shipment document requested',
    body: 'Apex Industrial Components requires your shipping documentation by Jun 3.',
    time: '1 hr ago',
    read: false,
    type: 'Action Required',
  },
  {
    id: 3,
    category: 'orders',
    icon: 'AlertTriangle',
    iconColor: 'text-rose-600 bg-rose-50',
    title: 'PO-88018 delivery overdue',
    body: 'Expected delivery date was May 20, 2026. Please update your shipment status immediately.',
    time: '3 hr ago',
    read: false,
    type: 'Alert',
  },
  {
    id: 4,
    category: 'performance',
    icon: 'Star',
    iconColor: 'text-amber-600 bg-amber-50',
    title: 'Quarterly scorecard available for review',
    body: 'Your Q1 2026 performance scorecard has been published. Review your scores and feedback.',
    time: '5 hr ago',
    read: false,
    type: 'Business',
  },
  {
    id: 5,
    category: 'sourcing',
    icon: 'CheckCircle',
    iconColor: 'text-emerald-600 bg-emerald-50',
    title: 'Bid accepted — RFQ-24049',
    body: 'Congratulations! Your bid for Industrial Fasteners has been accepted. A purchase order will follow shortly.',
    time: 'Yesterday',
    read: true,
    type: 'Business',
  },
  {
    id: 6,
    category: 'system',
    icon: 'Info',
    iconColor: 'text-slate-600 bg-slate-100',
    title: 'System maintenance scheduled',
    body: 'The SRM portal will be under maintenance on Jun 1, 2026 from 2–4 AM IST.',
    time: '2 days ago',
    read: true,
    type: 'System',
  },
  {
    id: 7,
    category: 'orders',
    icon: 'CheckCircle',
    iconColor: 'text-emerald-600 bg-emerald-50',
    title: 'PO-88015 marked as delivered',
    body: 'Vector Packaging Co. has confirmed receipt of your delivery for PO-88015.',
    time: '3 days ago',
    read: true,
    type: 'Business',
  },
];

const categories = ['All', 'Sourcing', 'Orders', 'Performance', 'System'];
const typeColors = {
  'Action Required': 'bg-rose-50 text-rose-700 ring-rose-600/20',
  'Alert': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Business': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'System': 'bg-slate-100 text-slate-700 ring-slate-600/20',
};

export function Notifications() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('srm_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(Boolean).map(n => {
            if (n && n.icon && typeof n.icon === 'object' && !n.icon.$$typeof) {
              const { icon, ...rest } = n;
              return rest;
            }
            return n;
          });
          localStorage.setItem('srm_notifications', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch (err) {
      console.warn('Failed to parse notifications from localStorage:', err);
    }
    return allNotifications;
  });

  const loadNotifications = () => {
    try {
      const saved = localStorage.getItem('srm_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(Boolean).map(n => {
            if (n && n.icon && typeof n.icon === 'object' && !n.icon.$$typeof) {
              const { icon, ...rest } = n;
              return rest;
            }
            return n;
          });
          setNotifications(cleaned);
          return;
        }
      }
    } catch (err) {
      console.warn(err);
    }
    setNotifications(allNotifications);
  };

  useEffect(() => {
    window.addEventListener('storage', loadNotifications);
    window.addEventListener('srm_notifications_updated', loadNotifications);
    return () => {
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('srm_notifications_updated', loadNotifications);
    };
  }, []);

  const filtered = notifications.filter(
    (n) => n && (activeCategory === 'All' || (n.category || 'system').toLowerCase() === activeCategory.toLowerCase())
  );
  const unreadCount = notifications.filter((n) => n && !n.read && !n.is_read).length;

  const markAllRead = () => {
    const updated = notifications.map((n) => n ? { ...n, read: true, is_read: true } : n);
    setNotifications(updated);
    localStorage.setItem('srm_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('srm_notifications_updated'));
  };

  const markRead = (id) => {
    const updated = notifications.map((n) => n && n.id === id ? { ...n, read: true, is_read: true } : n);
    setNotifications(updated);
    localStorage.setItem('srm_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('srm_notifications_updated'));
  };

  return (
    <>
      <PageHeader title="Notifications" description="System alerts, business updates, and action items from your procurement network." />

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </span>
          }
          subtitle="Stay updated on RFQs, orders, performance, and system events"
          action={
            unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
              >
                Mark all as read
              </button>
            )
          }
        />

        {/* Category filter */}
        <div className="flex gap-1 border-b border-slate-100 px-5 py-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
              <Bell className="h-8 w-8 opacity-30" />
              <p className="text-sm">No notifications in this category</p>
            </div>
          )}
          {filtered.map((notif) => {
            if (!notif) return null;
            const iconMap = { Bell, FileText, ShoppingCart, Star, AlertTriangle, CheckCircle, Info, FileCheck };
            const rawIcon = notif.icon || notif.iconName;
            
            let IconComponent = Bell;
            if (typeof rawIcon === 'string') {
              IconComponent = iconMap[rawIcon] || Bell;
            } else if (rawIcon && (typeof rawIcon === 'function' || (typeof rawIcon === 'object' && rawIcon.$$typeof))) {
              IconComponent = rawIcon;
            }
            
            const iconColor = notif.iconColor || 'text-blue-600 bg-blue-50';
            const type = notif.type || 'System';
            const body = notif.body || notif.description || '';
            const isRead = notif.read || notif.is_read;

            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60 ${
                  !isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <span className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconColor}`}>
                  <IconComponent className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className={`text-sm ${isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${typeColors[type] || 'bg-slate-100 text-slate-700 ring-slate-600/20'}`}>
                        {type}
                      </span>
                      {!isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">{body}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{notif.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
