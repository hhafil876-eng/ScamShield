function historyKey(email) {
  return `scamshieldHistory:${email}`;
}

export function getScanHistory(
  email
) {
  if (!email) return [];

  try {
    const history =
      JSON.parse(
        localStorage.getItem(
          historyKey(email)
        ) || "[]"
      );

    return Array.isArray(history)
      ? history
      : [];
  } catch (error) {
    console.error(
      "Unable to load scan history:",
      error
    );

    return [];
  }
}

export function saveScan(
  email,
  scan
) {
  if (!email) return [];

  const history =
    getScanHistory(email);

  const updated = [
    scan,
    ...history,
  ].slice(0, 50);

  localStorage.setItem(
    historyKey(email),
    JSON.stringify(updated)
  );

  return updated;
}

export function clearScanHistory(
  email
) {
  if (!email) return;

  localStorage.removeItem(
    historyKey(email)
  );
}