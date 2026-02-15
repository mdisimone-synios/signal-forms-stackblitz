import {
  Component,
  input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FieldState } from '@angular/forms/signals';

@Component({
  selector: 'app-error-message',
  imports: [],
  templateUrl: './error-message.html',
  styleUrl: './error-message.scss',
})
export class ErrorMessage {
  inputForm = input.required<FieldState<any, any>>();
}
