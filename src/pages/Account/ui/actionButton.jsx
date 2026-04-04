import { Spinner } from "./icons";

export const ActionButtons = ({ onSave, onCancel, isPending, disabled }) => (
  <div className="flex gap-2 pt-2">
    <button
      onClick={onSave}
      disabled={isPending || disabled}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-60 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? <><Spinner /> Saving…</> : "Save changes"}
    </button>
    <button
      onClick={onCancel}
      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-font-light text-sm font-medium transition-colors"
    >
      Cancel
    </button>
  </div>
);