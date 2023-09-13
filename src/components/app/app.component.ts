import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelTag, OllamaClientService } from "../../services/ollama-client.service";
import { FormsModule } from "@angular/forms";
import { ChatBubbleComponent } from "../chat-bubble/chat-bubble.component";
import { Chat, ChatService } from "../../services/chat.service";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatBubbleComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  models: ModelTag[] = [];
  question: string = "";
  _system?: string;
  answer: string = "";

  chats: Chat[] = [];
  _currentChat: Chat | null = null;

  private _model: string | null = null;

  @ViewChild('chatcontainer', {static: true}) chatcontainer: ElementRef<HTMLDivElement> | undefined;

  set model(value: string | null) {
    if (this.currentChat) {
      this.chatService.saveChat(this.currentChat!);
    }
    this.currentChat = this.chats.find((c) => c.model === value) ?? this.chatService.defaultChat(value!);
    this._model = value;
    localStorage.setItem("model", this.model!);
  }

  get model() {
    return this._model;
  }

  get system(): string {
    return this.currentChat?.system!;
  }

  set system(value: string) {
    this.currentChat!.system = value;
    this.chatService.saveChat(this.currentChat!);
  }

  get currentChat(): Chat | null {
    return this._currentChat;
  }

  set currentChat(value: Chat | null) {
    if (this._currentChat !== null) {
      this.chatService.saveChat(this.currentChat!);
    }
    this._currentChat = value;
  }


  constructor(private ollamaClient: OllamaClientService, private chatService: ChatService) {
  }

  async ngOnInit() {
    const {models} = await this.ollamaClient.getModels();
    this.models = models;
    this.model = localStorage.getItem("model");
    this.system = localStorage.getItem("system") || "";
    this.chats = this.chatService.loadChats();
    this.currentChat = this.chats[0] || this.chatService.defaultChat(this.model ?? undefined);
  }


  ask() {
    if (this._system !== undefined && this._system.trim().length === 0) {
      this._system = undefined;
    }

    if (this.model === null) {
      return;
    }

    this.currentChat!.messages.push({
      type: "question",
      content: this.question,
      source: "You"
    });
    this.currentChat!.messages.push({
      type: "answer",
      content: "",
      source: this.model!
    });
    this.ollamaClient.askQuestion(this.currentChat!.model, this.question, this.currentChat!.context, this._system).subscribe((response) => {
      this.currentChat!.messages[this.currentChat!.messages.length - 1].content = "";
      for (const r of response) {
        if ("response" in r) {
          this.currentChat!.messages[this.currentChat!.messages.length - 1].content += r.response;
        }
        if ("context" in r) {
          this.currentChat!.context = r.context;
          this.chatService.saveChat(this.currentChat!);
        }
        this.chatcontainer?.nativeElement.scrollTo(0, this.chatcontainer.nativeElement.scrollHeight);
      }
    });
    this.question = "";
  }

  onKey(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
      this.ask()
    }
  }

  deleteCurrentChat() {
    const id = structuredClone(this.currentChat!);
    this.chats = this.chats.filter((c) => c.id !== this.currentChat!.id);
    this.currentChat = this.chatService.defaultChat(this.model ?? undefined);
    this.chatService.deleteChat(id);
  }
}
