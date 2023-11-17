import {Inject, Injectable, InjectionToken} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {filter, firstValueFrom, map, Observable} from "rxjs";

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

export interface ShowModelResponse {
  license: string
  modelfile: string
  parameters: string
  template: string
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

  async getModelInfo(model: ModelTag) {
    return await firstValueFrom(this.http.post<any>(`${this.api_url}/show`, {name: model.name}, {responseType: "json"}));
  }

  askQuestion(model: string, prompt: string, context: number[] = [], system?: string, options?: ModelOptions): Observable<(QuestionResponse | QuestionResponseEnd)[]> {
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
