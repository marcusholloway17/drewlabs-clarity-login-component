/**
 * @internal
 * Makes only the list of properties required
 */
export type RequiredProp<T, K extends keyof T> = { [P in K]-?: T[P] };
