import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { UserForm } from '../interfaces/user.interface';

@Component({
  selector: 'app-form-user',
    imports: [ReactiveFormsModule, CustomInputComponent],
  templateUrl: './form-user.component.html',
  styleUrl: './form-user.component.scss'
})
export class FormUserComponent {
  formGroup = input.required<FormGroup<UserForm>>()

}
