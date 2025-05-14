import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-full',
  imports: [],
  templateUrl: './full.component.html',
  styleUrl: './full.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class FullComponent {

  private themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  playClickSound() {
  const audio = new Audio();
  audio.src = 'cuak.mp3';
  audio.load();
  audio.play().catch(error => {
    console.error('No se pudo reproducir el sonido:', error);
  });
}
}
