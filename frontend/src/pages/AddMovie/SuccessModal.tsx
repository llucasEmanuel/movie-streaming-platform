import React from 'react';

interface SuccessModalProps {
  title: string;
  isEditing: boolean;
  onAddAnother: () => void;
  onGoToCatalog: () => void;
}

export function SuccessModal({
  title,
  isEditing,
  onAddAnother,
  onGoToCatalog,
}: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1f] border-t-4 border-[#ffc107] rounded-xl p-8 flex flex-col items-center max-w-[400px] w-full shadow-2xl">
        <div className="w-16 h-16 bg-[#3f3100] border border-[#ffc107]/20 rounded-2xl flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[#ffc107] text-[32px]">
            check_circle
          </span>
        </div>

        <h3 className="text-2xl text-on-background font-medium mb-2">
          Sucesso!
        </h3>
        <p className="text-center text-on-surface-variant mb-8">
          Filme <strong className="text-[#ffc107]">"{title}"</strong>{' '}
          {isEditing ? 'atualizado' : 'adicionado'} com sucesso ao catálogo.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onAddAnother}
            className="w-full py-3 bg-[#ffc107] text-[#3f2e00] font-medium rounded hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Adicionar outro filme
          </button>
          <button
            onClick={onGoToCatalog}
            className="w-full py-3 bg-transparent border border-outline text-on-background font-medium rounded hover:bg-surface-container-highest flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              grid_view
            </span>
            Ir para o catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
