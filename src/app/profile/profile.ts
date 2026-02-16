import { Component, effect, input } from '@angular/core';
import { ErrorMessage } from '../error-message/error-message';
import { FieldTree, FormField } from '@angular/forms/signals';
import { IProfileForm } from '../models/form.models';

const TITLES = [
  { value: 'prof', label: 'Professor' },
  { value: 'sir', label: 'Sir' },
  { value: 'dr', label: 'Doctor' },
];

@Component({
  selector: 'app-profile',
  imports: [FormField, ErrorMessage],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  profileForm = input.required<FieldTree<IProfileForm, string>>();
  titles = TITLES;

  constructor() {
    effect(() => 
    console.log('###',this.profileForm()));
  }
}
