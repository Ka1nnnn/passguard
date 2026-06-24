// Build downloadable files from a list of generated passwords and trigger a
// browser download. File building is kept pure (and unit-tested); only
// downloadFile touches the DOM / Blob APIs.

/**
 * Render a list of passwords as the text of a .txt or .md file.
 * @param {string[]} passwords
 * @param {'txt'|'md'} format
 * @param {string} [timestamp] optional ISO string for the header (md only)
 * @returns {string}
 */
export function buildFileContent(passwords, format, timestamp = '') {
  if (format === 'md') {
    const header = ['# PassGuard — generated passwords', ''];
    if (timestamp) header.push(`_Generated: ${timestamp}_`, '');
    const body = passwords.map((p, i) => `${i + 1}. \`${p}\``);
    return [...header, ...body, ''].join('\n');
  }
  // Plain text: one password per line.
  return passwords.join('\n') + '\n';
}

/**
 * Trigger a client-side file download (no server involved).
 * @param {string} filename
 * @param {string} content
 */
export function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
