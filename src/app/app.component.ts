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
  model: string | null = null;
  blocks: { type: "question" | "answer"; content: string; source: string}[] = [];
  question: string = "";
  answer: string = "";

  context: number[] = [];

  constructor(private ollamaClient: OllamaClientService) {
  }

  async ngOnInit() {
    const {models} = await this.ollamaClient.getModels();
    this.models = models;
    this.model = localStorage.getItem("model");
  }


  ask() {
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
    this.ollamaClient.askQuestion(this.model!, this.question, this.context).subscribe((response) => {
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
