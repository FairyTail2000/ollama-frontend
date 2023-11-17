import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chat } from "../../services/chat.service";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input({required: true}) chats: Chat[] = [];
  @Input({required: true}) currentChatId: string | undefined;

  @Output() clicked = new EventEmitter<string>();
}
