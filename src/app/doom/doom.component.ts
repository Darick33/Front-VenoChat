import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-doom',
  templateUrl: './doom.component.html',
  styleUrls: ['./doom.component.scss']
})
export class DoomComponent implements OnInit, OnDestroy {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('message', this.receiveMessage.bind(this), false);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('message', this.receiveMessage.bind(this), false);
    }
  }

  receiveMessage(event: MessageEvent): void {
    // Mostrar todos los mensajes recibidos para depuración
    console.log('Mensaje recibido:', event);

    // Verificar el origen del mensaje
    if (event.origin !== 'https://doom-captcha.vercel.app') {
      console.warn('Origen no confiable:', event.origin);
      return; // Ignorar mensajes de orígenes no confiables
    }

    const data = event.data;
    console.log('Datos del mensaje:', data);

    // Procesar el mensaje según su contenido
    if (data === 'completed') {
      console.log('¡Captcha completado!');
      // Aquí puedes ejecutar la lógica para habilitar el formulario o lo que necesites
    } else {
      console.log('Mensaje no reconocido:', data);
    }
  }
}
