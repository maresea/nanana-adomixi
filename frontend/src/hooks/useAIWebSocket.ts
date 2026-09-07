import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

type AIStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface WebSocketMessage {
  type: string;
  job_id?: string;
  doc_id?: string;
  status?: AIStatus;
  result?: any;
  error?: string;
}

export function useAIWebSocket() {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    // Use ws:// for http and wss:// for https based on current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the backend WS endpoint from proxy /api fallback to explicit host
    const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/notifications?token=${token}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
        
        // Cập nhật trạng thái tự động theo job_id
        if (data.type === 'TASK_COMPLETED') {
          // You could trigger a react-query invalidate here to refetch document data
          console.log('AI Task Completed', data);
        }
      } catch (err) {
        console.error('Lỗi parse WS message:', err);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [token]);

  return { messages };
}

