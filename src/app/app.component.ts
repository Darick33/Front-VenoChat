import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormChildComponent } from './form-child/form-child.component';
import { toSignal } from '@angular/core/rxjs-interop';
import {  DoomComponent, } from './doom/doom.component';
import { ThemeService } from './services/theme.service';
import { MatIconModule } from '@angular/material/icon';

export interface ItemForm {
  id: FormControl<number>;
  name: FormControl<string>;
  value: FormControl<number>;
}
export type CustomFormGroup = FormGroup<ItemForm>
@Component({
  selector: 'app-root',
  imports: [ ReactiveFormsModule, FormChildComponent, DoomComponent, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {

  private themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  playClickSound() {
  const audio = new Audio();
  audio.src = 'pato.mp3';
  audio.load();
  audio.play().catch(error => {
    console.error('No se pudo reproducir el sonido:', error);
  });
}

  
  fb = inject(NonNullableFormBuilder)
  form: FormGroup<{items: FormArray<CustomFormGroup>}> = this.fb.group({ items : this.fb.array<CustomFormGroup>([])

   })
   get items(){
    return this.form.controls.items

   }
   
   itemChanges = toSignal(this.items.valueChanges);
   totalValue = computed(() => {
     const value = this.itemChanges()?.reduce((total, item) => total + (Number(item.value) || 0), 0)
     return value
    })
   
   addItem() {
    const id = this.items.length + 1
    const itemFornm = this.fb.group<ItemForm>({
      id: this.fb.control(id),
      name: this.fb.control('', {validators: [Validators.required, Validators.email, Validators.minLength(3)]}),
      value: this.fb.control(0, {validators: [Validators.required, ]})
    }
    )
    this.form.controls.items.push(itemFornm)
  }
}    
