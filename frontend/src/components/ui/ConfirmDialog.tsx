import { Button } from './Button';
import { Modal } from './Modal';

export function ConfirmDialog({ open, title, message, confirmText = 'Confirmar', onConfirm, onClose }: { open: boolean; title: string; message: string; confirmText?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="button" variant="danger" onClick={onConfirm}>{confirmText}</Button>
      </div>
    </Modal>
  );
}
