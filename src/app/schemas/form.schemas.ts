import {
  apply,
  applyEach,
  applyWhen,
  email,
  hidden,
  max,
  min,
  minLength,
  pattern,
  required,
  schema,
  SchemaPathTree,
  validate,
} from "@angular/forms/signals";
import {
  IAddressForm,
  IForm,
  IKeywordsForm,
  ILinkForm,
  IProfileForm,
  IUserForm,
} from "../models/form.models";

export const passwordSchema = schema<IUserForm>((userForm) => {
  required(userForm.password, {
    message: "Password is required",
  });
  required(userForm.passwordConfirm, {
    message: "Password is required",
  });
  minLength(userForm.password, 6, {
    message: "Password must be at least 6 characters long",
  });
  pattern(userForm.password, /[A-Z]/, {
    message: "Should contain uppercase letters",
  });
  pattern(userForm.password, /[a-z]/, {
    message: "Should contain lowercase letters",
  });
  pattern(userForm.password, /[0-9]/, {
    message: "Should contain numbers",
  });
  pattern(userForm.password, /(?=.*\W)/, {
    message: "Should contain special characters",
  });
  validate(userForm.password, (schemaPath) => {
    const confirmPassword = schemaPath.value(); // Current field value
    const password = schemaPath.valueOf(userForm.passwordConfirm); // Another field's value

    if (confirmPassword !== password) {
      return {
        kind: "passwordMismatch",
        message: "Passwords do not match",
      };
    }

    return null;
  });
});

export const userSchema = schema<IUserForm>((userPath) => {
  required(userPath.username, {
    message: "Username is required",
  });
  // WE DO NOT HAVE A BACKEND YET
  // validateHttp(userPath.username, {
  //   request: ({ value }) => `/api/check-username?username=${value()}`,
  //   onSuccess: (response: any) => {
  //     if (response.taken) {
  //       return {
  //         kind: "usernameTaken",
  //         message: "Username is already taken",
  //       };
  //     }
  //     return null;
  //   },
  //   onError: (error) => ({
  //     kind: "networkError",
  //     message: "Could not verify username availability",
  //   }),
  // });
  apply(userPath, passwordSchema);
});

export const profileSchema = schema<IProfileForm>((profileForm) => {
  required(profileForm.firstName, {
    message: "Firstname is required",
  });
  required(profileForm.lastName, {
    message: "Lastname is required",
  });
  email(profileForm.email);
  applyWhen(
    profileForm.email,
    ({ valueOf }) => valueOf(profileForm.primaryContact) === "email",
    (emailPath) => {
      required(emailPath, { message: "Email is required" });
    },
  );
  applyWhen(
    profileForm.phone,
    ({ valueOf }) => valueOf(profileForm.primaryContact) === "phone",
    (phonePath) => {
      required(phonePath, { message: "Phone is required" });
    },
  );
});

export const addressSchema = schema<IAddressForm>((userPath) => {
  required(userPath.address, {
    message: "Address is required",
  });
  required(userPath.zip, {
    message: "ZIP is required",
  });
  required(userPath.city, {
    message: "City is required",
  });
  required(userPath.country, {
    message: "Country is required",
  });
  min(userPath.zip, 0);
  max(userPath.zip, 99999);
});

function url(field: SchemaPathTree<string>, options?: { message?: string }) {
  validate(field, (ctx) => {
    try {
      new URL(ctx.value());
      return null;
    } catch {
      return {
        kind: "url",
        message: options?.message || "Please enter a valid URL",
      };
    }
  });
}

export const keywordsSchema = schema<IKeywordsForm>((keywordsPath) => {});

export const linksSchema = schema<ILinkForm>((rootPath) => {
  required(rootPath.title, { message: "If added, the link title is required" });
  required(rootPath.url, { message: "If added, the link is required" });
  url(rootPath.url, { message: "The link must be a valid URL" });
});

export const formSchema = schema<IForm>((rootPath) => {
  apply(rootPath.user, userSchema);
  apply(rootPath.profile, profileSchema);
  apply(rootPath.address, addressSchema);
  apply(rootPath.keywords, keywordsSchema);
  applyEach(rootPath.links, linksSchema);
  hidden(
    rootPath.deliveryAddress,
    (logic) => !logic.valueOf(rootPath.deviatingDeliveryAddress),
  );
  applyWhen(
    rootPath.deliveryAddress,
    (logic) => logic.valueOf(rootPath.deviatingDeliveryAddress),
    addressSchema,
  );
});
