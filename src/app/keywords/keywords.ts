import { Component, input } from "@angular/core";
import { FieldTree, FormField } from "@angular/forms/signals";
import { IKeywordsForm } from "../models/form.models";

@Component({
  selector: "app-keywords",
  imports: [FormField],
  templateUrl: "./keywords.html",
  styleUrl: "./keywords.scss",
})
export class Keywords {
  form = input.required<FieldTree<IKeywordsForm, string>>();
}
