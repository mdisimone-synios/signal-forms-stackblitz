# Angular Signal Forms

A practical reference for `@angular/forms/signals` based on this project's implementation.

[Edit in StackBlitz next generation editor](https://stackblitz.com/~/github.com/MarcelloDiSimone/signal-forms-stackblitz)

## Global Configuration with `provideSignalFormsConfig`

Use `provideSignalFormsConfig` in `appConfig` to define custom CSS class names that are automatically added to input elements based on their current state. Each entry maps a class name to a predicate function that receives the field's signal state.

```typescript
// main.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideSignalFormsConfig({
      classes: {
        "is-touched":   (s) => s.state().touched(),
        "is-untouched": (s) => !s.state().touched(),
        "is-dirty":     (s) => s.state().dirty(),
        "is-pristine":  (s) => !s.state().dirty(),
        "is-valid":     (s) => s.state().touched() && s.state().valid(),
        "is-invalid":   (s) => s.state().touched() && s.state().invalid(),
        "is-pending":   (s) => s.state().pending(),
      },
    }),
  ],
};
```

The class names are fully customizable — use any convention that fits your CSS framework (e.g. Bootstrap's `is-valid` / `is-invalid`, or your own utility classes). The predicates are reactive and re-evaluated whenever the field state changes.

If you prefer the standard Angular state classes (`ng-valid`, `ng-invalid`, `ng-touched`, etc.), pass the built-in `NG_STATUS_CLASSES` constant instead:

```typescript
import { NG_STATUS_CLASSES, provideSignalFormsConfig } from "@angular/forms/signals";

provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })
```

## Form Setup

Define a typed model, provide default values via a signal, and attach a schema for validation.

```typescript
// models/form.models.ts
export type IForm = {
  user: IUserForm;
  profile: IProfileForm;
  address: IAddressForm;
  deviatingDeliveryAddress: boolean;
  deliveryAddress: IAddressForm;
  keywords: IKeywordsForm;
  links: ILinkForm[];
  languages: string[];
};
```

```typescript
// form.ts
formModel = signal<IForm>(this.initialModel());
form = form(this.formModel, formSchema);
```

```typescript
// schemas/form.schemas.ts
export const formSchema = schema<IForm>((rootPath) => {
  apply(rootPath.user, userSchema);
  apply(rootPath.profile, profileSchema);
  apply(rootPath.address, addressSchema);
  applyEach(rootPath.links, linksSchema);
  // ...
});
```

```html
<!-- form.html -->
<app-user [form]="form.user"></app-user>
<app-profile [form]="form.profile"></app-profile>
<app-address [form]="form.address"></app-address>
```

## Child Components via Signal Inputs

Pass subtrees of the form to child components using `FieldTree` as a signal input. No `FormGroup` passing, no providers — just inputs.

```typescript
// user.ts
export class User {
  form = input.required<FieldTree<IUserForm, string>>();
}
```

```html
<!-- user.html -->
<input [formField]="form().username" placeholder="Enter username" />
<app-error-message [inputForm]="form().username()" />
```

## Dynamic Form Content (Arrays)

For dynamic lists like links, pass both the `FieldTree` and the model signal. Add/remove items by updating the model — the form reacts automatically.

```typescript
// links.ts
export class Links {
  form = input.required<FieldTree<ILinkForm[], string>>();
  model = input.required<WritableSignal<IForm>>();

  addLink() {
    this.model().update((m) => ({
      ...m,
      links: [...m.links, { url: "", title: "" }],
    }));
  }

  removeLink(index: number) {
    this.model().update((m) => ({
      ...m,
      links: m.links.filter((_, i) => i !== index),
    }));
  }
}
```

```html
<!-- links.html -->
@for (link of form(); track link; let i = $index) {
  <input [formField]="link.url" placeholder="Enter URL" />
  <input [formField]="link.title" placeholder="Enter title" />
  <button (click)="removeLink(i)">Remove</button>
}
<button (click)="addLink()">Add Link</button>
```

Schemas for array items use `applyEach`:

```typescript
export const formSchema = schema<IForm>((rootPath) => {
  applyEach(rootPath.links, linksSchema);
});
```

## Non-Nullable by Default

Signal forms fields are non-nullable. Where you previously used `[ngValue]="null"` for select placeholders in Reactive Forms, use an empty string instead.

```typescript
// Default value
profile: { title: "", /* ... */ }
```

```html
<!-- Use value="" (static attribute) or [value]="''" (property binding) -->
<!-- Do NOT use [value]="" — that's a binding to an empty expression, not an empty string -->
<select [formField]="form().title">
  <option disabled selected value="">Select your Title</option>
  @for (title of titles; track title.value) {
    <option [value]="title.value">{{ title.label }}</option>
  }
</select>
```

## Checkboxes

Checkboxes bind to `boolean` fields directly — no `valueChanges`, no casting. Define the model as boolean, bind with `[formField]`, done.

```typescript
export type IKeyword = { id: string; label: string; checked: boolean };
export type IKeywordsForm = IKeyword[];

// Default values
keywords: [
  { label: "Frontend", id: "fe", checked: false },
  { label: "Backend", id: "be", checked: false },
]
```

```html
@for (keyword of form(); track keyword.id().value(); let i = $index) {
  <input type="checkbox" [formField]="keyword.checked" />
  <label>{{ keyword.label().value() }}</label>
}
```

A standalone boolean checkbox works the same way:

```html
<input type="checkbox" [formField]="form.deviatingDeliveryAddress" />
```

## Custom Validators

Write custom validators as functions using `validate`. Access the current field value via `ctx.value()`.

```typescript
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
```

Use it in a schema like any built-in validator:

```typescript
export const linksSchema = schema<ILinkForm>((rootPath) => {
  required(rootPath.url, { message: "If added, the link is required" });
  url(rootPath.url, { message: "The link must be a valid URL" });
});
```

## Composed / Reusable Schemas

Extract reusable validation logic into standalone schemas and compose them with `apply`.

```typescript
export const passwordSchema = schema<IUserForm>((userForm) => {
  required(userForm.password, { message: "Password is required" });
  minLength(userForm.password, 6, { message: "Password must be at least 6 characters long" });
  pattern(userForm.password, /[A-Z]/, { message: "Should contain uppercase letters" });
  // ...more rules...
});

export const userSchema = schema<IUserForm>((userPath) => {
  required(userPath.username, { message: "Username is required" });
  apply(userPath, passwordSchema); // compose the password rules
});
```

## Cross-Field Validation with `value` and `valueOf`

Inside `validate`, use `value()` for the current field and `valueOf()` to read other fields reactively.

```typescript
validate(userForm.password, (schemaPath) => {
  const confirmPassword = schemaPath.value();
  const password = schemaPath.valueOf(userForm.passwordConfirm);

  if (confirmPassword !== password) {
    return { kind: "passwordMismatch", message: "Passwords do not match" };
  }
  return null;
});
```

## Async Validators with `validateHttp`

Validate against a backend using `validateHttp`. Handles request, success, and error cases.

```typescript
validateHttp(userPath.username, {
  request: ({ value }) => `/api/check-username?username=${value()}`,
  onSuccess: (response: any) => {
    if (response.taken) {
      return { kind: "usernameTaken", message: "Username is already taken" };
    }
    return null;
  },
  onError: (error) => ({
    kind: "networkError",
    message: "Could not verify username availability",
  }),
});
```

## Conditional Validators with `applyWhen`

Apply validation rules only when a condition is met. The condition is reactive — validators are added/removed automatically.

```typescript
// Require email only when "email" is selected as primary contact
applyWhen(
  profileForm.email,
  ({ valueOf }) => valueOf(profileForm.primaryContact) === "email",
  (emailPath) => {
    required(emailPath, { message: "Email is required" });
  },
);

// Require phone only when "phone" is selected
applyWhen(
  profileForm.phone,
  ({ valueOf }) => valueOf(profileForm.primaryContact) === "phone",
  (phonePath) => {
    required(phonePath, { message: "Phone is required" });
  },
);
```

### Conditionally Shown & Validated Sections with `hidden` + `applyWhen`

Combine `hidden` and `applyWhen` to conditionally show and validate entire form sections. The `addressSchema` is reused for both the main address and the delivery address:

```typescript
// schemas/form.schemas.ts
export const formSchema = schema<IForm>((rootPath) => {
  apply(rootPath.address, addressSchema);       // always validated
  // ...
  hidden(
    rootPath.deliveryAddress,
    (logic) => !logic.valueOf(rootPath.deviatingDeliveryAddress),
  );
  applyWhen(
    rootPath.deliveryAddress,
    (logic) => logic.valueOf(rootPath.deviatingDeliveryAddress),
    addressSchema,                               // same schema, reused
  );
});
```

```html
<!-- form.html -->
<app-address [form]="form.address"></app-address>

<input type="checkbox" [formField]="form.deviatingDeliveryAddress" />
<label>deviating delivery address</label>

@if (!form.deliveryAddress().hidden()) {
  <app-address [form]="form.deliveryAddress"></app-address>
}
```

## Reusable Error Messages

A single `ErrorMessage` component handles all field errors. It takes a `FieldState` input and displays errors when the field is touched and invalid.

```typescript
@Component({ selector: "app-error-message" })
export class ErrorMessage {
  inputForm = input.required<FieldState<any, any>>();
}
```

```html
<!-- error-message.html -->
@if (inputForm().touched() && inputForm().invalid()) {
  @for (error of inputForm().errors(); track error) {
    <div class="text-danger">{{ error.message }}</div>
  }
}
```

Usage — pass the field state (note the `()` call to unwrap the signal):

```html
<input [formField]="form().firstName" />
<app-error-message [inputForm]="form().firstName()" />
```

## Semantic HTML Attributes

Signal forms automatically add semantically correct `required` and `disabled` attributes to bound input elements based on the schema. No manual `[attr.required]` or `[attr.disabled]` bindings needed — if a field has a `required` validator, the HTML attribute is set automatically.
