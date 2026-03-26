export type AppView = 'chat' | 'overview' | 'runtime' | 'automation' | 'reports' | 'bridge';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
}

export interface AppNavItem {
  id: AppView;
  iconClass: string;
  labelKey: string;
  descriptionKey: string;
}
