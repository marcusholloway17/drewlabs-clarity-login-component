import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CommonStringsPipe } from "./common-strings.pipe";

@NgModule({
  imports: [CommonModule],
  exports: [CommonStringsPipe],
  declarations: [CommonStringsPipe],
})
export class CommonStringsModule {}
