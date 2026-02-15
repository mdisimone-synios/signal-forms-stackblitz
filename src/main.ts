import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Form } from './app/form/form';

@Component({
  selector: 'app-root',
  imports: [Form],
  template: `<div class="row">
    <div class="col">
      <app-form></app-form>
    </div>
  </div>`,
})
export class App {
  name = 'Angular';
  counter = signal(0);
}

bootstrapApplication(App);
