import {Injectable} from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class OllamaClientService {

  constructor(private http: HttpClient) { }

  async getModels() {
    return await firstValueFrom(this.http.get<ModelTagListResponse>('http://127.0.0.1:11434/api/tags', {responseType: "json"}));
  }

  askQuestion(model: string, prompt: string, context: number[] = [], system?: string): Observable<(QuestionResponse | QuestionResponseEnd)[]> {
    return this.http.post('http://127.0.0.1:11434/api/generate',
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

}
