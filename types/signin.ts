
export interface SignInResultInterface {
    provider: string;
    id: string|number;
    emails: string[];
    name: string;
    photoUrl?: string;
    firstName: string;
    lastName: string;
    authToken: string;
    idToken: string;
    authorizationCode?: string;
    response: any;
    scopes?: string[];
    expiresAt?: string;
    phoneNumber?: string;
    address?: string;
    birthdate?: string;
}

export interface DoubleAuthSignInResultInterface {
    is2faEnabled: boolean;
    auth2faToken: string;
}

export interface UnAuthenticatedResultInterface {
    locked?: boolean;
    authenticated: boolean;
}

export type SignInResult = Partial<SignInResultInterface> | DoubleAuthSignInResultInterface | UnAuthenticatedResultInterface;

type LocalSignInOptionsType = {
    username: string;
    password: string;
    remember: string
};

type ScopeSignInOptionsType = {
    scopes: string[] | string;
};

export type SignInOptionsType = LocalSignInOptionsType | ScopeSignInOptionsType;
