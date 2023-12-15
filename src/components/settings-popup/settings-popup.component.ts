import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MODEL_PARAMETERS, ModelParameter } from '../../services/ollama-client.service';
import { Chat } from '../../services/chat.service';

@Component({
  selector: 'app-settings-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings-popup.component.html',
  styleUrl: './settings-popup.component.css',
  host: {
    'class': 'modal fade',
    'id': 'settingsModal',
    'tabindex': '-1',
    'aria-labelledby': 'settingsModalLabel',
    'aria-hidden': 'true',
  }
})
export class SettingsPopupComponent implements OnInit, OnDestroy {
  @ViewChild('settingsModal', {static: true}) modal: ElementRef<HTMLDivElement> | undefined;

  @Output() hide = new EventEmitter<void>();
  @Output() saveSettings = new EventEmitter<Chat['settings']>();
  _shown = false;
  sub?: Subscription;
  hostElement?: ElementRef;
  _existingSettings?: {[key: string]: any} | null;

  @Input({required: true})
  set shown(value: boolean) {
    this._shown = value;
    if (this._shown) {
      new bootstrap.Modal(this.hostElement!.nativeElement!).show();
    } else {
      new bootstrap.Modal(this.hostElement!.nativeElement!).hide();
    }
  }

  get shown() {
    return this._shown;
  }

  @Input()
  set existingSettings(value: {[key: string]: any} | null | undefined) {
    this._existingSettings = value;
    if (!value) {
      this.chatSettingsGroup = this.default_settings();
      return;
    }
    if ("streaming" in value) {
      this.chatSettingsGroup.get('streaming')?.setValue(value['streaming']);
    }
    if ("options" in value) {
      const options = value['options'];
      for (const key in options) {
        // Making sure that the key is a valid model parameter
        if (key in MODEL_PARAMETERS) {
          this.chatSettingsGroup.get('options')?.get(key)?.setValue(options[key]);
        }
      }
    }
  }

  default_settings() {
    return new FormGroup({
      streaming: new FormControl(true),
      options: new FormGroup({
        top_k: new FormControl(MODEL_PARAMETERS[ModelParameter.top_k].default),
        top_p: new FormControl(MODEL_PARAMETERS[ModelParameter.top_p].default, {validators: MODEL_PARAMETERS[ModelParameter.top_p].validator}),
        temperature: new FormControl(MODEL_PARAMETERS[ModelParameter.temperature].default, {validators: MODEL_PARAMETERS[ModelParameter.temperature].validator}),
        stop: new FormArray([new FormControl('')]),
        num_predict: new FormControl(MODEL_PARAMETERS[ModelParameter.num_predict].default, {validators: MODEL_PARAMETERS[ModelParameter.num_predict].validator}),
        num_ctx: new FormControl(MODEL_PARAMETERS[ModelParameter.num_ctx].default),
        num_gqa: new FormControl(),
        num_gpu: new FormControl(),
        num_thread: new FormControl(),
        repeat_last_n: new FormControl(MODEL_PARAMETERS[ModelParameter.repeat_last_n].default, {validators: MODEL_PARAMETERS[ModelParameter.repeat_last_n].validator}),
        repeat_penalty: new FormControl(MODEL_PARAMETERS[ModelParameter.repeat_penalty].default),
        seed: new FormControl(MODEL_PARAMETERS[ModelParameter.seed].default, {validators: MODEL_PARAMETERS[ModelParameter.seed].validator}),
        tfs_z: new FormControl(MODEL_PARAMETERS[ModelParameter.tfs_z].default),
        mirostat: new FormControl(MODEL_PARAMETERS[ModelParameter.mirostat].default, {validators: MODEL_PARAMETERS[ModelParameter.mirostat].validator}),
        mirostat_eta: new FormControl(MODEL_PARAMETERS[ModelParameter.mirostat_eta].default),
        mirostat_tau: new FormControl(MODEL_PARAMETERS[ModelParameter.mirostat_tau].default),
      }),
    });
  }

  // <a href="https://github.com/jmorganca/ollama/blob/5b39503bcd6fe7d21ff88caea2173d0ed0823468/docs/modelfile.md#parameter">valid parameters and values</a>
  chatSettingsGroup = this.default_settings();

  get stopControls() {
    return (this.chatSettingsGroup.get('options')?.get('stop') as FormArray)?.controls;
  }

  get top_p() {
    return this.chatSettingsGroup.get('options')?.get('top_p');
  }

  get num_predict() {
    return this.chatSettingsGroup.get('options')?.get('num_predict');
  }

  get seed() {
    return this.chatSettingsGroup.get('options')?.get('seed');
  }

  get temperature() {
    return this.chatSettingsGroup.get('options')?.get('temperature');
  }

  get repeat_last_n() {
    return this.chatSettingsGroup.get('options')?.get('repeat_last_n');
  }

  get mirostat() {
    return this.chatSettingsGroup.get('options')?.get('mirostat');
  }

  constructor(element: ElementRef) {
    this.hostElement = element;
  }

  ngOnInit() {
    this.sub = fromEvent(this.hostElement!.nativeElement!, "hide.bs.modal").subscribe(_ => {
      this.hide.emit();
    })
  }

  ngOnDestroy() {
    new bootstrap.Modal(this.hostElement!.nativeElement!).hide();
    this.sub!.unsubscribe();
  }

  addStop() {
    (this.chatSettingsGroup.get('options')?.get('stop') as FormArray).push(new FormControl(''));
  }

  save() {
    const options = this.chatSettingsGroup.get('options')?.value;
    const filteredOptions = {};
    if (!options) {
      return;
    }
    for (const key in options) {
      // Making sure that the key is a valid model parameter
      if (key in MODEL_PARAMETERS) {
        // @ts-ignore
        if (options[key] && options[key] !== MODEL_PARAMETERS[key].default && options[key].toString() !== "") {
          // @ts-ignore
          filteredOptions[key] = options[key];
        }
      }
    }
    const settings = {
      streaming: !!this.chatSettingsGroup.get('streaming')?.value,
      options: filteredOptions
    };
    // @ts-ignore
    this.saveSettings.emit(settings);
  }

  cancel() {
    this.existingSettings = this._existingSettings;
  }
}
