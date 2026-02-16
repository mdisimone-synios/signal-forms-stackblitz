import { apply, applyWhen, email, minLength, pattern, required, schema, validate } from "@angular/forms/signals";
import { IForm, IProfileForm, IUserForm } from "../models/form.models";

export const passwordSchema = schema<IUserForm>((userForm) => {
    required
    (userForm.password, {
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
  
  export const userSchema = schema<IUserForm>((userPath) => {
    required(userPath.username, {
      message: 'Username is required',
    });
    apply(userPath, passwordSchema);
  });



  export const profileSchema = schema<IProfileForm>((profileForm) => {
    required(profileForm.firstName, {
      message: 'Firstname is required',
    });
    required(profileForm.lastName, {
      message: 'Lastname is required',
    });
    email(profileForm.email);
    applyWhen(
      profileForm.email,
      ({ valueOf }) => valueOf(profileForm.primaryContact) === 'email',
      (emailPath) => {
        required(emailPath, { message: 'Email is required' });
      }
    );
    applyWhen(
      profileForm.phone,
      ({ valueOf }) => valueOf(profileForm.primaryContact) === 'email',
      (phonePath) => {
        required(phonePath, { message: 'Email is required' });
      }
    );
  });
  
  export const formSchema = schema<IForm>((rootPath) => {
    apply(rootPath.user, userSchema);
    apply(rootPath.profile, profileSchema);
  });