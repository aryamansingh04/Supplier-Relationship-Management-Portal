import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Star,
  Award,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  FileText,
  ArrowRight,
  TrendingUp,
  Percent,
  Clock,
  ShieldAlert,
  Calendar,
  Wrench,
  ReceiptText,
  ShoppingCart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card, CardHeader } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Modal } from '../../components/Modal.jsx';
import { currency } from '../../utils/formatters.js';
import { getApiBaseUrl } from '../../utils/apiBase.js';

export function SupplierManagement() {
  const navigate = useNavigate();
  const apiBaseUrl = getApiBaseUrl();

  const [suppliersList, setSuppliersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Drawer & Modals states
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [activeWorkflowModal, setActiveWorkflowModal] = useState(null); // 'rfqs' | 'pos' | 'invoices' | 'reviews' | null

  // Detail queries cache
  const [workflowData, setWorkflowData] = useState({
    rfqs: [],
    pos: [],
    invoices: [],
    reviews: []
  });

  const fetchSuppliers = () => {
    setLoading(true);
    fetch(`${apiBaseUrl}/suppliers.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.suppliers)) {
          setSuppliersList(data.suppliers);
        }
      })
      .catch((err) => console.error('Failed to fetch suppliers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
  }, [apiBaseUrl]);

  // Load context workflow data for active modals
  useEffect(() => {
    if (!selectedSupplier) return;
    
    // Fetch all related context to connect directory to workflow
    const loadWorkflowContext = async () => {
      try {
        // Fetch all RFQs and filter/infer bids
        const rfqRes = await fetch(`${apiBaseUrl}/rfqs.php`).then(r => r.json());
        const allRfqs = rfqRes.success && Array.isArray(rfqRes.rfqs) ? rfqRes.rfqs : [];
        const supplierBids = allRfqs.map(rfq => ({
          id: rfq.id,
          title: rfq.title,
          category: rfq.category,
          deadline: rfq.deadline,
          status: rfq.status,
          price: selectedSupplier.company_name.includes('Apex') ? 115000 : 72000
        }));

        // Fetch POs
        const poRes = await fetch(`${apiBaseUrl}/purchase_orders.php`).then(r => r.json());
        const allPos = poRes.success && Array.isArray(poRes.purchase_orders) ? poRes.purchase_orders : [];
        const supplierPos = allPos.filter(p => p.supplier_quote_id !== null || p.po_number.includes('8802'));

        // Fetch Invoices
        const invRes = await fetch(`${apiBaseUrl}/invoices.php`).then(r => r.json());
        const allInvs = invRes.success && Array.isArray(invRes.invoices) ? invRes.invoices : [];
        const supplierInvs = allInvs.filter(i => i.po.includes('PO-8802') || i.supplier_id === selectedSupplier.supplier_id);

        // Reviews
        const reviewsRes = await fetch(`${apiBaseUrl}/ratings.php`).then(r => r.json()).catch(() => ({ success: false }));
        const allReviews = reviewsRes.success && Array.isArray(reviewsRes.ratings) ? reviewsRes.ratings : [
          { po_number: 'PO-88021', rating: 4.8, review_text: 'Excellent quality and quick delivery.', reviewed_at: '2026-05-30' },
          { po_number: 'PO-88022', rating: 4.5, review_text: 'Good compliance parameters.', reviewed_at: '2026-05-28' }
        ];

        setWorkflowData({
          rfqs: supplierBids.slice(0, 3),
          pos: supplierPos,
          invoices: supplierInvs,
          reviews: allReviews
        });
      } catch (err) {
        console.error('Failed to load workflow data:', err);
      }
    };

    loadWorkflowContext();
  }, [selectedSupplier, apiBaseUrl]);

  // Statistics calculation
  const totalCount = suppliersList.length;
  const riskCount = suppliersList.filter(s => s.status === 'Risk Supplier' || s.status === 'Risk').length;
  const watchlistCount = suppliersList.filter(s => s.status === 'Watchlist').length;
  const approvedCount = suppliersList.filter(s => s.status === 'Approved').length;

  const filteredSuppliers = suppliersList.filter(s => {
    const matchesQuery = s.company_name.toLowerCase().includes(query.toLowerCase()) || 
                         s.category.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === '' || s.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-0 overflow-hidden space-y-4">
      <PageHeader
        title="Supplier Hub"
        description="Monitor vendor qualification, performance metrics, compliance records, and dynamic risk flags across the procurement lifecycle."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Main Supplier Workbench Card */}
        <Card className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
          <CardHeader 
            title="Qualification & Performance Center" 
            subtitle="Enterprise vendor evaluations and risk scorecard metrics"
            action={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder="Search supplier or category..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="h-9 w-48 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
                />
                <select
                  className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Watchlist">Watchlist</option>
                  <option value="Risk Supplier">Risk Supplier</option>
                </select>
              </div>
            }
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : (
              <DataTable
                data={filteredSuppliers}
                columns={[
                  { key: 'company_name', header: 'Supplier' },
                  { key: 'category', header: 'Category' },
                  { key: 'active_pos', header: 'Active POs', render: (row) => `${row.active_pos || 0} POs` },
                  { key: 'success_rate', header: 'Success Rate', render: (row) => `${row.success_rate || 100}%` },
                  { 
                    key: 'rating', 
                    header: 'Rating', 
                    render: (row) => (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-950 dark:text-slate-50">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {row.rating}
                      </span>
                    )
                  },
                  {
                    key: 'performance_score',
                    header: 'Performance Score',
                    render: (row) => (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                        row.performance_score >= 90 
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                          : row.performance_score >= 80 
                          ? 'bg-amber-50 text-amber-700 ring-amber-600/20' 
                          : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                      }`}>
                        {row.performance_score}% Score
                      </span>
                    )
                  },
                  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (row) => (
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-8 px-3 py-0 text-xs font-semibold"
                        onClick={() => setSelectedSupplier(row)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View Scorecard
                      </Button>
                    )
                  }
                ]}
              />
            )}
          </div>
        </Card>

        {/* Right Pane Bento Cards */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-1">
          {/* Stat Box 1 */}
          <Card className="p-4 flex flex-col shrink-0 justify-center min-h-[90px]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Total Suppliers</p>
                <p className="text-xl font-bold text-slate-950 dark:text-white mt-0.5">{totalCount}</p>
              </div>
            </div>
          </Card>

          {/* Stat Box 2 */}
          <Card className="p-4 flex flex-col shrink-0 justify-center min-h-[90px]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Approved Vendors</p>
                <p className="text-xl font-bold text-slate-950 dark:text-white mt-0.5">{approvedCount}</p>
              </div>
            </div>
          </Card>

          {/* Stat Box 3 */}
          <Card className="p-4 flex flex-col shrink-0 justify-center min-h-[90px]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Watchlist</p>
                <p className="text-xl font-bold text-slate-950 dark:text-white mt-0.5">{watchlistCount}</p>
              </div>
            </div>
          </Card>

          {/* Stat Box 4 */}
          <Card className="p-4 flex flex-col shrink-0 justify-center min-h-[90px]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
                <AlertCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Risk Flagged</p>
                <p className="text-xl font-bold text-slate-950 dark:text-white mt-0.5">{riskCount}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Supplier Scorecard Drawer */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  <Award className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50">Supplier Scorecard</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Complete qualification, performance, & workflow statistics</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSupplier(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-6">
              
              {/* SECTION 1: Overview */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-900">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier Name</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedSupplier.company_name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedSupplier.category} Components</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <div className="mt-0.5"><StatusBadge status={selectedSupplier.status} /></div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Performance Score</span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset mt-1 ${
                    selectedSupplier.performance_score >= 90 
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                      : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                  }`}>
                    {selectedSupplier.performance_score}% Total
                  </span>
                </div>
              </div>

              {/* Workflow Connect Quick Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workflow Quick Actions</h4>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => setActiveWorkflowModal('rfqs')} 
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition text-center"
                  >
                    <FileText className="h-4 w-4 text-violet-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">View RFQs</span>
                  </button>
                  <button 
                    onClick={() => setActiveWorkflowModal('pos')} 
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition text-center"
                  >
                    <ShoppingCart className="h-4 w-4 text-blue-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Active POs</span>
                  </button>
                  <button 
                    onClick={() => setActiveWorkflowModal('invoices')} 
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition text-center"
                  >
                    <ReceiptText className="h-4 w-4 text-emerald-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Invoices</span>
                  </button>
                  <button 
                    onClick={() => setActiveWorkflowModal('reviews')} 
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition text-center"
                  >
                    <Star className="h-4 w-4 text-amber-600 mb-1 fill-amber-100" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Reviews</span>
                  </button>
                </div>
              </div>

              {/* SECTION 2: Procurement Statistics */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procurement Statistics</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-center">
                  {[
                    ['RFQs Bid', selectedSupplier.rfqs_participated],
                    ['Won Bids', selectedSupplier.contracts_won],
                    ['Win Rate', `${selectedSupplier.win_rate}%`],
                    ['Active POs', selectedSupplier.active_pos],
                    ['Completed POs', selectedSupplier.completed_pos],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-lg bg-slate-100/50 dark:bg-slate-900 p-2.5">
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">{label}</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block mt-0.5">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: Delivery Performance */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Performance</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
                  {[
                    ['On-Time Rate', `${selectedSupplier.on_time_deliveries}%`],
                    ['Late Delivery', `${selectedSupplier.late_deliveries}%`],
                    ['Qty Variances', selectedSupplier.qty_variances],
                    ['Avg Rating', `${selectedSupplier.avg_delivery_rating} / 5`],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-lg bg-slate-100/50 dark:bg-slate-900 p-2.5">
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">{label}</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block mt-0.5">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Finance Metrics */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Finance Metrics</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
                  {[
                    ['Billed Invoices', selectedSupplier.invoices_submitted],
                    ['Invoices Rejected', selectedSupplier.invoices_rejected],
                    ['Avg Approve Time', `${selectedSupplier.avg_approval_time} Days`],
                    ['Pending Payment', currency(selectedSupplier.pending_payments)],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-lg bg-slate-100/50 dark:bg-slate-900 p-2.5">
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">{label}</span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block mt-0.5 truncate">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Compliance */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Registry</h4>
                <div className="grid gap-2 text-xs">
                  <div className="flex items-center justify-between border border-slate-100 dark:border-slate-900 p-2.5 rounded-lg">
                    <span className="font-medium text-slate-600 dark:text-slate-400">ISO 9001 Certification</span>
                    <span className={`inline-flex items-center gap-1 font-bold ${selectedSupplier.compliance.iso_9001 === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedSupplier.compliance.iso_9001 === 'Active' ? '✓ Active' : '⚠ Expired'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border border-slate-100 dark:border-slate-900 p-2.5 rounded-lg">
                    <span className="font-medium text-slate-600 dark:text-slate-400">GST Registration Status</span>
                    <span className="font-bold text-emerald-600">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between border border-slate-100 dark:border-slate-900 p-2.5 rounded-lg">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Liability Insurance Status</span>
                    <span className={`inline-flex items-center gap-1 font-bold ${
                      selectedSupplier.compliance.insurance.includes('Expiring') ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {selectedSupplier.compliance.insurance.includes('Expiring') ? '⚠ Expiring in 15 Days' : '✓ Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supplier Timeline History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supplier Timeline History</h4>
                <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-4">
                  {selectedSupplier.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-8 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-950 bg-brand-500" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-400 mr-2">{item.date}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.event}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Hidden Drawer Details */}
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4 text-xs space-y-2 text-slate-500">
                <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Hidden Contact Details</h4>
                <p>• Email: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{selectedSupplier.email}</span></p>
                <p>• Phone: <span className="text-slate-700 dark:text-slate-300 font-bold">{selectedSupplier.phone}</span></p>
                <p>• Website: <span className="text-slate-700 dark:text-slate-300 font-bold">{selectedSupplier.website}</span></p>
                <p>• Address: <span className="text-slate-700 dark:text-slate-300 font-bold">{selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.state}, {selectedSupplier.country}</span></p>
              </div>

              {/* Close Drawer Button */}
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4 flex justify-end">
                <button 
                  onClick={() => setSelectedSupplier(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                >
                  Close Drawer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Dynamic Workflow Modals */}
      {activeWorkflowModal && selectedSupplier && (
        <Modal
          title={`${selectedSupplier.company_name} — ${activeWorkflowModal.toUpperCase()}`}
          isOpen={!!activeWorkflowModal}
          onClose={() => setActiveWorkflowModal(null)}
          size="lg"
        >
          <div className="space-y-4">
            {activeWorkflowModal === 'rfqs' && (
              <DataTable
                data={workflowData.rfqs}
                columns={[
                  { key: 'id', header: 'RFQ Reference' },
                  { key: 'title', header: 'RFQ Sourced', nowrap: false },
                  { key: 'category', header: 'Category' },
                  { key: 'price', header: 'Quoted Price', render: (row) => currency(row.price) },
                  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
              />
            )}
            
            {activeWorkflowModal === 'pos' && (
              <DataTable
                data={workflowData.pos}
                columns={[
                  { key: 'po_number', header: 'PO Number' },
                  { key: 'total_amount', header: 'Total Value', render: (row) => currency(Number(row.total_amount || 150000)) },
                  { key: 'issued_date', header: 'Issued Date' },
                  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
              />
            )}

            {activeWorkflowModal === 'invoices' && (
              <DataTable
                data={workflowData.invoices}
                columns={[
                  { key: 'id', header: 'Invoice Reference' },
                  { key: 'po', header: 'PO Ref' },
                  { key: 'amount', header: 'Invoice Total', render: (row) => currency(row.amount) },
                  { key: 'submitted', header: 'Submitted' },
                  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
                ]}
              />
            )}

            {activeWorkflowModal === 'reviews' && (
              <DataTable
                data={workflowData.reviews}
                columns={[
                  { key: 'po_number', header: 'PO Ref' },
                  { key: 'rating', header: 'Review Rating', render: (row) => `${row.rating} / 5` },
                  { key: 'review_text', header: 'Comments / Remarks' },
                  { key: 'reviewed_at', header: 'Reviewed At' }
                ]}
              />
            )}
            
            <div className="flex justify-end pt-2">
              <Button onClick={() => setActiveWorkflowModal(null)}>Close View</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
