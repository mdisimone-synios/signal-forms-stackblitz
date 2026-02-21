import { Component, input } from "@angular/core";
import { FieldState } from "@angular/forms/signals";

@Component({
  selector: "app-error-message",
  imports: [],
  templateUrl: "./error-message.html",
  styleUrl: "./error-message.scss",
  host: {
    class: "invalid-feedback",
  },
})
export class ErrorMessage {
  inputForm = input.required<FieldState<any, any>>();
}
