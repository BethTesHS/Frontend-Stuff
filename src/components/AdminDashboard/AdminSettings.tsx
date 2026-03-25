import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { adminSettingsApi } from '@/services/adminSettingsApi';

type ValueType = 'String' | 'Number' | 'Boolean' | 'JSON';

interface Setting {
  id: string;
  slug: string;
  value: string;
  description: string;
  type: ValueType;
}

const initialSettings: Setting[] = [
  { id: '1', slug: 'site_title', value: 'My Application', description: 'Website title', type: 'String' },
  { id: '2', slug: 'max_upload_size', value: '10MB', description: 'File upload limit', type: 'Number' },
  { id: '3', slug: 'enable_signup', value: 'true', description: 'Allow user registration', type: 'Boolean' },
  { id: '4', slug: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode', type: 'Boolean' },
];

const emptyForm = (): Omit<Setting, 'id'> => ({
  slug: '',
  value: '',
  description: '',
  type: 'String',
});

export function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Setting | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filtered, setFiltered] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [paginated, setPaginated] = useState([]);
  const perPage = 10;

  useEffect(() => {
    const tableData = async () => {
      const respData = await adminSettingsApi.getSettings();
      const settingsData: Setting[] = (respData?.data || []).map(
        (item: any) => ({
          id: item.id,
          slug: item.settings_name || item.slug,
          value: item.settings_value || item.value,
          description: item.description,
          type: item.value_type || item.type,
        }),
      );

      setSettings(settingsData);
    };

    if (settings.length === 0) {
      tableData();
    }
  }, [settings.length]); 

  useEffect(() => {
    const _filtered = settings.filter(
      (s) =>
        s.slug?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()),
    );

    setFiltered(_filtered);
    setTotalPages(Math.max(1, Math.ceil(_filtered.length / perPage)));
    setPaginated(_filtered.slice((page - 1) * perPage, page * perPage));
  }, [settings, search, page]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (setting: Setting) => {
    setEditing(setting);
    setForm({
      slug: setting.slug,
      value: typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : String(setting.value),
      description: setting.description,
      type: setting.type
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (!form.slug.trim() || !form.value.trim()) return;

    let parsedValue: any = form.value;
    if (form.type === 'JSON') {
      try { parsedValue = JSON.parse(form.value); }
      catch { return alert('Invalid JSON format'); }
    } else if (form.type === 'Boolean') {
      parsedValue = form.value.toLowerCase() === 'true';
    } else if (form.type === 'Number') {
      parsedValue = Number(form.value);
    }

    const payload = {
      settings_name: form.slug,
      settings_value: parsedValue,
      description: form.description,
      value_type: form.type
    };

    if (editing) {
      const res = await adminSettingsApi.updateSetting(editing.id, payload);
      if (res?.type !== "error") {
        setSettings([]); // Force re-fetch
      } else {
        console.error(res?.message || "Failed to update setting");
      }
    } else {
      const res = await adminSettingsApi.createSetting(payload);
      if (res?.type !== "error") {
        setSettings([]); // Force re-fetch
      } else {
        console.error(res?.message || "Failed to create setting");
      }
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    const res = await adminSettingsApi.deleteSetting(id);
    if (res?.type !== "error") {
      setSettings((prev) => prev.filter((s) => s.id !== id));
    } else {
      console.error(res?.message || "Failed to delete setting");
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings Management</h2>

      {/* Search + Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search settings..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add New Setting
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-xs">Slug / Name</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-xs">Value</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-xs">Description</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-xs">Type</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                  No settings found.
                </td>
              </tr>
            ) : (
              paginated.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-800 dark:text-gray-200">{s.slug}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    <pre style={{ "wordBreak": "break-all", "whiteSpace": "pre-wrap" }}>
                      {typeof s.value === 'object' ? JSON.stringify(s.value, null, 2) : String(s.value)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{s.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {s.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300 dark:text-gray-700">|</span>
                      {deleteConfirm === s.id ? (
                        <span className="flex items-center gap-2 text-sm">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="text-red-600 dark:text-red-400 font-medium hover:underline"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(s.id)}
                          className="text-red-500 dark:text-red-400 hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to{' '}
            {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg mx-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editing ? 'Edit Setting' : 'Add New Setting'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. site_title"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="Setting value"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ValueType })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>String</option>
                  <option>Number</option>
                  <option>Boolean</option>
                  <option>JSON</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this setting"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.slug.trim() || !form.value.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save size={16} />
                Save Setting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
