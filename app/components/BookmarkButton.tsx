'use client';

import { useState } from 'react';

type Props = {
  articleId: number;
  initialBookmarked: boolean;
};

export default function BookmarkButton({ articleId, initialBookmarked }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articleId })
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarked(data.bookmarked);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        bookmarked
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 text-slate-600'
      }`}
      disabled={loading}
    >
      {bookmarked ? 'Saved' : 'Save'}
    </button>
  );
}
