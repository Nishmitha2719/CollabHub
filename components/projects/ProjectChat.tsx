'use client';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  deleteMessage,
  getMessages,
  getProfileNames,
  MAX_MESSAGE_LENGTH,
  sendMessage,
  subscribeToMessages,
  type ProjectMessage,
} from '@/lib/api/messages';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProjectChatProps {
  projectId: string;
  currentUserId: string;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return sameDay ? time : `${date.toLocaleDateString()} ${time}`;
}

export default function ProjectChat({ projectId, currentUserId }: ProjectChatProps) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const namesRef = useRef<Record<string, string>>({});
  const listRef = useRef<HTMLDivElement | null>(null);

  const addMessage = (message: ProjectMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  };

  const ensureName = async (userId: string) => {
    if (namesRef.current[userId]) return;
    const fetched = await getProfileNames([userId]);
    namesRef.current = { ...namesRef.current, ...fetched };
    setNames(namesRef.current);
  };

  // Load history, then listen for new messages.
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const history = await getMessages(projectId);
      if (!mounted) return;
      setMessages(history);
      setLoading(false);

      const fetched = await getProfileNames(history.map((m) => m.user_id));
      if (!mounted) return;
      namesRef.current = { ...namesRef.current, ...fetched };
      setNames(namesRef.current);
    };

    void load();

    const unsubscribe = subscribeToMessages(projectId, {
      onInsert: (message) => {
        if (!mounted) return;
        addMessage(message);
        void ensureName(message.user_id);
      },
      onDelete: (messageId) => {
        if (!mounted) return;
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      },
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    const result = await sendMessage(projectId, content);
    setSending(false);

    if (!result.success || !result.data) {
      addToast({ message: result.error || 'Could not send message', type: 'error' });
      return;
    }

    addMessage(result.data);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter adds a new line.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleDelete = async (message: ProjectMessage) => {
    if (!confirm('Delete this message?')) return;
    const result = await deleteMessage(message.id);
    if (!result.success) {
      addToast({ message: result.error || 'Could not delete message', type: 'error' });
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">Team Messages</h3>
        <p className="text-sm text-gray-400">Only the project owner and team members can see this chat.</p>
      </div>

      <div
        ref={listRef}
        className="h-[420px] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-gray-500">
            No messages yet. Say hello to your team 👋
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const mine = message.user_id === currentUserId;
              return (
                <div key={message.id} className={`group flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-300">
                        {mine ? 'You' : names[message.user_id] || 'Member'}
                      </span>
                      <span>{formatTime(message.created_at)}</span>
                      {mine && (
                        <button
                          onClick={() => handleDelete(message)}
                          className="text-red-400 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div
                      className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${
                        mine
                          ? 'rounded-br-sm bg-[linear-gradient(135deg,#6d28d9,#4f46e5)] text-white'
                          : 'rounded-bl-sm border border-white/10 bg-white/5 text-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
          className="flex-1 resize-none rounded-lg px-4 py-3"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="self-end rounded-lg bg-[linear-gradient(135deg,#6d28d9,#4f46e5)] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
