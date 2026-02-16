/* Add application styles & imports to this file! */

export type MultiFormData = {
  label: string;
  value: string;
};

export type MultiCheckboxData = { id: string; label: string; checked: boolean };

export type IUserForm = {
  username: string;
  password: string;
  passwordConfirm: string;
};

export type IProfileForm = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primaryContact: string;
};

export type IAddressForm = {
  address: string;
  city: string;
  zip: string;
  country: string;
};

export type IKeyword = { id: string; label: string; checked: boolean };

export type IKeywordsForm = IKeyword[];

export type ILinkForm = {
  url: string;
  title: string;
};

export type IForm = {
  user: IUserForm;
  profile: IProfileForm;
  address: IAddressForm;
  keywords: IKeywordsForm;
  links: ILinkForm[];
  languages: string[];
};
