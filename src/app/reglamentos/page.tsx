import { Shield, ShieldAlert, ShieldCheck, Scale, ArrowDownUp, AlertTriangle, Users, Megaphone, Star, CheckCircle2, BadgeAlert, Ban, Info, ShieldHalf } from "lucide-react";

export const metadata = {
  title: "Reglamentos y Sanciones - Metaltools",
  description: "Normas vigentes que rigen el funcionamiento de las Brigadas Aéreas."
};

export default function ReglamentosPage() {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 py-12">
      {/* HEADER */}
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b0f19] to-[#1a2235] p-10 md:p-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-[var(--color-gaming-accent)] opacity-10 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="bg-[var(--color-gaming-accent)]/20 p-4 rounded-full border border-[var(--color-gaming-accent)]/50 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
            <Shield className="w-12 h-12 text-[var(--color-gaming-accent)]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
            Reglamentos y Sanciones
          </h1>
          <p className="text-[var(--color-gaming-accent)] font-bold tracking-[0.3em] uppercase text-sm">
            Disciplina • Respeto • Honor
          </p>
        </div>
      </header>

      {/* INFO BOX */}
      <div className="glass-panel border-l-4 border-l-[var(--color-gaming-accent)] p-6 rounded-xl flex items-start gap-4 shadow-lg">
        <Info className="w-6 h-6 text-[var(--color-gaming-accent)] shrink-0 mt-1" />
        <p className="text-gray-300 text-lg leading-relaxed">
          A continuación encontrarás las normas vigentes que rigen el funcionamiento de las Brigadas Aéreas. El cumplimiento de estas reglas garantiza un ambiente competitivo, ordenado y respetuoso para todos los pilotos.
        </p>
      </div>

      {/* RULE 1 */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Regla 1</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide">Requisitos Mínimos</h2>
          </div>
        </div>
        <p className="text-gray-400">
          Dado el nivel de exigencia que implica formar parte de las Brigadas Aéreas, cada brigada cuenta con requisitos mínimos que todo piloto debe cumplir para mantener su posición.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Brigada 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-colors">
            <h3 className="flex items-center gap-2 text-xl font-black text-white mb-6 uppercase tracking-wider">
              <Star className="w-6 h-6 text-blue-400 fill-blue-400/20" />
              Brigada 1
            </h3>
            <ul className="space-y-4">
              {[
                "Mínimo 170 puntos en el evento de caja de escuadrón",
                "Uso obligatorio de WhatsApp",
                "Máximo 3 días consecutivos de inactividad",
                "Mínimo 23.000k de copas"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Brigada 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-colors">
            <h3 className="flex items-center gap-2 text-xl font-black text-white mb-6 uppercase tracking-wider">
              <Star className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              Brigada 2
            </h3>
            <ul className="space-y-4">
              {[
                "Mínimo 170 puntos en el evento de caja de escuadrón",
                "Uso obligatorio de WhatsApp",
                "Máximo 3 días consecutivos de inactividad",
                "Mínimo 7.000k de copas"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* RULE 2 */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
            <ArrowDownUp className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">Regla 2</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide">Sistema de Rotación por Incumplimiento</h2>
          </div>
        </div>
        <p className="text-gray-400">
          El sistema de rotación aplica a los pilotos que no cumplan con los requisitos mínimos de su brigada. Quienes incumplan serán degradados a la brigada inferior, mientras que el primer lugar de la brigada inferior ascenderá, siempre que cumpla con los requisitos correspondientes.
        </p>

        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-yellow-500">
            <h4 className="text-yellow-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> Ejemplo de Rotación
            </h4>
            <p className="text-gray-300">
              Si un piloto de la Brigada 1 no alcanza los 150 puntos en el evento de caja, descenderá a la Brigada 2. A su vez, el jugador mejor rankeado de la Brigada 2 ascenderá a la Brigada 1, siempre que cumpla con el mínimo de copas requerido.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-xl">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                Frecuencia de aplicación
              </h4>
              <p className="text-gray-400 text-sm">
                El sistema se aplicará semanalmente, al finalizar cada temporada y ante actos de toxicidad en la comunidad.
              </p>
            </div>
            <div className="glass-panel p-5 rounded-xl">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" /> Múltiples descensos
              </h4>
              <p className="text-gray-400 text-sm">
                Si más de un piloto incumple los requisitos, el sistema de rotación se aplica de igual forma para cada caso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RULE 3 */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="bg-[#ff3366]/10 p-3 rounded-lg border border-[#ff3366]/20">
            <ShieldAlert className="w-6 h-6 text-[#ff3366]" />
          </div>
          <div>
            <span className="text-[#ff3366] text-xs font-bold uppercase tracking-wider">Regla 3</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide">Criterio de Toxicidad</h2>
          </div>
        </div>
        <p className="text-gray-400">
          Ante cualquier reporte o conducta tóxica que llegue al conocimiento del staff de las Brigadas Aéreas, se tomará una decisión de forma unánime. La resolución dependerá de la gravedad del incidente, considerando la reiteración de conductas y el nivel de hostilidad involucrado.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-[#ff3366]/30 bg-[#ff3366]/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff3366]"></div>
            <h4 className="text-[#ff3366] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Ban className="w-5 h-5" /> Expulsión definitiva
            </h4>
            <p className="text-gray-300">
              Para casos graves o con reincidencias. El jugador será removido permanentemente de las Brigadas Aéreas.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
            <h4 className="text-yellow-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <ArrowDownUp className="w-5 h-5" /> Aplicación del sistema de rotación
            </h4>
            <p className="text-gray-300">
              Para casos leves o primera incidencia. Se aplicará el descenso de brigada descrito en la Regla 2.
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-purple-500">
          <h4 className="text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5" /> Decisión del Staff
          </h4>
          <p className="text-gray-300">
            Toda decisión relacionada con toxicidad será tomada de forma colegiada por los miembros del staff, garantizando un proceso justo y transparente para todos los integrantes de las brigadas.
          </p>
        </div>
      </section>

      {/* RULE 4 */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <BadgeAlert className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Regla 4</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide">Normas de Conducta</h2>
          </div>
        </div>
        <p className="text-gray-400 mb-6">
          Todas las interacciones dentro de las Brigadas Aéreas deben regirse por los siguientes principios de convivencia. Su incumplimiento derivará en sanciones que van desde el sistema de rotación hasta la expulsión definitiva.
        </p>

        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-xl border-l-4 border-l-blue-400">
            <h4 className="text-blue-400 font-bold uppercase tracking-wider mb-2">Respeto ante todo</h4>
            <p className="text-gray-300">Todos los pilotos deben mantener un trato respetuoso en todo momento. No se permiten insultos, burlas, provocaciones ni ataques personales.</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border-l-4 border-l-[#ff3366]">
            <h4 className="text-[#ff3366] font-bold uppercase tracking-wider mb-2">Nada de odio ni discriminación</h4>
            <p className="text-gray-300">El racismo, sexismo, homofobia, el discurso de odio religioso o político, y cualquier forma de discriminación serán sancionados de forma inmediata.</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border-l-4 border-l-purple-400">
            <h4 className="text-purple-400 font-bold uppercase tracking-wider mb-2">Respeto al Staff</h4>
            <p className="text-gray-300">Las decisiones del staff deben ser respetadas por todos los integrantes. Cualquier desacuerdo debe canalizarse por los medios oficiales establecidos.</p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-[#ff3366]/30 bg-[#ff3366]/5">
            <h4 className="text-[#ff3366] font-black uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> LEY TOLERANCIA 0
            </h4>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Las faltas pueden resultar en <strong className="text-white">sanciones graves o expulsión permanente</strong>. Los casos de odio, temas religiosos o políticos, acoso y ataques personales conllevan expulsión directa sin advertencia previa. Asimismo, los pilotos sancionados podrán ser degradados temporalmente a un escuadrón de castigo.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              El criterio de sanción y la decisión de acoger o no al piloto al sistema de rotación será tomada exclusivamente por el <strong>staff de las Brigadas Aéreas</strong>.
            </p>
            
            {/* Staff list */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
              <span className="text-gray-400 text-sm font-bold flex items-center gap-2 mr-2">
                <ShieldHalf className="w-4 h-4" /> STAFF
              </span>
              {["Septi", "Blackert", "Fate", "NitroFACH", "BaronFlojo", "Miyamoto", "White"].map((name) => (
                <span key={name} className="px-3 py-1 bg-[#ff3366]/20 border border-[#ff3366]/30 text-[#ff3366] rounded-full text-sm font-bold shadow-[0_0_10px_rgba(255,51,102,0.2)]">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <div className="mt-16 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b0f19] to-[#1a2235] border border-blue-500/30 p-8 md:p-12 text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/50 mb-2">
            <Megaphone className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-black uppercase text-white tracking-wide">
            ¡No estás solo!
          </h2>
          <p className="text-gray-300 text-lg">
            Puedes denunciar cualquier tipo de agresión con nuestro staff. <br className="hidden md:block" />
            <strong className="text-white">Promovemos una comunidad libre de violencia.</strong>
          </p>
        </div>
      </div>
    </main>
  );
}
