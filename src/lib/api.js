/**
 * lib/api.js
 * All calls to the ren-system Express backend.
 * Base URL from NEXT_PUBLIC_API_URL env var.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// Chat
export const sendMessage = (message, sessionId) =>
  req('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });

// Conversations
export const getConversations    = () => req('/conversations');
export const deleteConversation  = (sessionId) =>
  req(`/conversations/${sessionId}`, { method: 'DELETE' });
export const getMessages      = (sessionId, limit = 50) =>
  req(`/memory?sessionId=${sessionId}&limit=${limit}`);

// Profile / memory
export const getProfile    = () => req('/profile');
export const updateProfile = (data) =>
  req('/profile', { method: 'PUT', body: JSON.stringify(data) });

// Feedback
export const sendFeedback = (sessionId, type, delta) =>
  req('/feedback', {
    method: 'POST',
    body: JSON.stringify({ sessionId, type, delta }),
  });

// Insights
export const getAgentActivity = () => req('/agents/activity');