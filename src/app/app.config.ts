import { ApplicationConfig, SecurityContext } from '@angular/core';
import { provideHttpClient } from "@angular/common/http";
import { MarkdownService, SECURITY_CONTEXT } from "ngx-markdown";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    MarkdownService,
    {
      provide: SECURITY_CONTEXT,
      useValue: SecurityContext.NONE
    }
  ]
};
