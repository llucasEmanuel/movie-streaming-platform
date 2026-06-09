import React from 'react';

interface ConfirmEditModalProps {
  title: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmEditModal({
  title,
  isSubmitting,
  onConfirm,
  onCancel,
}: ConfirmEditModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1f] border-t-4 border-[#ffc107] rounded-xl p-8 flex flex-col items-center max-w-[400px] w-full shadow-2xl">
        <div className="w-16 h-16 bg-[#3f3100] border border-[#ffc107]/20 rounded-2xl flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[#ffc107] text-[32px]">
            edit
          </span>
        </div>

        <h3 className="text-2xl text-on-background font-medium mb-2">
          Salvar Alterações
        </h3>
        <p className="text-center text-on-surface-variant mb-8">
          Tem certeza que deseja aplicar as alterações no filme{' '}
          <strong className="text-[#ffc107]">"{title}"</strong>?
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full py-3 bg-[#ffc107] text-[#3f2e00] font-medium rounded hover:opacity-90 flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSubmitting ? 'hourglass_empty' : 'save'}
            </span>
            {isSubmitting ? 'Salvando...' : 'Sim, salvar alterações'}
          </button>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full py-3 bg-transparent border border-outline text-on-background font-medium rounded hover:bg-surface-container-highest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
