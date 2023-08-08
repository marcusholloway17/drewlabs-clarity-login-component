import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { UITextPipe } from "./text.pipe";
import { TEXTS_DICTIONARY } from "./tokens";
import { of } from "rxjs";

@NgModule({
  imports: [CommonModule],
  exports: [UITextPipe],
  declarations: [UITextPipe],
})
export class UITextsModule {
  static forRoot(
    uiTexts: Record<string, unknown>
  ): ModuleWithProviders<UITextsModule> {
    return {
      ngModule: UITextsModule,
      providers: [
        {
          provide: TEXTS_DICTIONARY,
          useFactory: () => {
            return of(uiTexts);
          },
        },
      ],
    };
  }
}
