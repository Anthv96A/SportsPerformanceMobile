import { NgModule } from '@angular/core';
import { TidyPipe } from './tidy/tidy';
@NgModule({
	declarations: [TidyPipe],
	imports: [],
	exports: [TidyPipe]
})
export class PipesModule {}
