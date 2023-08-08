import { InjectionToken } from "@angular/core";
import { defaultUITexts } from "./default";

/**
 * @internal
 * 
 * UI Texts dictionary type declaration
 */
export const TEXTS_DICTIONARY = new InjectionToken<
  typeof defaultUITexts
>("UI Transaltion dictionnary");
