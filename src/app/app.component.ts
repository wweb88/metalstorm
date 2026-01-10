import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';

interface Avion {
  nombre: string;
  nivel: number;
}

interface Jugador {
  jugador: string;
  aviones: Avion[];
}

interface PlaneInfo {
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
  selector: 'app-root',
  imports: [ RouterOutlet , ButtonModule, CommonModule, FormsModule, Select, Checkbox, TableModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'metalstorm';
  excelData: any[] = [];
  fileName: string = '';
  jugadores: Jugador[] = [];
  
  // Datos del dataInfo.json - hardcoded para evitar problemas con BOM
  tiposAviones: string[] = [
    'Light Fighter',
    'Medium Fighter',
    'Heavy Fighter',
    'Interceptor',
    'Attack'
  ];
  
  tiposInfo: TypeInfo[] = [
    { name: 'Light Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-light-fighter-bg.png' },
    { name: 'Medium Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-medium-fighter-bg.png' },
    { name: 'Heavy Fighter', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-heavy-fighter-bg.png' },
    { name: 'Interceptor', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-interceptor-bg.png' },
    { name: 'Attack', image: 'https://starform-playmetalstorm-assets.s3.us-west-2.amazonaws.com/role-icons/role-attack-bg.png' }
  ];
  
  planesInfo: PlaneInfo[] = [];
  
  // Filtros
  nivelesDisponibles = Array.from({ length: 20 }, (_, i) => ({ label: `Nivel ${i + 1}`, value: i + 1 }));
  nivelSeleccionado: number | null = null;
  tiposSeleccionados: string[] = [];
  
  // Resultados
  resultadosTabla: ResultadoTabla[] = [];
  seleccionados: ResultadoTabla[] = [];
  
  constructor( private http: HttpClient ) {
    this.cargarDataInfo();
    this.leerExcelDesdeGoogle();
  }

  leerExcelDesdeGoogle() {
    // URL del Google Sheets exportado como Excel
    const spreadsheetId = '1cVVBsGpxT9QLyaj5b004y2J7G3vWsfhA6QyWIEjxRss';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
    
    this.http.get(url, { responseType: 'arraybuffer' }).subscribe(
      (data) => {
        try {
          const bstr = new Uint8Array(data);
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'array' });
          
          // Procesar cada pestaña (cada jugador)
          this.jugadores = wb.SheetNames.map(sheetName => {
            const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
            const dataRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
            
            // Procesar aviones: primera columna = nombre, segunda = nivel
            const aviones = dataRows
              .filter((row: any) => row[0] && row[1] !== undefined) // Filtrar filas válidas
              .map((row: any) => ({
                nombre: row[0],
                nivel: Number(row[1]) || 0
              }))
              .filter(avion => avion.nivel > 0); // Solo aviones con nivel > 0
            
            return {
              jugador: sheetName,
              aviones: aviones
            };
          });
          
          console.log('=== DATOS DE JUGADORES (Cargados desde Google Sheets) ===');
          console.log(JSON.stringify(this.jugadores, null, 2));
          console.log('=========================================================');
          
          this.excelData = this.jugadores;
        } catch (error) {
          console.error('Error al procesar el archivo de Google Sheets:', error);
        }
      },
      (error) => {
        console.error('Error al descargar el archivo de Google Sheets:', error);
      }
    );
  }
  
  async cargarDataInfo() {
    try {
      const response = await fetch('/files/dataInfo.json');
      const text = await response.text();
      
      // Remover BOM si existe
      const cleanText = text.replace(/^\uFEFF/, '');
      const data = JSON.parse(cleanText);
      this.planesInfo = data.planes as PlaneInfo[];
      console.log('Planes cargados:', this.planesInfo.length);
    } catch (error) {
      console.error('Error al cargar dataInfo.json:', error);
    }
  }


  onNivelChange(): void {
    this.seleccionados = [];
    this.aplicarFiltros();
  }
  
  aplicarFiltros(): void {
    if (!this.nivelSeleccionado || this.tiposSeleccionados.length === 0) {
      this.resultadosTabla = [];
      return;
    }
    
    const resultados: ResultadoTabla[] = [];
    
    // Recorrer cada jugador
    this.jugadores.forEach(jugador => {
      // Recorrer cada avión del jugador
      jugador.aviones.forEach(avion => {
        // Verificar si el nivel coincide
        if (avion.nivel === this.nivelSeleccionado) {
          // Buscar información del avión en dataInfo
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
    
    // Ordenar los resultados por nombre del avión
    resultados.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
    
    this.resultadosTabla = resultados;
    console.log('Resultados filtrados:', resultados);
  }
  
  onToggleSeleccion(resultado: ResultadoTabla): void {
    const index = this.seleccionados.findIndex(s => s.id === resultado.id);
    
    if (index > -1) {
      // Deseleccionar
      this.seleccionados.splice(index, 1);
      resultado.seleccionado = false;
    } else {
      // Seleccionar
      this.seleccionados.push({...resultado, seleccionado: true});
      resultado.seleccionado = true;
    }
    
    console.log('Seleccionados:', this.seleccionados);
  }
}
