import { Component, signal } from '@angular/core';
import {
  form,
  minLength,
  apply,
  required,
  schema,
  validate,
  pattern,
  FormField,
} from '@angular/forms/signals';
import { IForm, IUserForm } from '../models/form.models';
import { ErrorMessage } from '../error-message/error-message';

const passwordSchema = schema<IUserForm>((userForm) => {
  required(userForm.password, {
    message: 'Password is required',
  });
  required(userForm.passwordConfirm, {
    message: 'Password is required',
  });
  minLength(userForm.password, 6, {
    message: 'Password must be at least 6 characters long',
  });
  pattern(userForm.password, /[A-Z]/, {
    message: 'Should contain uppercase letters',
  });
  pattern(userForm.password, /[a-z]/, {
    message: 'Should contain lowercase letters',
  });
  pattern(userForm.password, /[0-9]/, {
    message: 'Should contain numbers',
  });
  pattern(userForm.password, /(?=.*\W)/, {
    message: 'Should contain special characters',
  });
  validate(userForm.password, (schemaPath) => {
    const confirmPassword = schemaPath.value(); // Current field value
    const password = schemaPath.valueOf(userForm.passwordConfirm); // Another field's value

    if (confirmPassword !== password) {
      return {
        kind: 'passwordMismatch',
        message: 'Passwords do not match',
      };
    }

    return null;
  });
});

const formSchema = schema<IForm>((rootPath) => {
  required(rootPath.user.username, {
    message: 'Username is required',
  });
  apply(rootPath.user, passwordSchema);
});

const formModel = {
  user: {
    username: '',
    password: '',
    passwordConfirm: '',
  },
  profile: {
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    primaryContact: '',
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
  imports: [FormField, ErrorMessage],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {
  formModel = signal<IForm>(formModel);

  form = form(this.formModel, formSchema);

  constructor() {
    this.form.user.passwordConfirm
  }
}
