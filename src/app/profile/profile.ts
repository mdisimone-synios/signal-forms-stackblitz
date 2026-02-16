import { Component, input } from "@angular/core";
import { FieldTree, FormField } from "@angular/forms/signals";
import { ErrorMessage } from "../error-message/error-message";
import { IProfileForm } from "../models/form.models";

const TITLES = [
  { value: "prof", label: "Professor" },
  { value: "sir", label: "Sir" },
  { value: "dr", label: "Doctor" },
];

@Component({
  selector: "app-profile",
  imports: [FormField, ErrorMessage],
  templateUrl: "./profile.html",
  styleUrl: "./profile.scss",
})
export class Profile {
  form = input.required<FieldTree<IProfileForm, string>>();
  titles = TITLES;
}
