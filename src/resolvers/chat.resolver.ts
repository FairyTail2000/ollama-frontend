import { ResolveFn } from '@angular/router';
import { Chat, ChatService } from '../services/chat.service';
import { inject } from '@angular/core';

export const chatResolver: ResolveFn<Chat | null> = (route, state) => {
  const chatService = inject(ChatService);
  const id = route.params['id'];
  return chatService.loadChat(id);
};
