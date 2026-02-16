import { Component, effect, signal } from "@angular/core";
import { form } from "@angular/forms/signals";
import { Address } from "../address/address";
import { Keywords } from "../keywords/keywords";
import { IForm } from "../models/form.models";
import { Profile } from "../profile/profile";
import { formSchema } from "../schemas/form.schemas";
import { User } from "../user/user";

const formModel = {
  user: {
    username: "asdfsdf",
    password: "",
    passwordConfirm: "",
  },
  profile: {
    title: "",
    firstName: "Hans",
    lastName: "Wurst",
    email: "bla@blub.com",
    phone: "12345",
    primaryContact: "phone",
  },
  links: [],
  address: {
    address: "",
    city: "",
    zip: "",
    country: "",
  },
  keywords: [
    { label: "Frontend", id: "fe", checked: false },
    { label: "Backend", id: "be", checked: false },
    { label: "Fullstack", id: "fs", checked: false },
    { label: "Database", id: "db", checked: false },
    { label: "DevOps", id: "do", checked: false },
    { label: "Hardware", id: "hw", checked: false },
  ],
  languages: [],
};

@Component({
  selector: "app-form",
  imports: [User, Profile, Address, Keywords],
  templateUrl: "./form.html",
  styleUrl: "./form.css",
})
export class Form {
  formModel = signal<IForm>(formModel);

  form = form(this.formModel, formSchema);

  constructor() {
    effect(() => {
      console.log(this.form.keywords().value());
    });
  }
}
