import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

// Interfaces
interface Avion {
  nombre: string;
  nivel: number;
}

interface Jugador {
  jugador: string;
  aviones: Avion[];
}

interface PlaneInfo {
  id?: number; // Agregamos el ID que viene del backend
  name: string;
  subName: string;
  type: string;
  image: string;
}

interface TypeInfo {
  name: string;
  image: string;
}

interface ResultadoTabla {
  id: string;
  tipo: string;
  imagenTipo: string;
  nombreCompleto: string;
  imagenAvion: string;
  jugador: string;
  seleccionado?: boolean;
}

@Component({
  selector: 'app-squad-tool',
  imports: [ButtonModule, CommonModule, FormsModule, Select, Checkbox, TableModule, Breadcrumb, DialogModule],
  templateUrl: './squad-tool.component.html',
  styleUrl: './squad-tool.component.sass',
})
export class SquadToolComponent implements OnInit {
  title = 'metalstorm';
  excelData: any[] = [];
  fileName: string = '';
  jugadores: Jugador[] = [];
  urlGoogle: string = '';
  cargando: boolean = false;
  errorMensaje: string = '';
  mostrarModalPlantilla: boolean = false;
  terminoBusqueda: string = '';
  resultadosFiltrados: ResultadoTabla[] = [];

  // Datos visuales de los Tipos (Estos los mantenemos aquí por los iconos de roles)
  tiposInfo: TypeInfo[] = [
    { name: 'Light Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-light-fighter-bg.png' },
    { name: 'Medium Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-medium-fighter-bg.png' },
    { name: 'Heavy Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-heavy-fighter-bg.png' },
    { name: 'Interceptor', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-interceptor-bg.png' },
    { name: 'Attack', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-attack-bg.png' }
  ];

  // Aquí guardaremos los datos que vienen de TU BACKEND
  planesInfo: PlaneInfo[] = [];

  // Filtros
  nivelesDisponibles = Array.from({ length: 20 }, (_, i) => ({ label: `Nivel ${i + 1}`, value: i + 1 }));
  nivelSeleccionado: number | null = null;
  tiposSeleccionados: string[] = [];

  // Resultados
  resultadosTabla: ResultadoTabla[] = [];
  seleccionados: ResultadoTabla[] = [];

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  // URL DE TU BACKEND (Alejandro API)
  private apiUrl = 'http://localhost:5000/api/planes';

  constructor(private http: HttpClient) {
    // Al iniciar, llamamos a la API
    this.cargarAvionesDesdeBackend();
  }

  ngOnInit() {
    this.items = [
      { label: 'SQUAD Tool' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/' };
  }

  // --- NUEVA FUNCIÓN: CONECTAR CON BACKEND ---
  cargarAvionesDesdeBackend() {
    console.log('📞 Llamando a la API de Alejandro...');
    
    this.http.get<PlaneInfo[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('✅ ¡Datos recibidos del Backend!', data);
        this.planesInfo = data;
        // Opcional: Si quieres verificar que son 42 aviones
        console.log(`🛩️ Total aviones cargados: ${this.planesInfo.length}`);
      },
      error: (error) => {
        console.error('❌ Error conectando al Backend (¿Está Docker prendido?):', error);
        // Fallback: Si falla el backend, intentamos cargar el local por si acaso
        // this.cargarDataInfoLocal(); 
      }
    });
  }

  // --- Lógica del Excel (Se mantiene igual) ---
  cargarDesdeUrl(): void {
    if (!this.urlGoogle.trim()) {
      this.errorMensaje = 'Por favor, ingresa una URL válida';
      return;
    }

    const spreadsheetId = this.extraerIdDelGoogle(this.urlGoogle);

    if (!spreadsheetId) {
      this.errorMensaje = 'URL inválida. Asegúrate de que sea una URL válida de Google Sheets';
      return;
    }

    this.errorMensaje = '';
    this.cargando = true;
    this.leerExcelDesdeGoogle(spreadsheetId);
  }

  private extraerIdDelGoogle(url: string): string | null {
    const patron = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const coincidencia = url.match(patron);
    return coincidencia ? coincidencia[1] : null;
  }

  private leerExcelDesdeGoogle(spreadsheetId: string) {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;

    this.http.get(url, { responseType: 'arraybuffer' }).subscribe(
      (data) => {
        try {
          const bstr = new Uint8Array(data);
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'array' });

          this.jugadores = wb.SheetNames.map(sheetName => {
            const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
            const dataRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const aviones = dataRows
              .filter((row: any) => row[0] && row[1] !== undefined)
              .map((row: any) => ({
                nombre: row[0],
                nivel: Number(row[1]) || 0
              }))
              .filter(avion => avion.nivel > 0);

            return {
              jugador: sheetName,
              aviones: aviones
            };
          });

          this.excelData = this.jugadores;
          this.cargando = false;
        } catch (error) {
          console.error('Error al procesar el archivo de Google Sheets:', error);
        }
      },
      (error) => {
        console.error('Error al descargar el archivo de Google Sheets:', error);
        this.cargando = false;
        this.errorMensaje = 'Error al cargar el archivo. Verifica que la URL sea correcta.';
        this.jugadores = [];
        this.resultadosTabla = [];
      }
    );
  }

  // --- Filtros y Selección (Se mantienen igual pero usando this.planesInfo que ya viene del backend) ---
  onNivelChange(): void {
    this.seleccionados = [];
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    if (!this.nivelSeleccionado || this.tiposSeleccionados.length === 0) {
      this.resultadosTabla = [];
      this.aplicarBusqueda();
      return;
    }

    const resultados: ResultadoTabla[] = [];

    this.jugadores.forEach(jugador => {
      jugador.aviones.forEach(avion => {
        if (avion.nivel === this.nivelSeleccionado) {
          
          // AQUÍ BUSCAMOS EN LOS DATOS DEL BACKEND
          const planeInfo = this.planesInfo.find(p =>
            p.name.toLowerCase() === avion.nombre.toLowerCase() ||
            `${p.name} ${p.subName}`.toLowerCase() === avion.nombre.toLowerCase() ||
            `${p.name}-${p.subName}`.toLowerCase() === avion.nombre.toLowerCase()
          );

          if (planeInfo && this.tiposSeleccionados.includes(planeInfo.type)) {
            const tipoInfo = this.tiposInfo.find(t => t.name === planeInfo.type);
            const id = `${planeInfo.name}-${planeInfo.subName}-${jugador.jugador}`;
            const yaSeleccionado = this.seleccionados.some(s => s.id === id);
            resultados.push({
              id: id,
              tipo: planeInfo.type,
              imagenTipo: tipoInfo?.image || '',
              nombreCompleto: `${planeInfo.name} ${planeInfo.subName}`,
              imagenAvion: planeInfo.image,
              jugador: jugador.jugador,
              seleccionado: yaSeleccionado
            });
          }
        }
      });
    });

    resultados.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

    this.resultadosTabla = resultados;
    this.aplicarBusqueda();
  }

  aplicarBusqueda(): void {
    if (!this.terminoBusqueda.trim()) {
      this.resultadosFiltrados = this.resultadosTabla;
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.resultadosFiltrados = this.resultadosTabla.filter(resultado =>
      resultado.nombreCompleto.toLowerCase().includes(termino) ||
      resultado.jugador.toLowerCase().includes(termino)
    );
  }

  onToggleSeleccion(resultado: ResultadoTabla): void {
    const index = this.seleccionados.findIndex(s => s.id === resultado.id);

    if (index > -1) {
      this.seleccionados.splice(index, 1);
      resultado.seleccionado = false;
    } else {
      this.seleccionados.push({ ...resultado, seleccionado: true });
      resultado.seleccionado = true;
    }
  }

  descargarPlantilla(): void {
    const enlace = document.createElement('a');
    enlace.href = 'assets/files/planificacion-base.xlsx';
    enlace.download = 'planificacion-base.xlsx';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  abrirModalPlantilla(): void {
    this.mostrarModalPlantilla = true;
  }

  cerrarModalPlantilla(): void {
    this.mostrarModalPlantilla = false;
  }
}