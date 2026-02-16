import { Component, effect, input } from '@angular/core';
import { IUserForm } from '../models/form.models';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ErrorMessage } from '../error-message/error-message';

@Component({
  selector: 'app-user',
  imports: [FormField, ErrorMessage],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  userForm = input.required<FieldTree<IUserForm, string>>();
  constructor() {
    effect(() => console.log('###',this.userForm()));
  }
}
