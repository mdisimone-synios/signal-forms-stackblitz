import { Component, input, WritableSignal } from "@angular/core";
import { FieldTree, FormField } from "@angular/forms/signals";
import { ErrorMessage } from "../error-message/error-message";
import { IForm, ILinkForm } from "../models/form.models";

@Component({
  selector: "app-links",
  imports: [FormField, ErrorMessage],
  templateUrl: "./links.html",
  styleUrl: "./links.scss",
})
export class Links {
  form = input.required<FieldTree<ILinkForm[], string>>();

  model = input.required<WritableSignal<IForm>>();

  addLink() {
    this.model().update((profile) => ({
      ...profile,
      links: [...profile.links, { url: "", title: "" }],
    }));
  }

  // Delete a social media profile link
  removeLink(index: number) {
    this.model().update((profile) => ({
      ...profile,
      links: profile.links.filter((_, i) => i !== index),
    }));
  }
}
