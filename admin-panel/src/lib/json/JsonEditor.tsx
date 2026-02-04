// =============================================================
// FILE: src/lib/json/JsonEditor.tsx
// FINAL — focus/dirty guarded sync to avoid overwrite loops (hardened)
// =============================================================

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type AdminJsonEditorProps = {
  label?: React.ReactNode;
  value: unknown;
  onChange: (next: any) => void; // yalnızca geçerli JSON olduğunda çağrılır
  onErrorChange?: (err: string | null) => void;
  disabled?: boolean;
  helperText?: React.ReactNode;
  height?: number;
  placeholder?: string;
};

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return '';
  }
};

export const AdminJsonEditor: React.FC<AdminJsonEditorProps> = ({
  label,
  value,
  onChange,
  onErrorChange,
  disabled,
  helperText,
  height = 320,
  placeholder = '{\n  \n}',
}) => {
  const initialStr = useMemo(() => safeStringify(value), []); // mount-time
  const [text, setText] = useState<string>(initialStr);
  const [internalError, setInternalError] = useState<string | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // last synced external value-string (prevents unnecessary setText loops)
  const lastSyncedRef = useRef<string>(initialStr);

  // external value → editor sync (guarded)
  useEffect(() => {
    const nextStr = safeStringify(value);

    if (nextStr === lastSyncedRef.current) return;
    if (isFocused && isDirty) return;

    lastSyncedRef.current = nextStr;
    setText(nextStr);
    setInternalError(null);
    onErrorChange?.(null);
    setIsDirty(false);
  }, [value, isFocused, isDirty, onErrorChange]);

  const rows = useMemo(() => Math.max(10, Math.round(height / 20)), [height]);

  const commitParse = () => {
    const trimmed = text.trim();

    if (!trimmed) {
      onChange({});
      setInternalError(null);
      onErrorChange?.(null);
      const s = safeStringify({});
      lastSyncedRef.current = s;
      setIsDirty(false);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      onChange(parsed);

      setInternalError(null);
      onErrorChange?.(null);

      // align lastSynced to parsed content to avoid immediate resync loops
      lastSyncedRef.current = safeStringify(parsed);
      setIsDirty(false);
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : 'Geçersiz JSON';
      setInternalError(msg);
      onErrorChange?.(msg);
    }
  };

  const error = internalError;

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</div>
          <span className="text-[11px] px-2 py-1 rounded-md border bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            JSON editor
          </span>
        </div>
      ) : null}

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setIsDirty(true);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          commitParse();
        }}
        disabled={disabled}
        spellCheck={false}
        rows={rows}
        placeholder={placeholder}
        className={[
          'w-full resize-y rounded-md border px-3 py-2 text-sm',
          'font-mono leading-5',
          'bg-white text-gray-900 placeholder:text-gray-400',
          'dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            : 'border-gray-200 dark:border-gray-700',
        ].join(' ')}
        style={{
          minHeight: height,
          whiteSpace: 'pre',
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        }}
      />

      {helperText && !error ? (
        <div className="text-xs text-gray-600 dark:text-gray-300">{helperText}</div>
      ) : null}

      {error ? (
        <div className="text-xs text-red-600 dark:text-red-400">JSON hatası: {error}</div>
      ) : null}
    </div>
  );
};
