import { ApplicationConfig, SecurityContext } from '@angular/core';
import { provideHttpClient } from "@angular/common/http";
import { MarkdownService, SECURITY_CONTEXT } from "ngx-markdown";
import {API_URL} from "../../services/ollama-client.service";
import { Route, provideRouter } from '@angular/router';
import { chatResolver } from '../../resolvers/chat.resolver';

const ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./app.component').then(comp => comp.AppComponent),
    resolve: {
      chat: () => null
    }
  },
  {
    path: 'chats/:id',
    loadComponent: () => import('./app.component').then(comp => comp.AppComponent),
    resolve: {
      chat: chatResolver
    }
  }
];


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
    },
    provideRouter(ROUTES)
  ],
};
