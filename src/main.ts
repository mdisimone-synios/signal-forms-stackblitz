import { ApplicationConfig, Component, signal } from "@angular/core";
import { provideSignalFormsConfig } from "@angular/forms/signals";
import { bootstrapApplication } from "@angular/platform-browser";
import { Form } from "./app/form/form";

@Component({
  selector: "app-root",
  imports: [Form],
  template: `<div class="row">
    <div class="col">
      <app-form></app-form>
    </div>
  </div>`,
})
export class App {
  name = "Angular";
  counter = signal(0);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideSignalFormsConfig({
      classes: {
        "is-touched": (s) => s.state().touched(),
        "is-untouched": (s) => !s.state().touched(),
        "is-dirty": (s) => s.state().dirty(),
        "is-pristine": (s) => !s.state().dirty(),
        "is-valid": (s) => s.state().touched() && s.state().valid(),
        "is-invalid": (s) => s.state().touched() && s.state().invalid(),
        "is-pending": (s) => s.state().pending(),
      },
    }),
  ],
};

bootstrapApplication(App, appConfig);
