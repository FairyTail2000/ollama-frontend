import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelTag } from '../../services/ollama-client.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input({required: true}) model: string | null = "";
  @Output() modelChange = new EventEmitter<string | null>();
  @Input({required: true}) models: ModelTag[] = [];

  @Output() deleteCurrentChat = new EventEmitter<void>();
  @Output() settingsClicked = new EventEmitter<void>();
  @Output() modelInfo = new EventEmitter<void>();
}
