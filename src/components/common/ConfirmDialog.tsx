import React from 'react';
import { Modal } from './Modal';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  confirmLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-3.5 pt-1 pb-4">
        <div
          className={`p-2.5 rounded-lg shrink-0 ${
            variant === 'danger'
              ? 'bg-rose-50 text-rose-600 border border-rose-100'
              : variant === 'warning'
              ? 'bg-amber-50 text-amber-600 border border-amber-100'
              : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}
        >
          {variant === 'danger' && <AlertCircle className="w-5 h-5" />}
          {variant === 'warning' && <AlertTriangle className="w-5 h-5" />}
          {variant === 'info' && <Info className="w-5 h-5" />}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={confirmLoading}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          disabled={confirmLoading}
          className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-xs ${
            variant === 'danger'
              ? 'bg-rose-600 hover:bg-rose-700'
              : variant === 'warning'
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
