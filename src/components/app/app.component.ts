import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelTag, OllamaClientService } from "../../services/ollama-client.service";
import { FormsModule } from "@angular/forms";
import { ChatBubbleComponent } from "../chat-bubble/chat-bubble.component";
import { Chat, ChatService } from "../../services/chat.service";
import {SidebarComponent} from "../sidebar/sidebar.component";

declare var bootstrap: any;


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatBubbleComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  models: ModelTag[] = [];
  question: string = "";
  answer: string = "";
  error: string | null = null;

  chats: Chat[] = [];
  _currentChat: Chat | null = null;

  private _model: string | null = null;

  @ViewChild('chatcontainer', {static: true}) chatcontainer: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('errorModal', {static: true}) modal: ElementRef<HTMLDivElement> | undefined;

  set model(value: string | null) {
    if (this.currentChat) {
      this.chatService.saveChat(this.currentChat!);
    }
    let newChat = this.chats.find((c) => c.model === value);
    if (newChat === undefined) {
      newChat = this.chatService.defaultChat(value ?? undefined);
      this.chats.push(newChat);
    }
    this.currentChat =  newChat;
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
    this.chats[0] = this.currentChat;
  }

  ask() {
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
    this.ollamaClient.askQuestion(this.currentChat!.model, this.question, this.currentChat!.context, this.system).subscribe((response) => {
      if (Array.isArray(response) && "error" in response[0]) {
        this.error = response[0].error as string;
        new bootstrap.Modal(this.modal?.nativeElement).show();
        this.currentChat!.messages.pop();
        this.chatService.saveChat(this.currentChat!);
      } else {
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

  sidebarClicked($event: string) {
    const chat = this.chats.find((c) => c.id === $event);
    this.currentChat = chat!;
  }
}
