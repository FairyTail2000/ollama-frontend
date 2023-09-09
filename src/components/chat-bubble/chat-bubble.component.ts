import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DomSanitizer} from "@angular/platform-browser";
import {MarkdownModule} from "ngx-markdown";
import {stagger} from "@angular/animations";

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.css']
})
export class ChatBubbleComponent {
  @Input({required: true}) type!: "question" | "answer";
  @Input({required: true}) source!: string;

  @Input({required: true}) set content(value: string) {
    this.content_parts = [];
    let markdown = false;
    let markdown_content = "";
    let language = "";
    for (const line of value.split("\n")) {
      if (line.trim().startsWith("```")) {
        if (markdown) {
          this.content_parts.push({markdown: true, content: markdown_content, language: language})
          markdown_content = "";
        } else {
          language = line.trim().substring(3);
        }
        markdown = !markdown;
      } else {
        if (markdown) {
          markdown_content += line + "\n";
        } else {
          if(line.trim().length > 0) {
            this.content_parts.push({markdown: false, content: line})
          }
        }
      }
    }
    if (markdown) {
      this.content_parts.push({markdown: true, content: markdown_content, language: language})
    }
  }

  content_parts?: {markdown: boolean; content: string; language?: string}[];

  @HostBinding('style.align-self') get alignSelf() {
    return this.type === "answer" ? "flex-start" : "flex-end";
  }

  protected readonly stagger = stagger;
  protected readonly String = String;
}
