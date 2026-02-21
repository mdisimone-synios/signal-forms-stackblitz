# Angular Signal Forms

Eine praxisnahe Referenz zu `@angular/forms/signals` basierend auf der Implementierung dieses Projekts.

[Im StackBlitz Editor bearbeiten](https://stackblitz.com/~/github.com/MarcelloDiSimone/signal-forms-stackblitz)

## Globale Konfiguration mit `provideSignalFormsConfig`

Mit `provideSignalFormsConfig` in der `appConfig` lassen sich benutzerdefinierte CSS-Klassennamen definieren, die automatisch auf Input-Elemente angewendet werden – abhängig von deren aktuellem Zustand. Jeder Eintrag ordnet einem Klassennamen eine Prädikatfunktion zu, die den Signal-State des Felds empfängt.

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

Die Klassennamen sind frei wählbar — verwende jede Konvention, die zum eigenen CSS-Framework passt (z. B. Bootstraps `is-valid` / `is-invalid` oder eigene Utility-Klassen). Die Prädikate sind reaktiv und werden bei jeder Änderung des Feldzustands neu ausgewertet.

Wer stattdessen die Standard-Angular-Statusklassen (`ng-valid`, `ng-invalid`, `ng-touched` usw.) bevorzugt, übergibt einfach die eingebaute Konstante `NG_STATUS_CLASSES`:

```typescript
import { NG_STATUS_CLASSES, provideSignalFormsConfig } from "@angular/forms/signals";

provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })
```

## Formular-Setup

Typisiertes Model definieren, Standardwerte per Signal bereitstellen und ein Schema zur Validierung anheften.

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

## Kind-Komponenten per Signal Inputs

Teilbereiche des Formulars werden per `FieldTree` als Signal Input an Kind-Komponenten weitergegeben. Kein `FormGroup`-Durchreichen, keine Provider — einfach Inputs.

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

## Dynamische Formularinhalte (Arrays)

Für dynamische Listen wie Links werden sowohl der `FieldTree` als auch das Model-Signal übergeben. Einträge hinzufügen/entfernen durch Update des Models — das Formular reagiert automatisch.

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

Schemas für Array-Einträge verwenden `applyEach`:

```typescript
export const formSchema = schema<IForm>((rootPath) => {
  applyEach(rootPath.links, linksSchema);
});
```

## Standardmässig Non-Nullable

Signal Forms Felder sind non-nullable. Wo früher bei Reactive Forms `[ngValue]="null"` für Select-Platzhalter verwendet wurde, kommt jetzt ein leerer String zum Einsatz.

```typescript
// Standardwert
profile: { title: "", /* ... */ }
```

```html
<!-- value="" (statisches Attribut) oder [value]="''" (Property Binding) verwenden -->
<!-- NICHT [value]="" verwenden — das ist ein Binding auf einen leeren Ausdruck, kein leerer String -->
<select [formField]="form().title">
  <option disabled selected value="">Select your Title</option>
  @for (title of titles; track title.value) {
    <option [value]="title.value">{{ title.label }}</option>
  }
</select>
```

## Checkboxen

Checkboxen binden direkt an `boolean`-Felder — kein `valueChanges`, kein Casting. Model als boolean definieren, mit `[formField]` binden, fertig.

```typescript
export type IKeyword = { id: string; label: string; checked: boolean };
export type IKeywordsForm = IKeyword[];

// Standardwerte
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

Eine einzelne boolesche Checkbox funktioniert genauso:

```html
<input type="checkbox" [formField]="form.deviatingDeliveryAddress" />
```

## Eigene Validatoren

Eigene Validatoren werden als Funktionen mit `validate` geschrieben. Zugriff auf den aktuellen Feldwert über `ctx.value()`.

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

Einsatz im Schema wie jeder eingebaute Validator:

```typescript
export const linksSchema = schema<ILinkForm>((rootPath) => {
  required(rootPath.url, { message: "If added, the link is required" });
  url(rootPath.url, { message: "The link must be a valid URL" });
});
```

## Zusammengesetzte / Wiederverwendbare Schemas

Wiederverwendbare Validierungslogik in eigenständige Schemas auslagern und mit `apply` zusammensetzen.

```typescript
export const passwordSchema = schema<IUserForm>((userForm) => {
  required(userForm.password, { message: "Password is required" });
  minLength(userForm.password, 6, { message: "Password must be at least 6 characters long" });
  pattern(userForm.password, /[A-Z]/, { message: "Should contain uppercase letters" });
  // ...weitere Regeln...
});

export const userSchema = schema<IUserForm>((userPath) => {
  required(userPath.username, { message: "Username is required" });
  apply(userPath, passwordSchema); // Passwort-Regeln einbinden
});
```

## Feld-übergreifende Validierung mit `value` und `valueOf`

Innerhalb von `validate` wird `value()` für das aktuelle Feld und `valueOf()` zum reaktiven Lesen anderer Felder verwendet.

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

## Asynchrone Validatoren mit `validateHttp`

Validierung gegen ein Backend mit `validateHttp`. Behandelt Request-, Erfolgs- und Fehlerfälle.

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

## Bedingte Validatoren mit `applyWhen`

Validierungsregeln nur anwenden, wenn eine Bedingung erfüllt ist. Die Bedingung ist reaktiv — Validatoren werden automatisch hinzugefügt/entfernt.

```typescript
// Email nur erforderlich, wenn "email" als primärer Kontakt ausgewählt ist
applyWhen(
  profileForm.email,
  ({ valueOf }) => valueOf(profileForm.primaryContact) === "email",
  (emailPath) => {
    required(emailPath, { message: "Email is required" });
  },
);

// Telefon nur erforderlich, wenn "phone" ausgewählt ist
applyWhen(
  profileForm.phone,
  ({ valueOf }) => valueOf(profileForm.primaryContact) === "phone",
  (phonePath) => {
    required(phonePath, { message: "Phone is required" });
  },
);
```

### Bedingt angezeigte & validierte Sektionen mit `hidden` + `applyWhen`

`hidden` und `applyWhen` kombinieren, um ganze Formularbereiche bedingt anzuzeigen und zu validieren. Das `addressSchema` wird sowohl für die Hauptadresse als auch für die Lieferadresse wiederverwendet:

```typescript
// schemas/form.schemas.ts
export const formSchema = schema<IForm>((rootPath) => {
  apply(rootPath.address, addressSchema);       // wird immer validiert
  // ...
  hidden(
    rootPath.deliveryAddress,
    (logic) => !logic.valueOf(rootPath.deviatingDeliveryAddress),
  );
  applyWhen(
    rootPath.deliveryAddress,
    (logic) => logic.valueOf(rootPath.deviatingDeliveryAddress),
    addressSchema,                               // gleiches Schema, wiederverwendet
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

## Wiederverwendbare Fehlermeldungen

Eine einzelne `ErrorMessage`-Komponente behandelt alle Feldfehler. Sie nimmt einen `FieldState`-Input entgegen und zeigt Fehler an, wenn das Feld berührt und ungültig ist.

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

Verwendung — den FieldState übergeben (beachte den `()`-Aufruf zum Unwrappen des Signals):

```html
<input [formField]="form().firstName" />
<app-error-message [inputForm]="form().firstName()" />
```

## Semantische HTML-Attribute

Signal Forms fügen automatisch semantisch korrekte `required`- und `disabled`-Attribute an gebundene Input-Elemente hinzu, basierend auf dem Schema. Kein manuelles `[attr.required]` oder `[attr.disabled]` nötig — hat ein Feld einen `required`-Validator, wird das HTML-Attribut automatisch gesetzt.
