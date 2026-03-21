'use client';

import { useState } from 'react';
import { deleteAccount } from '@/actions/profile';

export default function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');
    const result = await deleteAccount();
    if (result.error) {
      setError(result.error);
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-card p-6">
      <h3 className="text-sm font-medium text-destructive mb-1">Danger Zone</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Delete Account
        </button>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-foreground flex-1">
            Are you sure? This will delete everything.
          </p>
          <button
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting…' : 'Confirm Delete'}
          </button>
        </div>
      )}
    </div>
  );
}
