import { Component, input } from "@angular/core";
import { FieldTree, FormField } from "@angular/forms/signals";
import { ErrorMessage } from "../error-message/error-message";
import { IAddressForm, MultiFormData } from "../models/form.models";

const COUNTRIES: MultiFormData[] = [
  { value: "de-DE", label: "Germany" },
  { value: "de-AU", label: "Austria" },
  { value: "de-CH", label: "Swiss" },
  { value: "fr-FR", label: "France" },
  { value: "en-US", label: "USA" },
  { value: "en-AU", label: "Australia" },
  { value: "en-GB", label: "Great Britain" },
];

@Component({
  selector: "app-address",
  imports: [ErrorMessage, FormField, ErrorMessage],
  templateUrl: "./address.html",
  styleUrl: "./address.scss",
})
export class Address {
  form = input.required<FieldTree<IAddressForm, string>>();

  countries = COUNTRIES;
}
