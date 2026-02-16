import { Component, effect, input } from "@angular/core";
import { FieldTree, FormField } from "@angular/forms/signals";
import { ErrorMessage } from "../error-message/error-message";
import { IUserForm } from "../models/form.models";

@Component({
  selector: "app-user",
  imports: [FormField, ErrorMessage],
  templateUrl: "./user.html",
  styleUrl: "./user.scss",
})
export class User {
  form = input.required<FieldTree<IUserForm, string>>();
  constructor() {
    effect(() => console.log("###", this.form()));
  }
}
