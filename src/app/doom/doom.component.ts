import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-raycasting',
  standalone: true,
  imports: [],
  template: `
    <canvas #gameCanvas [width]="canvasAncho" [height]="canvasAlto" [style.width.px]="800" [style.height.px]="800" style="border:2px solid #000000;"></canvas>
  `,
  styles: []
})
export class RaycastingComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private FPS = 50;
  private intervalId: any;
  
  // Canvas dimensions
  canvasAncho = 500;
  canvasAlto = 500;
  
  private tamTile = 50;
  private escenario!: Level;
  private jugador!: Player;
  private modo = 0; // Raycasting = 0, Map = 1
  
  // Sprite-related
  private tiles!: HTMLImageElement;
  private imgArmor!: HTMLImageElement;
  private imgPlanta!: HTMLImageElement;
  private sprites: Sprite[] = [];
  private zBuffer: number[] = [];
  
  // FOV constants
  private readonly FOV = 60;
  private readonly FOVRadianes = this.convierteRadianes(this.FOV);
  private readonly FOV_medio = this.convierteRadianes(this.FOV / 2);
  
  // Level design
  private nivel1 = [
    [1, 1, 2, 1, 1, 1, 2, 2, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 1, 2, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 3, 3, 1],
    [1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize default values
  }

  ngAfterViewInit(): void {
  const canvas = this.canvasRef.nativeElement;
  this.ctx = canvas.getContext('2d')!;
  this.loadImages(() => {
    this.inicializa(); // solo cuando todo está cargado
  });
}


  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  @HostListener('document:keydown', ['$event'])
  keyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        this.jugador.arriba();
        break;
      case 'ArrowDown':
        this.jugador.abajo();
        break;
      case 'ArrowRight':
        this.jugador.derecha();
        break;
      case 'ArrowLeft':
        this.jugador.izquierda();
        break;
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyUp(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        this.jugador.avanzaSuelta();
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        this.jugador.giraSuelta();
        break;
      case ' ':
        this.cambiaModo();
        break;
    }
  }

  private inicializa(): void {
    this.ctx.drawImage(this.tiles, 0, 0, 64, 64, 200, 200, 64, 64);


    this.jugador = new Player(this.ctx, this.escenario, 100, 100, this.FOV, this.canvasAncho, this.canvasAlto, this.tamTile, this.zBuffer, this.tiles);

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Load textures
    this.loadImages(() => {
      console.log('Images loaded successfully');
    });

    // Create level and player
    this.escenario = new Level(canvas, this.ctx, this.nivel1, this.tamTile);
    this.jugador = new Player(this.ctx, this.escenario, 100, 100, this.FOV, this.canvasAncho, this.canvasAlto, this.tamTile, this.zBuffer, this.tiles);

    // Load sprites after creating the level and player
    this.inicializaSprites();

    // Start main loop
    this.intervalId = setInterval(() => this.principal(), 1000 / this.FPS);
  }

  private loadImages(callback: () => void): void {
  let loaded = 0;
  const total = 3;

  const onLoad = () => {
    loaded++;
    if (loaded === total) {
      callback();
    }
  };

  // Load wall textures
  this.tiles = new Image();
  this.tiles.src = 'img/walls.png';
  this.tiles.onload = onLoad;

  // Load sprite images
  this.imgArmor = new Image();
  this.imgArmor.src = 'img/armor.png';
  this.imgArmor.onload = onLoad;

  this.imgPlanta = new Image();
  this.imgPlanta.src = 'img/planta.png';
  this.imgPlanta.onload = onLoad;
}


  private inicializaSprites(): void {
    // Create sprite objects
    this.sprites[0] = new Sprite(300, 120, this.imgArmor);
    this.sprites[1] = new Sprite(150, 150, this.imgArmor);
    this.sprites[2] = new Sprite(320, 300, this.imgPlanta);
    this.sprites[3] = new Sprite(300, 380, this.imgPlanta);
  }

  private cambiaModo(): void {
    this.modo = this.modo === 0 ? 1 : 0;
  }

  private borraCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.width;
    canvas.height = canvas.height;
  }

  private sueloTecho(): void {
    // Draw ceiling
    this.ctx.fillStyle = '#666666';
    this.ctx.fillRect(0, 0, 500, 250);
    
    // Draw floor
    this.ctx.fillStyle = '#752300';
    this.ctx.fillRect(0, 250, 500, 500);
  }

  private renderSprites(): void {
    // Sort sprites by distance (descending order)
    this.sprites.sort((obj1, obj2) => obj2.distancia - obj1.distancia);
    
    // Draw sprites one by one
    for (let a = 0; a < this.sprites.length; a++) {
      this.sprites[a].dibuja(
        this.jugador,
        this.ctx,
        this.canvasAncho,
        this.canvasAlto,
        this.zBuffer,
        this.modo,
        this.FOV
      );
    }
  }

  private principal(): void {
    this.borraCanvas();
    
    if (this.modo === 1) {
      this.escenario.dibuja();
    }

    if (this.modo === 0) {
      this.sueloTecho();
    }
    
    this.jugador.dibuja(this.modo);
    this.renderSprites();
  }

  // Utility functions
  private normalizaAngulo(angulo: number): number {
    angulo = angulo % (2 * Math.PI);
    
    if (angulo < 0) {
      angulo = (2 * Math.PI) + angulo;
    }
    
    return angulo;
  }

  private convierteRadianes(angulo: number): number {
    return angulo * (Math.PI / 180);
  }

  private distanciaEntrePuntos(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
}

// Level class
class Level {
  private altoM: number;
  private anchoM: number;
  private altoC: number;
  private anchoC: number;
  public altoT: number;
  public anchoT: number;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private matriz: number[][],
    private tamTile: number
  ) {
    // Matrix dimensions
    this.altoM = this.matriz.length;
    this.anchoM = this.matriz[0].length;
    
    // Canvas dimensions
    this.altoC = this.canvas.height;
    this.anchoC = this.canvas.width;
    
    // Tile size
    this.altoT = this.tamTile;
    this.anchoT = this.tamTile;
  }

  colision(x: number, y: number): boolean {
    return this.matriz[y][x] !== 0;
  }

  tile(x: number, y: number): number {
    const casillaX = Math.floor(x / this.anchoT);
    const casillaY = Math.floor(y / this.altoT);
    return this.matriz[casillaY][casillaX];
  }

  dibuja(): void {
    let color: string;
    
    for (let y = 0; y < this.altoM; y++) {
      for (let x = 0; x < this.anchoM; x++) {
        color = this.matriz[y][x] !== 0 ? '#000000' : '#666666';
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.anchoT, y * this.altoT, this.anchoT, this.altoT);
      }
    }
  }
}

// Ray class
class Rayo {
  private wallHitX = 0;
  private wallHitY = 0;
  private wallHitXHorizontal = 0;
  private wallHitYHorizontal = 0;
  private wallHitXVertical = 0;
  private wallHitYVertical = 0;
  public distancia = 0;
  private pixelTextura = 0;
  private idTextura = 0;
  private angulo: number;
  private izquierda = false;
  private abajo = false;
  private distanciaPlanoProyeccion: number;
  private hCamara = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private escenario: Level,
    public x: number,
    public y: number,
    private anguloJugador: number,
    private incrementoAngulo: number,
    private columna: number,
    private canvasAncho: number,
    private zBuffer: number[],
    private tiles: HTMLImageElement,
    private canvasAlto: number,
    private FOV: number
  ) {
    this.angulo = this.normalizaAngulo(anguloJugador + incrementoAngulo);
    this.distanciaPlanoProyeccion = (canvasAncho / 2) / Math.tan(this.convierteRadianes(FOV) / 2);
  }

  setAngulo(angulo: number): void {
    this.anguloJugador = angulo;
    this.angulo = this.normalizaAngulo(angulo + this.incrementoAngulo);
  }

  private normalizaAngulo(angulo: number): number {
    angulo = angulo % (2 * Math.PI);
    
    if (angulo < 0) {
      angulo = (2 * Math.PI) + angulo;
    }
    
    return angulo;
  }

  private convierteRadianes(angulo: number): number {
    return angulo * (Math.PI / 180);
  }

  private distanciaEntrePuntos(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }

  cast(): void {
    let xIntercept = 0;
    let yIntercept = 0;
    let xStep = 0;
    let yStep = 0;
    const tamTile = this.escenario.anchoT;

    // Determine ray direction
    this.abajo = false;
    this.izquierda = false;

    if (this.angulo < Math.PI) {
      this.abajo = true;
    }

    if (this.angulo > Math.PI / 2 && this.angulo < 3 * Math.PI / 2) {
      this.izquierda = true;
    }

    // Horizontal check
    let choqueHorizontal = false;

    // Find first horizontal intersection
    yIntercept = Math.floor(this.y / tamTile) * tamTile;
    
    if (this.abajo) {
      yIntercept += tamTile;
    }
    
    const adyacente = (yIntercept - this.y) / Math.tan(this.angulo);
    xIntercept = this.x + adyacente;

    // Calculate steps
    yStep = tamTile;
    xStep = yStep / Math.tan(this.angulo);
    
    if (!this.abajo) {
      yStep = -yStep;
    }

    if ((this.izquierda && xStep > 0) || (!this.izquierda && xStep < 0)) {
      xStep *= -1;
    }

    let siguienteXHorizontal = xIntercept;
    let siguienteYHorizontal = yIntercept;
    
    if (!this.abajo) {
      siguienteYHorizontal--;
    }

    // Find horizontal collision
    while (!choqueHorizontal) {
      const casillaX = Math.floor(siguienteXHorizontal / tamTile);
      const casillaY = Math.floor(siguienteYHorizontal / tamTile);
      
      if (this.escenario.colision(casillaX, casillaY)) {
        choqueHorizontal = true;
        this.wallHitXHorizontal = siguienteXHorizontal;
        this.wallHitYHorizontal = siguienteYHorizontal;
      } else {
        siguienteXHorizontal += xStep;
        siguienteYHorizontal += yStep;
      }
    }

    // Vertical check
    let choqueVertical = false;

    // Find first vertical intersection
    xIntercept = Math.floor(this.x / tamTile) * tamTile;
    
    if (!this.izquierda) {
      xIntercept += tamTile;
    }
    
    const opuesto = (xIntercept - this.x) * Math.tan(this.angulo);
    yIntercept = this.y + opuesto;

    // Calculate steps
    xStep = tamTile;
    
    if (this.izquierda) {
      xStep *= -1;
    }
    
    yStep = tamTile * Math.tan(this.angulo);
    
    if ((!this.abajo && yStep > 0) || (this.abajo && yStep < 0)) {
      yStep *= -1;
    }

    let siguienteXVertical = xIntercept;
    let siguienteYVertical = yIntercept;
    
    if (this.izquierda) {
      siguienteXVertical--;
    }

    // Find vertical collision
    while (!choqueVertical && 
           (siguienteXVertical >= 0 && 
            siguienteYVertical >= 0 && 
            siguienteXVertical < this.canvasAncho && 
            siguienteYVertical < this.canvasAlto)) {
      
      const casillaX = Math.floor(siguienteXVertical / tamTile);
      const casillaY = Math.floor(siguienteYVertical / tamTile);
      
      if (this.escenario.colision(casillaX, casillaY)) {
        choqueVertical = true;
        this.wallHitXVertical = siguienteXVertical;
        this.wallHitYVertical = siguienteYVertical;
      } else {
        siguienteXVertical += xStep;
        siguienteYVertical += yStep;
      }
    }

    // Find the shortest distance
    let distanciaHorizontal = 9999;
    let distanciaVertical = 9999;
    
    if (choqueHorizontal) {
      distanciaHorizontal = this.distanciaEntrePuntos(
        this.x, this.y, this.wallHitXHorizontal, this.wallHitYHorizontal
      );
    }
    
    if (choqueVertical) {
      distanciaVertical = this.distanciaEntrePuntos(
        this.x, this.y, this.wallHitXVertical, this.wallHitYVertical
      );
    }

    // Use the shortest distance
    if (distanciaHorizontal < distanciaVertical) {
      this.wallHitX = this.wallHitXHorizontal;
      this.wallHitY = this.wallHitYHorizontal;
      this.distancia = distanciaHorizontal;
      
      // Texture pixel
      const casilla = Math.floor(this.wallHitX / tamTile);
      this.pixelTextura = this.wallHitX - (casilla * tamTile);
      
      // Texture ID
      this.idTextura = this.escenario.tile(this.wallHitX, this.wallHitY);
    } else {
      this.wallHitX = this.wallHitXVertical;
      this.wallHitY = this.wallHitYVertical;
      this.distancia = distanciaVertical;
      
      // Texture pixel
      const casilla = Math.floor(this.wallHitY / tamTile) * tamTile;
      this.pixelTextura = this.wallHitY - casilla;
      
      // Texture ID
      this.idTextura = this.escenario.tile(this.wallHitX, this.wallHitY);
    }

    // Fix fish-eye effect
    this.distancia = this.distancia * (Math.cos(this.anguloJugador - this.angulo));
    
    // Store distance in zbuffer
    this.zBuffer[this.columna] = this.distancia;
  }

  color(): string {
    // Create color shade based on distance
    const paso = 526344;
    const bloque = Math.floor(this.canvasAlto / 36);
    const matiz = Math.floor(this.distancia / bloque);
    const gris = matiz * paso;
    const colorHex = "#" + gris.toString(16);
    
    return colorHex;
  }

  renderPared(): void {
    const altoTile = 500;
    const alturaMuro = (altoTile / this.distancia) * this.distanciaPlanoProyeccion;
    
    // Calculate wall rendering position
    const y0 = Math.floor(this.canvasAlto / 2) - Math.floor(alturaMuro / 2);
    const y1 = y0 + alturaMuro;
    const x = this.columna;
    
    const altura = 0;
    
    // Draw with texture
    const altoTextura = 64;
    const alturaTextura = y0 - y1;
    
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      this.tiles,
      this.pixelTextura,
      ((this.idTextura - 1) * altoTextura),
      1,
      63,
      x,
      y1 + altura,
      1,
      alturaTextura
    );
  }

  dibuja(modo: number): void {
    // Cast ray
    this.cast();
    
    if (modo === 0) {
      this.renderPared();
    }
    
    if (modo === 1) {
      // Draw ray direction line
      const xDestino = this.wallHitX;
      const yDestino = this.wallHitY;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(xDestino, yDestino);
      this.ctx.strokeStyle = "red";
      this.ctx.stroke();
    }
  }
}

// Player class
class Player {
  private avanza = 0;
  private gira = 0;
  private anguloRotacion = 0;
  private velGiro: number;
  private velMovimiento = 3;
  private numRayos: number;
  private rayos: Rayo[] = [];
  
  constructor(
    
    private ctx: CanvasRenderingContext2D,
    private escenario: Level,
    public x: number,
    public y: number,
    private FOV: number,
    private canvasAncho: number,
    private canvasAlto: number,
    private tamTile: number,
     private zBuffer: number[],
  private tiles: HTMLImageElement
  ) {
    this.velGiro = this.convierteRadianes(3);
    this.numRayos = canvasAncho;
    
    // Create rays
    const medioFOV = FOV / 2;
    const incrementoAngulo = this.convierteRadianes(FOV / this.numRayos);
    const anguloInicial = this.convierteRadianes(this.anguloRotacion - medioFOV);
    
    let anguloRayo = anguloInicial;
    
    for (let i = 0; i < this.numRayos; i++) {
      // We need to pass the tiles texture when creating rays
      this.rayos[i] = new Rayo(
        this.ctx,
        this.escenario,
        this.x,
        this.y,
        this.anguloRotacion,
        anguloRayo,
        i,
        this.canvasAncho,
        this.zBuffer,
        new Image(), // This will be replaced later
        this.canvasAlto,
        this.FOV
      );
      anguloRayo += incrementoAngulo;
    }
  }

  // Movement controls
  arriba(): void {
    this.avanza = 1;
  }
  
  abajo(): void {
    this.avanza = -1;
  }
  
  derecha(): void {
    this.gira = 1;
  }
  
  izquierda(): void {
    this.gira = -1;
  }
  
  avanzaSuelta(): void {
    this.avanza = 0;
  }
  
  giraSuelta(): void {
    this.gira = 0;
  }
  
  private colision(x: number, y: number): boolean {
    const casillaX = Math.floor(x / this.escenario.anchoT);
    const casillaY = Math.floor(y / this.escenario.altoT);
    
    return this.escenario.colision(casillaX, casillaY);
  }
  
  private actualiza(): void {
    // Movement
    const nuevaX = this.x + this.avanza * Math.cos(this.anguloRotacion) * this.velMovimiento;
    const nuevaY = this.y + this.avanza * Math.sin(this.anguloRotacion) * this.velMovimiento;
    
    if (!this.colision(nuevaX, nuevaY)) {
      this.x = nuevaX;
      this.y = nuevaY;
    }
    
    // Rotation
    this.anguloRotacion += this.gira * this.velGiro;
    this.anguloRotacion = this.normalizaAngulo(this.anguloRotacion);
    
    // Update rays
    for (let i = 0; i < this.numRayos; i++) {
      this.rayos[i].x = this.x;
      this.rayos[i].y = this.y;
      this.rayos[i].setAngulo(this.anguloRotacion);
    }
  }
  
  dibuja(modo: number): void {
    // Update before drawing
    this.actualiza();
    
    // Draw rays
    for (let i = 0; i < this.numRayos; i++) {
      this.rayos[i].dibuja(modo);
    }
    
    if (modo === 1) {
      // Draw player point
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
      
      // Draw direction line
      const xDestino = this.x + Math.cos(this.anguloRotacion) * 40;
      const yDestino = this.y + Math.sin(this.anguloRotacion) * 40;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(xDestino, yDestino);
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.stroke();
    }
  }
  
  private convierteRadianes(angulo: number): number {
    return angulo * (Math.PI / 180);
  }
  
  private normalizaAngulo(angulo: number): number {
    angulo = angulo % (2 * Math.PI);
    
    if (angulo < 0) {
      angulo = (2 * Math.PI) + angulo;
    }
    
    return angulo;
  }
}

// Sprite class
class Sprite {
  public distancia = 0;
  public angulo = 0;
  public visible = false;
  
  constructor(
    public x: number,
    public y: number,
    private imagen: HTMLImageElement
  ) {}
  
  private calculaAngulo(jugador: Player): void {
    const vectX = this.x - jugador.x;
    const vectY = this.y - jugador.y;
    
    const anguloJugadorObjeto = Math.atan2(vectY, vectX);
    let diferenciaAngulo = jugador['anguloRotacion'] - anguloJugadorObjeto;
    
    if (diferenciaAngulo < -Math.PI) {
      diferenciaAngulo += 2.0 * Math.PI;
    }
    if (diferenciaAngulo > Math.PI) {
      diferenciaAngulo -= 2.0 * Math.PI;
    }
    
    diferenciaAngulo = Math.abs(diferenciaAngulo);
    
    // Check if sprite is in field of view
    const FOV_medio = Math.PI / 6; // Assuming 60 degree FOV
    this.visible = diferenciaAngulo < FOV_medio;
  }
  
  private calculaDistancia(jugador: Player): void {
    this.distancia = Math.sqrt(
      (jugador.x - this.x) * (jugador.x - this.x) + 
      (jugador.y - this.y) * (jugador.y - this.y)
    );
  }
  
  private actualizaDatos(jugador: Player): void {
    this.calculaAngulo(jugador);
    this.calculaDistancia(jugador);
  }
  
  public dibuja(
    jugador: Player,
    ctx: CanvasRenderingContext2D,
    canvasAncho: number,
    canvasAlto: number,
    zBuffer: number[],
    modo: number,
    FOV: number
  ): void {
    this.actualizaDatos(jugador);
    
    // Draw point on map (debug)
    if (modo === 1) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
    }
    
    if (this.visible) {
      const altoTile = 500;
      const distanciaPlanoProyeccion = (canvasAncho / 2) / Math.tan(FOV * Math.PI / 180 / 2);
      const alturaSprite = (altoTile / this.distancia) * distanciaPlanoProyeccion;
      
      // Calculate vertical position
      const y0 = Math.floor(canvasAlto / 2) - Math.floor(alturaSprite / 2);
      const y1 = y0 + alturaSprite;
      
      const altoTextura = 64;
      const anchoTextura = 64;
      const alturaTextura = y0 - y1;
      const anchuraTextura = alturaTextura;
      
      // Calculate horizontal position
      const dx = this.x - jugador.x;
      const dy = this.y - jugador.y;
      const spriteAngle = Math.atan2(dy, dx) - jugador['anguloRotacion'];
      const viewDist = 500;
      
      const x0 = Math.tan(spriteAngle) * viewDist;
      const x = (canvasAncho / 2 + x0 - anchuraTextura / 2);
      
      // Render sprite
      ctx.imageSmoothingEnabled = false;
      const anchuraColumna = alturaTextura / altoTextura;
      
      // Draw sprite column by column
      for (let i = 0; i < anchoTextura; i++) {
        for (let j = 0; j < anchuraColumna; j++) {
          const x1 = Math.floor(x + ((i - 1) * anchuraColumna) + j);
          
          // Only draw if in front of wall
          // if (zBuffer[x1] > this.distancia) {
          //   ctx.drawImage(
          //     this.imagen,
          //     i,
          //     0,
          //     1,
          //     altoTextura - 1,
          //     x1,
          //     y1,
          //     1,
          //     alturaTextura
          //   );
          // }
          ctx.drawImage(this.imagen, i, 0, 1, altoTextura - 1, x1, y1, 1, alturaTextura);

        }
      }
    }
    console.log(`Sprite at (${this.x}, ${this.y}) is visible?`, this.visible);

  }
}