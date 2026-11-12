# Portafolio · Sofia (versión 2, multipágina)

Sitio estático: HTML + CSS + JavaScript, sin librerías ni compilación.

## Páginas
- `index.html` — inicio (carga, hero, sobre mí, 4 tarjetas de sección, contacto)
- `uxui.html` → `regioo.html`, `421co.html`, `atelier.html` (pestañas: arquitectura · wireframes · sistema de diseño · producto final, con prototipo de Figma incrustado)
- `fotografia.html` — galería (zoom al pasar el cursor, clic = foto completa)
- `motion.html` — cuadrícula de piezas; los videos se reproducen en bucle al verse; clic = ampliar con descripción
- `inmersiva.html` → `entrecruzados.html` (problemática · lluvia de ideas · bocetos · correcciones · resultados), `folio-ar.html` (AR en vivo · video · visor 3D)

## Motion de la sección Motion Graphics
La página `motion.html` abre con un video a pantalla completa en bucle. Sube tu animación como `assets/motion/seccion-motion.mp4` (horizontal 16:9, sin audio, < 5 MB). Mientras no exista se ve un fondo verde azulado con un aviso.

## Publicar
1. Sube el contenido de esta carpeta a un repositorio de GitHub (`index.html` en la raíz).
2. En Vercel: Add New → Project → elige el repo → Framework Preset **Other** → Deploy.

## Qué falta por completar (cajas punteadas "Por completar / Aquí va")
- Cliente, año y rol de cada proyecto: edita el `<dl class="meta">` del HTML.
- Procesos (arquitectura, wireframes, sistema de diseño, bocetos…): guarda la imagen en `assets/proceso/<proyecto>/` y reemplaza la caja punteada por el bloque que hay en el comentario HTML justo debajo.
- Prototipos de Figma: el archivo debe estar compartido como **"Cualquier persona con el enlace puede ver"**, o no cargará dentro de la página.
- Motion: los dos `.mp4` de `assets/motion/` son **de prueba**. Reemplázalos por los tuyos (mismo nombre, o cambia la ruta en `motion.html`). Recomendado: H.264, sin audio, 720–1080 px, 3–10 s en bucle, < 3 MB cada uno. Las piezas sin video muestran la imagen; añade `data-video="assets/motion/archivo.mp4"` y un `<video>` como en las que ya lo tienen.
- Folio AR: falta la imagen marcadora (`assets/img/marcador-it.webp`), un video de demostración y el visor 3D (cuando envíes los archivos).
- Fotos y mockups están en baja resolución (venían del PDF): reemplázalos por los originales con el mismo nombre para que se vean nítidos al ampliar.

## Colores y tipografías
Azul `#23499f` · Navy `#33356c` · Crema `#f1e1c8` · Teal `#097987` · Slate `#264653`. Caacupe One (títulos) y Poppins (texto), incluidas en `assets/fonts`.


## Cambios de esta ronda
- **Folio · It**: En vivo (iframe + QR + marcador), Video a pantalla completa (18 s: globo, botones y las tres tarjetas, con el estilo de la experiencia) y *Sin cámara* (visor WebGL con botones y tarjetas al estilo de Folio; tipografías Itim y Hanken Grotesk en `assets/fonts`). Es una simulación; el AR real es el iframe.
- **Poses de Sofia** (`assets/img/pose-*.webp`): `caminando` jala las secciones del home; `cadera` (UX/UI), `brazos` (Inmersiva) y `lentes` (Fotografía) en las introducciones. Disponibles sin usar: bolsillos, salto, sentada, recostada, leyendo, barbilla, rodillas, sentada2, mano-cabeza, sentada3.
- Hover de las filas: cambio de color rápido, sin relleno de abajo hacia arriba.
- Pestañas de UX/UI en móvil: barra con deslizamiento táctil, ubicada bajo el botón de menú.

## Cambios v4
- Home: tarjetas con la figura sentada/recostada encima (sin personaje caminando).
- Folio · It: solo pestañas "En vivo" y "Sin cámara".
- Logo del footer lleva al inicio; favicon = sofi azul.
- Hero de escritorio sin logo, PORTAFOLIO centrado en la banda crema.
- Prototipos: pantalla de carga (spinner), precarga en escritorio al acercarse, bloqueo táctil en móvil ("Toca para usar el prototipo" / "Salir del prototipo"), cursor propio oculto sobre el prototipo, variante teléfono sin marco.
- Móvil: cubierta bajo las pestañas, vuelve al inicio de la sección al cambiar de pestaña, listas en tarjetas con borde.

## Ajustes v4.1
- Hero escritorio: onda a 100svh (sin deformarse en pantallas anchas), mota del icono Ae eliminada.
- Tarjetas del home vuelven a entrar con el scroll; figuras apoyadas sobre el borde.
- Carga de prototipos: overlay se mantiene 5 s tras el load (Figma pinta blanco un rato).
- Móvil: 'Salir del prototipo' también sale de pantalla completa (con respaldo si el navegador no la soporta).

## v4.2
- Regioo · Sistema de diseño: 5 láminas + 4 pares claro/oscuro (WebP sin pérdida, 11–91 KB c/u), visor con zoom (clic en la imagen).
- 421co · Mapa de arquitectura (WebP, 59 KB). Wireframes y sistema de diseño de 421co: pendientes.
- Motion: videos `ojos.mp4` (100 KB) y `darkside.mp4` (325 KB), H.264 720p sin audio.

## v4.3
- 421 Co. · pestaña Wireframes: 8 wireframes web descargados de Figma (Home, Nosotros, Productos, Comunidad, Eventos, Noticias, Contacto, Pasarela de pago). Miniaturas WebP (10–24 KB) en la página y archivo completo WebP sin pérdida (25–110 KB) que se carga solo al ampliar. Archivos en `assets/proceso/421co/wf/`.

## v4.4
- Entrecruzados completado con los dos PDF de Cruz Roja: pestañas Problemática, Bocetos y planos, Recorrido (10 paradas, propuesta 3D + foto real), Señalética y zonas, Videojuegos y piezas, Resultados finales (galería, esperado vs obtenido, conclusiones). Imágenes en `assets/proceso/entre/` (WebP).
- Motion: se quitó el pictograma de baños; «It» usa el video de realidad aumentada de Folio (`assets/motion/it-ar.mp4`); Renegados y DVSPORT quedan como imagen hasta tener su motion; nueva ilustración «Cada día llega una carta» (`assets/img/mg-carta.webp`) sin el texto.

## v4.5
- Regioo · Mapa de arquitectura (HTML, desde las pantallas del prototipo) y 421 Co. · Sistema de diseño (paleta, tipografía Rubik y componentes recortados del prototipo, `assets/proceso/421co/ds/`, fuente en `assets/fonts/rubik-*`).
- Entrecruzados: se quitaron «Señalética y zonas» y «Videojuegos y piezas»; recorrido rediseñado en 10 tarjetas cortas (foto real + recuadro 3D); galería sin las evidencias 8, 11, 13, 14, 15 y 16, con foto del gachapón.

## v4.6
- Regioo: la pestaña «Mapa de arquitectura» vuelve a quedar pendiente. 421 Co.: el sistema de diseño solo conserva color y tipografía. Entrecruzados: se quitó otra foto de la galería.

## v4.7
- Motion Graphics: video de cabecera `assets/motion/seccion-motion.mp4` (1920×1080, 30 fps, H.264 sin audio). Se reproduce una vez y queda en el último fotograma (sin bucle); con «reducir movimiento» se muestra directamente el último fotograma. En móvil se ve en recuadro 4:3 para que el título no se corte.

## v4.8
- Experiencia Inmersiva: Folio · It primero, luego Entrecruzados. Entrecruzados: se quitó «A quién le hablamos» (persona y journey), y «Lo esperado y lo obtenido» y «Conclusiones» de Resultados finales.
- Prototipos de Figma: la pantalla de carga ahora espera ~14 s tras cargar el iframe (antes 5 s). Para que espere exactamente hasta que el prototipo esté listo, poner un client-id de Figma en `FIGMA_CLIENT_ID` (build.py); entonces se usa el aviso INITIAL_LOAD de Figma (con tope de 40 s).

## v4.9
- Entrecruzados · Resultados finales: vuelve «Resultados obtenidos» (sin «esperados» ni «conclusiones»).

## v5.0
- Regioo: se quitó la pestaña Wireframes; el Mapa de arquitectura es ahora un mapa mental (assets/proceso/regioo/arquitectura.webp) hecho a partir del prototipo.
- Atelier: solo queda «Producto final» (la barra de pestañas se oculta al haber una sola).
- Motion: «Cada día llega una carta» y «DVSPORT» ahora son video (assets/motion/mg-carta.mp4, dvsport.mp4); Renegados bajó de lugar.

## v5.1
- Fotografía deportiva: nuevo orden (1, 3, 6, 2, 4, 5, 7).
- Regioo: el mapa de arquitectura pasó a mapa conceptual (estilo del de 421co); «Onboarding» → «Cuestionario»; Inicio/registro y Centro de ayuda sin ramas.
- Motion: Darkside primero; la carta queda sobre DVSPORT.

## v5.2
- Motion: los 5 videos se reproducen en bucle a la vez (antes el límite era 4); al ampliar una pieza ya no aparece pie de texto.
