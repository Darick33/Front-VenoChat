import { FormControl } from "@angular/forms";

export interface User {
    id?: number;
    name: string;
    email: string;
    password?: string;  
    phone: string;
    address: string;

}
export interface UserForm {
    id?: FormControl<number>;
    name: FormControl<string>;
    email: FormControl<string>;
    password?: FormControl<string>;
    phone: FormControl<string>;
    address: FormControl<string>;
}