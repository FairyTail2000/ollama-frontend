import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelTag, OllamaClientService } from "./ollama-client.service";
import { FormsModule } from "@angular/forms";
import { ChatBubbleComponent } from "../chat-bubble/chat-bubble.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatBubbleComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  models: ModelTag[] = [];
  blocks: { type: "question" | "answer"; content: string; source: string}[] = [];
  question: string = "";
  _system?: string;
  answer: string = "";

  context: number[] = [];
  private _model: string | null = null;

  set model(value: string | null) {
    this._model = value;
    this.context = [];
    this.blocks = [];
  }

  get model() {
    return this._model;
  }

  get system(): string {
    return <string>this._system;
  }

  set system(value: string) {
    this._system = value;
    localStorage.setItem("system", value);
  }

  constructor(private ollamaClient: OllamaClientService) {
  }

  async ngOnInit() {
    const {models} = await this.ollamaClient.getModels();
    this.models = models;
    this.model = localStorage.getItem("model");
    this.system = localStorage.getItem("system") || "";
  }


  ask() {
    if (this._system !== undefined && this._system.trim().length === 0) {
      this._system = undefined;
    }

    localStorage.setItem("model", this.model!);
    this.blocks.push({
      type: "question",
      content: this.question,
      source: "You"
    });
    this.blocks.push({
      type: "answer",
      content: "",
      source: this.model!
    });
    this.ollamaClient.askQuestion(this.model!, this.question, this.context, this._system).subscribe((response) => {
      this.blocks[this.blocks.length - 1].content = "";
      for (const r of response) {
        if ("response" in r) {
          this.blocks[this.blocks.length - 1].content += r.response;
        }
        if ("context" in r) {
          this.context = r.context;
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
}
