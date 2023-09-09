import { Injectable } from '@angular/core';
import { nanoid } from "nanoid";

export interface Message {
  type: "question" | "answer";
  content: string;
  source: string
}

export interface Chat {
  messages: Message[];
  model: string;
  system?: string;
  context: number[];
  chatName: string;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() { }

  saveChat(chat: Chat): Chat | null {
    const cloned = structuredClone(chat);
    if (!cloned.id) {
      cloned.id = nanoid();
    }
    if (!cloned.chatName || cloned.messages.length === 0) {
      return null;
    }
    localStorage.setItem(cloned.id, JSON.stringify(chat));
    return cloned;
  }

  loadChat(chatId: string): Chat | null {
    const item = localStorage.getItem(chatId);
    if (item === null) {
      return null;
    }
    let parsed;
    try {
      parsed = JSON.parse(item);
    } catch (e) {
      return null;
    }

    if (!Object.hasOwn(parsed, "id")) {
      return null;
    }

    return parsed;
  }

  loadChats(): Chat[] {
    const chats = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null) {
        continue;
      }
      const chat = this.loadChat(key);
      if (chat !== null) {
        chats.push(chat);
      }
    }

    return chats;
  }

  defaultChat(model?: string): Chat {
    return {
      id: nanoid(),
      chatName: "Untitled",
      context: [],
      messages: [],
      model: model ?? "",
    }
  }
}
