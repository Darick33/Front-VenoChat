import { Component, effect, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, Form, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  imports: [ ReactiveFormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef (() => CustomInputComponent),
    multi: true
  }],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss'
})
export class CustomInputComponent implements ControlValueAccessor {
  constructor() {
    // effect(() => {
    //   const currentSignal = this.control().value
    //   if(this.control().dirty || this.control().value) {
    //     const newValue = this.control().value
    //     if(currentSignal !== newValue) {
    //       this.onChange(newValue)
    //     }
    //   }

    // }
    // )
  }
  control = input.required<FormControl<any>>();
  onToched = () => {} 
  onChange = (_value: any) => {}
  writeValue(value: any): void {
    if(value !== this.control().value) {
      this.control().setValue(value, {emitEvent: false})
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
    
  }
  registerOnTouched(fn: any): void {
    this.onToched = fn
  }
  setDisabledState(isDisabled: boolean): void {
    if(isDisabled) {
      this.control().disable()
    } else {
      this.control().enable()
    }
  }
  

}
