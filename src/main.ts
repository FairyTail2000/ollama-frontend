import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './components/app/app.config';
import { FrameComponent } from './components/frame/frame.component';

bootstrapApplication(FrameComponent, appConfig)
  .catch((err) => console.error(err));
