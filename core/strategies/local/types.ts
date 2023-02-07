//#region Types

import { SignInResultInterface } from "../../../contracts";

/**
 * Type declaration for token user query result
 *
 * @internal
 */
export type UserInterface = {
  id: number | string;
  username: string;
  user_details: {
    firstname: string;
    lastname: string;
    address?: string;
    phone_number?: string;
    profile_url?: string;
    emails: string[];
  };
  double_auth_active: boolean;
  authorizations: string[];
  roles: string[];
};

/**
 * REST interface type enpoints type declarations
 *
 * @internal
 */
export type RESTInterfaceType = {
  users: string;
  signIn: string;
  signOut: string;
};

export type SingInResultType = SignInResultInterface | undefined;
//#endregion Types
