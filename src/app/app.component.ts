import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormChildComponent } from './form-child/form-child.component';
import { toSignal } from '@angular/core/rxjs-interop';
import {  RaycastingComponent } from './doom/doom.component';
export interface ItemForm {
  id: FormControl<number>;
  name: FormControl<string>;
  value: FormControl<number>;
}
export type CustomFormGroup = FormGroup<ItemForm>
@Component({
  selector: 'app-root',
  imports: [ ReactiveFormsModule, FormChildComponent, RaycastingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
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
    constructor() {
      // effect(() => {
        //   this.form.controls.items.valueChanges.subscribe((value) => {
          //     this.items.set([...this.form.controls.items.controls])
          //   })
          // })
        }
   addItem() {
    const id = this.items.length + 1
    const itemFornm = this.fb.group<ItemForm>({
      id: this.fb.control(id),
      name: this.fb.control('', {validators: [Validators.required]}),
      value: this.fb.control(0, {validators: [Validators.required]})
    }
    )
    this.form.controls.items.push(itemFornm)
  }
}    
