import {Inject, Injectable, InjectionToken} from '@angular/core';
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

  askQuestion(model: string, prompt: string, context: number[] = [], system?: string): Observable<(QuestionResponse | QuestionResponseEnd)[]> {
    return this.http.post(`${this.api_url}/generate`,
      {model, prompt, context, system},
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

  generateEmbeddings(model: string, prompt: string): Observable<any> {
    return this.http.post(`${this.api_url}/embeddings`, {model, prompt},  {responseType: 'json'}
    )
  }
}
