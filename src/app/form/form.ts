import { Component, signal } from '@angular/core';
import {
  form,
} from '@angular/forms/signals';
import { IForm } from '../models/form.models';
import { User } from '../user/user';
import { formSchema } from '../schemas/form.schemas';
import { Profile } from '../profile/profile';

const formModel = {
  user: {
    username: 'asdfsdf',
    password: '',
    passwordConfirm: '',
  },
  profile: {
    title: '',
    firstName: 'Hans',
    lastName: 'Wurst',
    email: 'bla@blub.com',
    phone: '12345',
    primaryContact: 'phone',
  },
  links: [],
  address: {
    address: '',
    city: '',
    zip: '',
    country: '',
  },
  keywords: {},
  languages: [],
};

@Component({
  selector: 'app-form',
  imports: [User, Profile],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {
  formModel = signal<IForm>(formModel);

  form = form(this.formModel, formSchema);

  constructor() {
  }
}
