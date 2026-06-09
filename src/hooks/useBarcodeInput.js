import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * USB barcode scanners act as a keyboard — they type digits quickly and send Enter.
 * Focus the barcode field, scan, and the value is captured without submitting the form.
 */
export function useBarcodeInput({ onScan, autoFocus = false, enabled = true } = {}) {
  const inputRef = useRef(null);
  const [scanReady, setScanReady] = useState(false);
  const [lastScanned, setLastScanned] = useState('');

  useEffect(() => {
    if (autoFocus && enabled && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [autoFocus, enabled]);

  const focusForScan = useCallback(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
    setScanReady(true);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const value = e.target.value.trim();
      if (!value) return;
      setLastScanned(value);
      onScan?.(value);
      setScanReady(false);
    },
    [onScan]
  );

  const handleBlur = useCallback(() => {
    setScanReady(false);
  }, []);

  const handleFocus = useCallback(() => {
    setScanReady(true);
  }, []);

  return {
    inputRef,
    scanReady,
    lastScanned,
    focusForScan,
    handleKeyDown,
    handleBlur,
    handleFocus,
  };
}
