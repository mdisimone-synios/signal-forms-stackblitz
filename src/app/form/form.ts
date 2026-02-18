import { Component, effect, signal } from "@angular/core";
import { form, FormField } from "@angular/forms/signals";
import { Address } from "../address/address";
import { Keywords } from "../keywords/keywords";
import { Links } from "../links/links";
import { IForm } from "../models/form.models";
import { Profile } from "../profile/profile";
import { formSchema } from "../schemas/form.schemas";
import { User } from "../user/user";

@Component({
  selector: "app-form",
  imports: [User, Profile, Address, Keywords, FormField, Links],
  templateUrl: "./form.html",
  styleUrl: "./form.scss",
})
export class Form {
  formModel = signal<IForm>(this.initializeCustomerModel());

  form = form(this.formModel, formSchema);

  constructor() {
    effect(() => {
      console.log(this.form.keywords().value());
    });
  }

  initializeCustomerModel() {
    return {
      user: {
        username: "",
        password: "",
        passwordConfirm: "",
      },
      profile: {
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        primaryContact: "",
      },
      links: [],
      address: {
        address: "",
        city: "",
        zip: "",
        country: "",
      },
      deviatingDeliveryAddress: false,
      deliveryAddress: {
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
  }
}
