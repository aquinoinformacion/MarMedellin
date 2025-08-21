# 🏛️ Simulador Presupuesto Participativo Medellín

> **¿Cómo repartirías 195 mil millones de pesos?** - Herramienta de control político ciudadano

## 🎯 Sobre el Proyecto

El Alcalde de Medellín destinó 195 mil millones de pesos para piscinas. Esta herramienta permite a los ciudadanos mostrar sus verdaderas prioridades de inversión social, redistribuyendo simbólicamente ese presupuesto.

**Demo en vivo:** [presupuesto-medellin.netlify.app](https://presupuesto-medellin.netlify.app) *(próximamente)*

## ✨ Características

- **8 categorías** para distribuir el presupuesto (Salud, Educación, Seguridad, Vivienda, Movilidad, Servicios Públicos, Deporte, Cultura)
- **Gráfico interactivo** que se actualiza en tiempo real
- **Genera imagen** para compartir en redes sociales
- **Formulario opcional** para dejar datos y propuestas
- **100% responsivo** - Funciona en móvil y desktop

## 🚀 Instalación Rápida

### Opción 1: Copiar y pegar (más simple)

1. Crea un archivo `index.html`
2. Copia todo el código del componente React
3. Abre el archivo en tu navegador

### Opción 2: Con React (recomendado)

```bash
# Crear proyecto React con Vite
npm create vite@latest presupuesto-medellin -- --template react

# Entrar al directorio
cd presupuesto-medellin

# Instalar dependencias necesarias
npm install recharts lucide-react

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Copiar el componente en src/App.jsx
# Iniciar servidor
npm run dev
```

## 📁 Estructura Mínima

```
presupuesto-medellin/
├── src/
│   └── App.jsx          # Componente principal (único archivo necesario)
├── package.json
└── README.md
```

## 🎨 Personalización Rápida

### Cambiar colores principales
```javascript
// En App.jsx, buscar:
const COLORES = {
  morado: '#7010A6',  // Color principal
  amarillo: '#FCD700'  // Color secundario
}
```

### Modificar categorías
```javascript
// En App.jsx, buscar el array categorias:
const categorias = [
  { id: 'salud', nombre: 'Salud', emoji: '🏥', color: '#FF6B6B' },
  // Agregar o modificar categorías aquí
]
```

### Cambiar el monto total
```javascript
// En App.jsx, buscar:
const PRESUPUESTO_TOTAL = 195000; // Cambiar valor en millones
```

## 🚢 Deploy en Netlify (Gratis)

1. Subir el proyecto a GitHub
2. Conectar con Netlify:
   - Ir a [netlify.com](https://netlify.com)
   - "Add new site" → "Import an existing project"
   - Conectar GitHub y seleccionar el repositorio
   - Build command: `npm run build`
   - Publish directory: `dist`
3. ¡Listo! Tu sitio estará en vivo en minutos

## 📊 Próximas Mejoras (Opcional)

- [ ] Conectar con Google Sheets para guardar datos
- [ ] Agregar Google Analytics
- [ ] Crear nube de palabras con las ideas
- [ ] Mostrar estadísticas de distribuciones más votadas

## 💡 Contexto

**Datos de referencia:**
- 195 mil millones = 10% del presupuesto anual de Medellín
- Equivale a 300,000 subsidios de vivienda
- O el salario de 5,000 profesores por un año
- O mejorar 500 colegios públicos

## 🤝 Contribuir

¿Ideas para mejorar la herramienta? 
1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/nueva-idea`)
3. Commit cambios (`git commit -m 'Agregar nueva función'`)
4. Push (`git push origin feature/nueva-idea`)
5. Abrir Pull Request

## 📝 Licencia

Proyecto de código abierto bajo licencia MIT. Úsalo, modifícalo y compártelo libremente.

## 🏷️ Hashtags

#MedellínDecide #PresupuestoParticipativo #ControlPolítico

---

**Creado con ❤️ para la participación ciudadana de Medellín**
