import React, { useEffect, useState } from 'react';
import { X, Trash2, Clock } from 'lucide-react';
import { listDrafts, deleteDraft } from '../lib/drafts';
import type { Draft } from '../lib/drafts';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (draft: Draft) => void;
}

const DraftsModal: React.FC<DraftsModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setDrafts(listDrafts());
  }, [isOpen]);

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setDrafts(listDrafts());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Drafts
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {drafts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No drafts found</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {drafts.map((d) => (
                <li key={d.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {d.customer_name || d.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(d.created_at).toLocaleString()} • Total ₹{d.total.toFixed(2)} • {d.items.length} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelect(d)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftsModal;
