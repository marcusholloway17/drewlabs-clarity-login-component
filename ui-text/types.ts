import { Observable } from "rxjs";
import { defaultUITexts } from "./default";

/**
 * @internal
 * UI texts dictionary type definition
 */
export type DictionaryType = typeof defaultUITexts;

/**
 * @internal
 * UI text to preview on form control elements
 */
export type UiTextType = Observable<
  { [index: string]: any } | Record<string, any>
>;
