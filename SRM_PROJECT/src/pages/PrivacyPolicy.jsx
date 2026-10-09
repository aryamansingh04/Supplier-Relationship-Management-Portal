import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  HardDrive, 
  Server, 
  Trash2, 
  RefreshCw, 
  Eye, 
  FileText, 
  Globe, 
  CheckCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/Button.jsx';

export function PrivacyPolicy() {
  const [activeTab, setActiveTab] = useState('overview');
  const [storageItems, setStorageItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedVal, setSelectedVal] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Read items from localStorage to audit
  const loadStorageItems = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key);
      const sizeBytes = new Blob([key, val]).size;
      items.push({ key, val, sizeBytes });
    }
    setStorageItems(items);
    if (items.length > 0) {
      if (!selectedKey || !items.find(x => x.key === selectedKey)) {
        setSelectedKey(items[0].key);
        setSelectedVal(items[0].val);
      } else {
        const current = items.find(x => x.key === selectedKey);
        setSelectedVal(current.val);
      }
    } else {
      setSelectedKey(null);
      setSelectedVal('');
    }
  };

  useEffect(() => {
    loadStorageItems();
  }, []);

  const handleClearKey = (key) => {
    localStorage.removeItem(key);
    loadStorageItems();
    if (selectedKey === key) {
      setSelectedKey(null);
      setSelectedVal('');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all local storage for this portal? This will reset your theme, local forms cache, and any offline state.')) {
      localStorage.clear();
      loadStorageItems();
      setSelectedKey(null);
      setSelectedVal('');
    }
  };

  const handleSelectItem = (item) => {
    setSelectedKey(item.key);
    setSelectedVal(item.val);
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Helper to check if JSON is pretty print-able
  const formatJSON = (val) => {
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return val;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500">
            <ArrowLeft className="h-4 w-4" />
            Back to Home / Portal Map
          </Link>
        </div>

        {/* Header Block */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Privacy Policy & Data Registry</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Comprehensive audit of what information we store, where it is located, and how we protect it.
                </p>
              </div>
            </div>
            <div className="text-right sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-500/20">
                <CheckCircle className="h-3 w-3" /> Fully Audited
              </span>
              <p className="mt-1 text-[11px] text-slate-400">Last Reviewed: May 26, 2026</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap -mb-px gap-2">
            {[
              { id: 'overview', label: '1. Privacy Overview', icon: Lock },
              { id: 'data', label: '2. Stored Data Registry', icon: Database },
              { id: 'storage', label: '3. Data Mapping & Schema', icon: Server },
              { id: 'auditor', label: '4. Interactive Storage Auditor', icon: HardDrive }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    isActive 
                      ? 'border-brand-600 text-brand-600 dark:border-brand-500 dark:text-brand-400' 
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Our Privacy Commitment</h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                The Supplier Relationship Management (SRM) Portal is designed with high transparency and security standards. 
                Our core privacy principle is simple: **you have full control and visibility of your data.**
              </p>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="mb-3 text-brand-600 dark:text-brand-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">Secure Encrypted Access</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Passwords are secure-hashed using bcrypt standard before being committed to database storage, ensuring protection against unauthorized leaks.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="mb-3 text-emerald-600 dark:text-emerald-400">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">Client-Side PDF Parsing</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    PDF text extraction happens entirely in browser memory via pdf.js. No third-party AI APIs or raw documents are uploaded to cloud extraction services.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="mb-3 text-amber-600 dark:text-amber-400">
                    <Database className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">Zero Third-Party Tracking</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    We host the application and libraries locally or call standard public CDNs. No advertiser code, trackers, or marketing pixels are used.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Security Architecture Highlights:</h4>
                <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  <li>**Prepared Statements Only**: Every dynamic query utilizes SQL parameter binding. There is no raw SQL concatenation, preventing SQL Injection risks.</li>
                  <li>**Isolated Session Context**: Authenticated sessions are held in server cookies and mapped securely to MySQL via secure session IDs.</li>
                  <li>**Open Access to Cache**: You can inspect and delete cached client-side forms at any time using our Interactive Storage Auditor tab.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Data Stored */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Information Collected & Stored</h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                The portal processes and stores data in two distinct environments: the persistent MySQL server database and the client-side browser cache.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                      <th className="p-3 font-semibold">Data Category</th>
                      <th className="p-3 font-semibold">Specific Fields Stored</th>
                      <th className="p-3 font-semibold">Storage Location</th>
                      <th className="p-3 font-semibold">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">User Accounts</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Full Name, Email Address, Role (Admin/Supplier), password_hash (bcrypt)</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">MySQL (`users` table)</td>
                      <td className="p-3 text-slate-500">Authentication, permission routing, identity management.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">RFQs</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">RFQ ID, Title, Category, Deadline, Value, Bid Count, Status</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">MySQL (`rfqs` table) & LocalStorage (cache)</td>
                      <td className="p-3 text-slate-500">Procurement creation, supplier invites, and bidding tracking.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Bids & Proposals</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Bid ID, RFQ Package ID, Price, Lead Time, Warranty, Evaluation Score, Award Flag</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">MySQL (`bids` table) & LocalStorage (cache)</td>
                      <td className="p-3 text-slate-500">Commercial negotiation, auto-scoring algorithms, and procurement awards.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Goods Receipts (GRNs)</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Receipt Ref ID, PO ID, Item Description, Quantity Received, Quantity Accepted, Status</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">MySQL (`goods_receipts`) & LocalStorage (cache)</td>
                      <td className="p-3 text-slate-500">Warehouse deliveries verification, intake log reconciliation.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Invoices</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Invoice ID, PO ID, Amount, Submission Date, Due Date, Status</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">MySQL (`invoices` table) & LocalStorage (cache)</td>
                      <td className="p-3 text-slate-500">Payment auditing, financial tracking, accounts payable.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Compliance Docs</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Certificate ID, Certificate Type, Issuer, Expiry Date, Status</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">MySQL (`compliance_documents`) & LocalStorage (cache)</td>
                      <td className="p-3 text-slate-500">Supplier validation, quality audit records, ISO verification.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Data Mapping & Schema */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Data Mapping Diagram</h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Data flows in a multi-layered structure designed to ensure security, persistent durability, and zero leaks.
              </p>

              {/* Data Flow Mapping Grid */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <FileText className="h-4 w-4 text-brand-500" />
                    Layer 1: Document Parsing Memory (Transient)
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    Uploaded PDF documents (e.g. Invoices, GRNs, RFQ specifications) are read in-memory using **pdf.js** libraries loaded dynamically. 
                    The raw file bytes never leave the client's web browser, and text blocks are parsed via Regex to fill corresponding input fields.
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <HardDrive className="h-4 w-4 text-amber-500" />
                    Layer 2: Browser Local Storage (Local Cache / Offline Fallback)
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    Forms caching saves the current parsed values in keys such as `rfqs`, `bids`, `receipts`, `invoices`, and `compliance_docs` within the browser's `localStorage` namespace. 
                    This ensures the user's UI form state persists during accidental browser refreshes.
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <Server className="h-4 w-4 text-emerald-500" />
                    Layer 3: MySQL Relational Database (Persistent Storage)
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">
                    When the user clicks "Save" or "Submit", the data is POSTed to the backend PHP API (e.g., `/backend/api/bids.php`). 
                    The API securely connects using the credentials defined in `db.php` and writes the record permanently to the `srm_portal` database.
                  </p>
                </div>
              </div>

              {/* Technical DB Schema Specs */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-950/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Database Host Mapping</h3>
                <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Host Engine:</span> XAMPP Local MySQL Server (MariaDB)
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Database Name:</span> `srm_portal`
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Port Configuration:</span> Standard MySQL Port `3306`
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Connection Character Set:</span> `utf8mb4_unicode_ci` (Emoji & International text safe)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Interactive Storage Auditor */}
          {activeTab === 'auditor' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">Active Browser Storage Registry</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Below is a live inspection of the keys currently stored in this browser for the SRM portal domain.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={loadStorageItems} className="h-9 px-3">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                  <Button variant="danger" onClick={handleClearAll} className="h-9 px-3">
                    <Trash2 className="h-3.5 w-3.5" /> Clear All Cache
                  </Button>
                </div>
              </div>

              {storageItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
                  <p className="text-sm text-slate-400">No client-side items found in `localStorage` for this domain.</p>
                  <p className="text-xs text-slate-500 mt-2">Data will appear here once you perform uploads, save forms, or select themes.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-[0.4fr_0.6fr]">
                  {/* List of keys */}
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Keys</p>
                    {storageItems.map(item => (
                      <button
                        key={item.key}
                        onClick={() => handleSelectItem(item)}
                        className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition ${
                          selectedKey === item.key
                            ? 'border-brand-600 bg-brand-50/30 dark:border-brand-500 dark:bg-brand-950/20'
                            : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white font-mono">{item.key}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Size: {formatBytes(item.sizeBytes)}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearKey(item.key);
                          }}
                          className="p-1 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          title="Remove key"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </button>
                    ))}
                  </div>

                  {/* Value Inspector */}
                  <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payload Inspector</p>
                        <p className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 mt-1 truncate max-w-xs">{selectedKey}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedVal);
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                      >
                        {copiedKey ? 'Copied!' : 'Copy Value'}
                      </button>
                    </div>

                    <div className="flex-1 overflow-auto max-h-80">
                      <pre className="text-[11px] leading-5 font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap select-all">
                        {formatJSON(selectedVal)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
