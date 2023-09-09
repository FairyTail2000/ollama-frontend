import { ApplicationConfig, SecurityContext } from '@angular/core';
import { provideHttpClient } from "@angular/common/http";
import { MarkdownService, SECURITY_CONTEXT } from "ngx-markdown";
import {API_URL} from "../../services/ollama-client.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    MarkdownService,
    {
      provide: SECURITY_CONTEXT,
      useValue: SecurityContext.NONE
    },
    {
      provide: API_URL,
      useValue: "http://127.0.0.1:11434/api"
    }
  ]
};
