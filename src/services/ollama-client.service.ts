import {Inject, Injectable, InjectionToken} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {filter, firstValueFrom, map, Observable} from "rxjs";
import { AbstractControl } from '@angular/forms';
import { Chat } from './chat.service';

export interface ModelTag {
  modified_at: string
  name: string
  size: number
}

export interface ModelTagListResponse {
  models: ModelTag[]
}

export interface QuestionResponse {
  model: string,
  created_at: string,
  response: string,
  done: boolean
}

export interface QuestionResponseEnd {
  context: number[]
  created_at: string
  done: boolean
  eval_count: number
  eval_duration: number
  load_duration: number
  model: string
  prompt_eval_count: number
  sample_count: number
  sample_duration: number
  total_duration: number
}

export interface ChatResponse {
  model: string
  created_at: string
  message: {
    role: "assisant",
    content: string
  },
  done: boolean
}

export interface ChatResponseEnd {
  model: string
  created_at: string
  done: boolean
  total_duration: number
  load_duration: number
  prompt_eval_count: number
  prompt_eval_duration: number
  eval_count: number
  eval_duration: number
}

export interface ShowModelResponse {
  license: string
  modelfile: string
  parameters: string
  template: string
  details?: {
    families: string[]
    family: string
    format: string
    parameter_size: string
    quantization_level: string
  }
}

export interface EmbeddingResponse {
  embedding: number[]
}

export interface ModelOptions {
  num_keep: number
  seed: number
  num_predict: number
  top_k: number
  top_p: number
  tfs_z: number
  typical_p: number
  repeat_last_n: number
  temperature: number
  repeat_penalty: number
  presence_penalty: number
  frequency_penalty: number
  mirostat: number
  mirostat_tau: number
  mirostat_eta: number
  penalize_newline: boolean
  stop: string[],
  numa: boolean
  num_ctx: number
  num_batch: number
  num_gqa: number
  num_gpu: number
  main_gpu: number
  low_vram: boolean
  f16_kv: boolean
  logits_all: boolean
  vocab_only: boolean
  use_mmap:boolean
  use_mlock: boolean
  embedding_only: boolean
  rope_frequency_base: number
  rope_frequency_scale: number
  num_thread: number
}

export enum ModelParameter {
  mirostat = "mirostat",
  mirostat_eta = "mirostat_eta",
  mirostat_tau = "mirostat_tau",
  num_ctx = "num_ctx",
  num_gqa = "num_gqa",
  num_gpu = "num_gpu",
  num_thread = "num_thread",
  repeat_last_n = "repeat_last_n",
  repeat_penalty = "repeat_penalty",
  temperature = "temperature",
  seed = "seed",
  stop = "stop",
  tfs_z = "tfs_z",
  num_predict = "num_predict",
  top_k = "top_k",
  top_p = "top_p",
}

export const MODEL_PARAMETERS = {
  [ModelParameter.mirostat]: {
    type: "int",
    default: 0,
    validator: (control: AbstractControl) => {
      return control.value >= 0 && control.value <= 2 ? null : {invalid: true};
    }
  },
  [ModelParameter.mirostat_eta]: {
    default: 0.1,
  },
  [ModelParameter.mirostat_tau]: {
    default: 5.0,
  },
  [ModelParameter.num_ctx]: {
    default: 2048,
  },
  [ModelParameter.num_gqa]: {
  },
  [ModelParameter.num_gpu]: {
  },
  [ModelParameter.num_thread]: {
  },
  [ModelParameter.repeat_last_n]: {
    default: 64,
    validator: (control: AbstractControl) => {
      return control.value >= -1 ? null : {invalid: true};
    }
  },
  [ModelParameter.repeat_penalty]: {
    default: 1.1,
  },
  [ModelParameter.temperature]: {
    default: 0.8,
    validator: (control: AbstractControl) => {
      return control.value >= 0.0 && control.value <= 1.0 ? null : {invalid: true};
    }
  },
  [ModelParameter.seed]: {
    default: 0,
    validator: (control: AbstractControl) => {
      return control.value >= 0 ? null : {invalid: true};
    }
  },
  [ModelParameter.stop]: {
    validator: (control: AbstractControl) => {
      if (control.value !== null && control.value.length !== 0) {
        for (const stop of control.value) {
          if (stop.trim().length === 0) {
            return {invalid: true};
          }
        }
        return null;
      }
      return false;
    }
  },
  [ModelParameter.tfs_z]: {
    default: 1,
  },
  [ModelParameter.num_predict]: {
    default: 128,
    validator: (control: AbstractControl) => {
      return control.value >= -2 ? null : {invalid: true};
    }
  },
  [ModelParameter.top_k]: {
    default: 40
  },
  [ModelParameter.top_p]: {
    default: 0.9,
    validator: (control: AbstractControl) => {
      return control.value >= 0.0 && control.value <= 1.0 ? null : {invalid: true};
    }
  },
}

export const API_URL = new InjectionToken<string>('API_URL')

@Injectable({
  providedIn: 'root'
})
export class OllamaClientService {

  private readonly api_url: string;

  constructor(private http: HttpClient, @Inject(API_URL) api_url: string) {
    this.api_url = api_url;
  }

  async getModels() {
    return await firstValueFrom(this.http.get<ModelTagListResponse>(`${this.api_url}/tags`, {responseType: "json"}));
  }

  askQuestionWithContext(model: string, prompt: string, context: number[] = [], system?: string, options?: ModelOptions): Observable<(QuestionResponse | QuestionResponseEnd)[]> {
    return this.http.post(`${this.api_url}/generate`,
      {model, prompt, context, system: system?.trim().length !== 0 ? system : undefined, options},
      {observe: 'events', responseType: 'text', reportProgress: true}
    ).pipe(
      // @ts-ignore
      filter(e => e.type === 3),
      map(e => {
        // @ts-ignore
        const partials = e.partialText.trim().split('\n');
        return partials.map((p: string) => JSON.parse(p));
      })
    );
  }

  askChatQuestion(chat: Chat): Observable<(ChatResponse | ChatResponseEnd)[]> {
    const messages = chat.messages.map(m => {
      if (m.type === "question") {
        return {
          role: "user",
          content: m.content
        };
      } else {
        return {
          role: "assistant",
          content: m.content
        }
      }
    });
    if (messages.at(-1)?.role === "assistant") {
      messages.pop();
    }

    return this.http.post(`${this.api_url}/chat`,
      {model: chat.model, messages, system: chat.system?.trim().length !== 0 ? chat.system : undefined, options: {...chat.settings?.options}, stream: chat.settings?.streaming ?? true},
      {observe: 'events', responseType: 'text', reportProgress: true}
    ).pipe(
      // @ts-ignore
      filter(e => e.type === 3),
      map(e => {
        // @ts-ignore
        const partials = e.partialText.trim().split('\n');
        return partials.map((p: string) => JSON.parse(p));
      })
    );
  }

  generateEmbeddings(model: string, prompt: string) {
    return this.http.post<EmbeddingResponse>(`${this.api_url}/embeddings`, {model, prompt},  {responseType: 'json'})
  }

  pullModel(model: string): Observable<any> {
    return this.http.post(`${this.api_url}/pull`,
      {name: model},
      {observe: 'events', responseType: 'text', reportProgress: true}
    ).pipe(
      // @ts-ignore
      filter(e => e.type === 3),
      map(e => {
        // @ts-ignore
        const partials = e.partialText.trim().split('\n');
        return partials.map((p: string) => JSON.parse(p));
      })
    );
  }

  showModel(model: string) {
    return this.http.post<ShowModelResponse>(`${this.api_url}/show`, {name: model},  {responseType: 'json'})
  }

  copyModel(model: string, newModel: string) {
    return this.http.post(`${this.api_url}/copy`, {source: model, destination: newModel},  {responseType: 'json'})
  }
}
