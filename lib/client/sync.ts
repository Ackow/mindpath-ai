export async function syncProgress(documentId: string, payload: unknown) {
  try { await fetch('/api/progress', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documentId, payload }) }); } catch { /* local storage remains available offline */ }
}

export async function syncActivity(date: string, count: number, minutes: number) {
  try { await fetch('/api/activity', { method: 'PUT', credentials: 'include', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, count, minutes }) }); } catch { /* page is leaving; the next session will record again */ }
}

export async function syncQuiz(documentId: string, quizKey: string, payload: unknown) {
  try { await fetch('/api/quiz', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documentId, quizKey, payload }) }); } catch { /* keep no persistent local copy */ }
}
