import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from '../tokens/localStorache';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly darkModeKey = 'darkMode';

  constructor(@Inject(LOCAL_STORAGE) private storage: Storage) {
    const darkMode = this.storage.getItem(this.darkModeKey) === 'true';
    if (darkMode) {
      document.body.classList.add('dark');  // Agregar clase 'dark' al body
    }
  }
  applyStoredTheme(): void {
  const darkMode = this.storage.getItem(this.darkModeKey) === 'true';
  if (darkMode) {
    document.body.classList.add('dark');
  }
}


  toggleTheme(): void {
    const isDarkMode = document.body.classList.toggle('dark');
    this.storage.setItem(this.darkModeKey, String(isDarkMode));  // Guardar el estado en localStorage
  }
}
