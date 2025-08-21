import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, Share2, Facebook, Twitter } from 'lucide-react';

const SimuladorPresupuesto = () => {
  const PRESUPUESTO_TOTAL = 195000; // En millones
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [datosEnviados, setDatosEnviados] = useState(false);
  
  const categorias = [
    { id: 'salud', nombre: 'Salud', emoji: '🏥', color: '#FF6B6B' },
    { id: 'educacion', nombre: 'Educación', emoji: '📚', color: '#4ECDC4' },
    { id: 'seguridad', nombre: 'Seguridad', emoji: '👮', color: '#45B7D1' },
    { id: 'vivienda', nombre: 'Vivienda', emoji: '🏠', color: '#96CEB4' },
    { id: 'movilidad', nombre: 'Movilidad', emoji: '🚌', color: '#FFEAA7' },
    { id: 'servicios', nombre: 'Servicios Públicos', emoji: '🚰', color: '#DDA0DD' },
    { id: 'deporte', nombre: 'Deporte y Recreación', emoji: '⚽', color: '#98D8C8' },
    { id: 'cultura', nombre: 'Cultura', emoji: '🎭', color: '#F7DC6F' }
  ];

  const [distribucion, setDistribucion] = useState(
    categorias.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {})
  );

  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    whatsapp: '',
    ideas: '',
    autorizo: false
  });

  const totalAsignado = Object.values(distribucion).reduce((sum, val) => sum + val, 0);
  const restante = PRESUPUESTO_TOTAL - totalAsignado;
  const completado = totalAsignado === PRESUPUESTO_TOTAL;

  const handleSliderChange = (categoria, valor) => {
    const nuevoValor = parseInt(valor);
    const otrosValores = Object.entries(distribucion)
      .filter(([cat]) => cat !== categoria)
      .reduce((sum, [, val]) => sum + val, 0);
    
    if (otrosValores + nuevoValor <= PRESUPUESTO_TOTAL) {
      setDistribucion(prev => ({ ...prev, [categoria]: nuevoValor }));
    }
  };

  const formatearMiles = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const datosGrafico = categorias.map(cat => ({
    nombre: cat.nombre,
    valor: distribucion[cat.id],
    color: cat.color,
    porcentaje: PRESUPUESTO_TOTAL > 0 ? ((distribucion[cat.id] / PRESUPUESTO_TOTAL) * 100).toFixed(1) : 0
  }));

  const generarImagen = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    canvas.width = 1200;
    canvas.height = 630;
    
    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#7010A6');
    gradient.addColorStop(1, '#4A0E6B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);
    
    // Título
    ctx.fillStyle = '#FCD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('¿Cómo repartirías 195 mil millones?', 600, 80);
    
    // Subtítulo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText('Mi propuesta de presupuesto para Medellín', 600, 120);
    
    // Dibujar barras
    const startY = 180;
    const barHeight = 35;
    const maxBarWidth = 700;
    const startX = 250;
    
    categorias.forEach((cat, index) => {
      const y = startY + (index * (barHeight + 10));
      const valor = distribucion[cat.id];
      const porcentaje = PRESUPUESTO_TOTAL > 0 ? (valor / PRESUPUESTO_TOTAL) * 100 : 0;
      const barWidth = (porcentaje / 100) * maxBarWidth;
      
      // Emoji y nombre
      ctx.font = '24px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'right';
      ctx.fillText(`${cat.emoji} ${cat.nombre}`, startX - 10, y + 25);
      
      // Barra
      ctx.fillStyle = cat.color;
      ctx.fillRect(startX, y, barWidth, barHeight);
      
      // Porcentaje y valor
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${porcentaje.toFixed(1)}% - $${formatearMiles(valor)}M`, startX + barWidth + 10, y + 25);
    });
    
    // Footer
    ctx.fillStyle = '#FCD700';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('#MedellínDecide #PresupuestoParticipativo', 600, 580);
    
    // Convertir a imagen
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
  };

  const descargarImagen = () => {
    const link = document.createElement('a');
    link.download = 'mi-presupuesto-medellin.png';
    link.href = imageUrl;
    link.click();
  };

  const compartirEnRedes = (red) => {
    const mensaje = encodeURIComponent('¿Cómo repartirías 195 mil millones de pesos? Yo ya hice mi propuesta de presupuesto participativo para Medellín. #MedellínDecide');
    const url = encodeURIComponent(window.location.href);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${mensaje}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${mensaje}%20${url}`
    };
    
    window.open(urls[red], '_blank');
  };

  const handleSubmit = () => {
    // Aquí iría la lógica para enviar a Google Sheets
    console.log('Datos a enviar:', { distribucion, ...formulario });
    setDatosEnviados(true);
    setTimeout(() => setDatosEnviados(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
            ¿Cómo repartirías 195 mil millones de pesos?
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-2">
            El Alcalde de Medellín destinó este presupuesto para piscinas.
          </p>
          <p className="text-lg md:text-xl text-gray-700 font-semibold">
            ¿Cuáles serían tus prioridades de inversión social?
          </p>
        </header>

        {/* Contador de presupuesto */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-purple-900">Distribuye el presupuesto</h2>
              <p className="text-gray-600">Mueve los sliders para asignar recursos a cada categoría</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${restante === 0 ? 'text-green-600' : restante > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                ${formatearMiles(Math.abs(restante))} millones
              </div>
              <div className="text-sm text-gray-600">
                {restante === 0 ? '✓ Presupuesto completo' : restante > 0 ? 'Por asignar' : 'Excedido'}
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
            {categorias.map(cat => (
              <div key={cat.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 font-semibold text-gray-700">
                    <span className="text-2xl">{cat.emoji}</span>
                    <span>{cat.nombre}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {((distribucion[cat.id] / PRESUPUESTO_TOTAL) * 100).toFixed(1)}%
                    </span>
                    <span className="font-bold text-purple-900 min-w-[120px] text-right">
                      ${formatearMiles(distribucion[cat.id])}M
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={PRESUPUESTO_TOTAL}
                  step="100"
                  value={distribucion[cat.id]}
                  onChange={(e) => handleSliderChange(cat.id, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${cat.color} 0%, ${cat.color} ${(distribucion[cat.id] / PRESUPUESTO_TOTAL) * 100}%, #e5e7eb ${(distribucion[cat.id] / PRESUPUESTO_TOTAL) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico */}
        {completado && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-purple-900 mb-4">Tu distribución presupuestal</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${formatearMiles(value)}M`, 'Valor']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {datosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={generarImagen}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 size={20} />
                Generar imagen para compartir
              </button>
            </div>
          </div>
        )}

        {/* Canvas oculto para generar imagen */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Preview y compartir */}
        {imageUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-purple-900 mb-4">Comparte tu propuesta</h3>
            <div className="mb-6">
              <img src={imageUrl} alt="Mi propuesta de presupuesto" className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" />
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={descargarImagen}
                className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download size={20} />
                Descargar imagen
              </button>
              <button
                onClick={() => compartirEnRedes('twitter')}
                className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Twitter size={20} />
                Twitter
              </button>
              <button
                onClick={() => compartirEnRedes('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Facebook size={20} />
                Facebook
              </button>
              <button
                onClick={() => compartirEnRedes('whatsapp')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                WhatsApp
              </button>
            </div>
            
            {/* Botón para mostrar formulario */}
            {!mostrarFormulario && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Quiero dejar mis datos e ideas
                </button>
              </div>
            )}
          </div>
        )}

        {/* Formulario opcional */}
        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-purple-900 mb-4">Déjanos tus datos e ideas (opcional)</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({...formulario, nombre: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={formulario.correo}
                    onChange={(e) => setFormulario({...formulario, correo: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">WhatsApp (opcional)</label>
                <input
                  type="tel"
                  value={formulario.whatsapp}
                  onChange={(e) => setFormulario({...formulario, whatsapp: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="300 123 4567"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Tus ideas para Medellín (máx. 200 palabras)
                </label>
                <textarea
                  value={formulario.ideas}
                  onChange={(e) => {
                    const palabras = e.target.value.split(/\s+/).filter(p => p.length > 0);
                    if (palabras.length <= 200) {
                      setFormulario({...formulario, ideas: e.target.value});
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 h-32"
                  placeholder="¿Qué otras prioridades debería tener la ciudad?"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {formulario.ideas.split(/\s+/).filter(p => p.length > 0).length}/200 palabras
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="autorizo"
                  checked={formulario.autorizo}
                  onChange={(e) => setFormulario({...formulario, autorizo: e.target.checked})}
                  className="mt-1"
                />
                <label htmlFor="autorizo" className="text-sm text-gray-700">
                  Autorizo el uso de mis datos para análisis estadísticos y posible contacto sobre iniciativas de participación ciudadana
                </label>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Enviar mis datos
                </button>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
              
              {datosEnviados && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  ¡Gracias! Tus datos han sido enviados correctamente.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 text-gray-600">
          <p className="mb-2">Una iniciativa ciudadana para el presupuesto participativo de Medellín</p>
          <p className="text-sm">#MedellínDecide #PresupuestoParticipativo</p>
        </footer>
      </div>
    </div>
  );
};

export default SimuladorPresupuesto;
