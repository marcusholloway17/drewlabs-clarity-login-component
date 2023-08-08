import {
  ChangeDetectorRef,
  Inject,
  Optional,
  Pipe,
  PipeTransform,
} from "@angular/core";
import { map, of } from "rxjs";
import { TEXTS_DICTIONARY } from "./tokens";
import { UiTextType } from "./types";
import { defaultUITexts } from "./default";

function getObjectProperty<T extends { [prop: string]: any }>(
  source: T,
  key: string,
  seperator = "."
) {
  if (
    key === "" ||
    typeof key === "undefined" ||
    key === null ||
    typeof source === "undefined" ||
    source === null
  ) {
    return source ?? undefined;
  }
  if (key.includes(seperator ?? ".")) {
    // Creates an array of inner properties
    const properties = key.split(seperator ?? ".");
    const current = source;
    // Reduce the source object to a single value
    return properties.reduce((carry, prop) => {
      if (carry) {
        carry =
          typeof current === "object" && current !== null && carry[prop]
            ? carry[prop] ?? undefined
            : undefined;
      }
      return carry;
    }, source);
  } else {
    return source ? source[key] : undefined;
  }
}

/**
 * Determines if two objects or two values are equivalent.
 *
 * Two objects or values are considered equivalent if at least one of the following is true:
 *
 * * Both objects or values pass `===` comparison.
 * * Both objects or values are of the same type and all of their properties are equal by
 *   comparing them with `equals`.
 *
 * @param o1 Object or value to compare.
 * @param o2 Object or value to compare.
 * @returns true if arguments are equal.
 */
export function equals(o1: any, o2: any): boolean {
  if (o1 === o2) return true;
  if (o1 === null || o2 === null) return false;
  if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
  let t1 = typeof o1,
    t2 = typeof o2,
    length: number,
    key: any,
    keySet: any;
  if (t1 == t2 && t1 == "object") {
    if (Array.isArray(o1)) {
      if (!Array.isArray(o2)) return false;
      if ((length = o1.length) == o2.length) {
        for (key = 0; key < length; key++) {
          if (!equals(o1[key], o2[key])) return false;
        }
        return true;
      }
    } else {
      if (Array.isArray(o2)) {
        return false;
      }
      keySet = Object.create(null);
      for (key in o1) {
        if (!equals(o1[key], o2[key])) {
          return false;
        }
        keySet[key] = true;
      }
      for (key in o2) {
        if (!(key in keySet) && typeof o2[key] !== "undefined") {
          return false;
        }
      }
      return true;
    }
  }
  return false;
}

function queryValidationMessage(
  state: Record<string, any>,
  key: string,
  interpolateParams: { [index: string]: any }
) {
  let value: string | undefined = getObjectProperty(state, key);
  if (value && interpolateParams) {
    for (const [prop, current] of Object.entries(interpolateParams)) {
      if (value.includes("{{" + prop + "}}")) {
        value = value.replace("{{" + prop + "}}", current);
      }
    }
    return value;
  }
  return value ?? "";
}

@Pipe({
  name: "uiText",
})
export class UITextPipe implements PipeTransform {
  //
  value: string | string[] = "";
  lastKey: string | undefined = undefined;
  lastParams: any[] = [];
  private texts$!: UiTextType;

  /**
   * creates pipe instance
   *
   * @param cdRef
   * @param _texts
   */
  public constructor(
    private cdRef: ChangeDetectorRef,
    @Inject(TEXTS_DICTIONARY)
    @Optional()
    _texts?: UiTextType
  ) {
    this.texts$ = _texts ?? of(defaultUITexts);
  }

  //
  updateValue(key: string, interpolateParams?: object) {
    let onTextValue = (res: string | string[]) => {
      this.value = res !== undefined && res !== null ? res : key;
      this.lastKey = key;
      this.cdRef.markForCheck();
    };
    this.resolveText(key, interpolateParams).subscribe(onTextValue);
  }

  private resolveText(key: string | string[], interpolateParams?: object) {
    if (typeof key === "undefined" || key === null || !key.length) {
      throw new Error(`Parameter "key" required`);
    }
    const isArrayKeys = Array.isArray(key);
    const keys = (isArrayKeys ? key : [key]) as string[];

    return this.texts$.pipe(
      map((state) => {
        const transalations = keys.map((key) =>
          queryValidationMessage(state, key, interpolateParams ?? {})
        );
        if (transalations && !isArrayKeys) {
          return transalations[0];
        }
        return transalations;
      })
    );
  }

  //
  transform(query: string, ...args: any[]): any {
    if (!query || !query.length) {
      return query;
    }
    // if we ask another time for the same key, return the last value
    if (equals(query, this.lastKey) && equals(args, this.lastParams)) {
      return this.value;
    }
    let interpolateParams: Object | undefined = undefined;
    if (!(typeof args[0] === "undefined" || args[0] === null) && args.length) {
      if (typeof args[0] === "string" && args[0].length) {
        // we accept objects written in the template such as {n:1}, {'n':1}, {n:'v'}
        // which is why we might need to change it to real JSON objects such as {"n":1} or {"n":"v"}
        let validArgs: string = args[0]
          .replace(/(\')?([a-zA-Z0-9_]+)(\')?(\s)?:/g, '"$2":')
          .replace(/:(\s)?(\')(.*?)(\')/g, ':"$3"');
        try {
          interpolateParams = JSON.parse(validArgs);
        } catch (e) {
          throw new SyntaxError(
            `Wrong parameter in UITextPipe. Expected a valid Object, received: ${args[0]}`
          );
        }
      } else if (typeof args[0] === "object" && !Array.isArray(args[0])) {
        interpolateParams = args[0];
      }
    }
    this.lastKey = query;
    this.lastParams = args;
    this.updateValue(query, interpolateParams);
    return this.value;
  }
}
