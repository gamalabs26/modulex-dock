# ModuleX Dock — sitio de una página (modulex.mayanseas.com)

Construido el 11-nov-2026. Estático: `index.html`, `css/sitio.css`, `js/sitio.js`, `img/`, `media/`, `404.html`.
Destino: cPanel de GrupoDriel → `public_html/modulex.mayanseas.com` (DNS A modulex → 132.148.214.47, SSL Let's Encrypt).
`mayanseas.com/modulex` sigue en Wix y no se toca.

## Procedencia de cada dato publicado

| Dato en el sitio | Fuente | Nota |
|---|---|---|
| 75 × 75 × 22.5 cm, 13.5 kg, flotación ideal 100 kg, 50 módulos/día/persona, antiderrapante, agua dulce o salada | Ficha Técnica ModuleX.pdf (OneDrive 15_MayanSeas/Productos/ModuleX/Comercial) | La ficha manda. La presentación dice **125 kg** por módulo y un borrador web viejo decía 95 kg / 12 kg: se publicó lo de la ficha. |
| Piezas: módulo, cruz superior, cruz inferior, media cruz, tornillería de acero inoxidable, tapones | Presentación ModuleX 2.0 (PDF del cliente) + ficha | — |
| "Diseñados y fabricados totalmente en México" | Presentación | Se **omitió** "primer muelle modular flotante de México": es un claim de primacía que no se puede verificar. |
| Obras: Veracruz 2012, Cancún 2013, Toluca 2014, Apodaca 2014, Metepec 2015-2016, Querétaro 2018 | Presentación (fotos y años) | Las fotos son reales del cliente. |
| Teléfono 442 124 7481 | El de ventas que está vivo en mayanseas.com/modulex (Wix) | La ficha trae también (442) 217-3093 y 95, que no aparece en ninguna fuente viva: **no se publicó**. |
| contacto@mayanseas.com | Ficha | Se usa en el mailto del formulario. |
| Dirección: Cerro de las Campanas 15, Col. Las Américas, 76121 Querétaro | Mayan Seas (fuentes del cliente) | El botón "Cómo llegar" abre Google Maps con la ruta. |
| Razón social "Aplicaciones Silidriel, S.A. de C.V." | Ficha | Pie de página y JSON-LD. |

**Precios, garantía, vida útil, certificaciones, clientes y testimonios no se publican.** No hay precios públicos (los internos de la nota de historia NO van). Tampoco hay reseñas ni certificaciones en ninguna fuente.

## Assets
- **Video del hero (`media/hero-muelle-*.mp4`):** es REAL. Viene de IMG_3031 del cliente (muelle en cruz sobre laguna), tramo de 6 a 9 s: es el único donde no aparece nadie. Se recortó un poco el borde superior para dejar fuera a las personas del fondo y va en ping-pong (6 s) para que el loop no tenga corte. Hay versión 1080p (2.6 MB) y 720p (0.9 MB). El sitio no afirma en qué obra se grabó: la etiqueta dice sólo "muelle ModuleX en laguna". El cenital anterior (IMG_3908) se descartó.
- **Video de la laguna (`media/laguna-*.mp4`):** es GENERADO con Seedance 2.0 full a 1080p, a partir de una imagen de ModuleX. Costó **1.68 USD**. En el sitio está rotulado como "Recreación generada" y lo aclara el pie.
- **Uniones:** el hueco en X y la cruz de unión van al CENTRO del lado compartido por dos módulos, no en las esquinas (comprobado en fotos reales). El diagrama de Configura y la tarjeta "El módulo" lo dicen así.
- **Fotos de piezas y obras:** reales del cliente, recomprimidas a WebP 1600/800.
- **OG (`img/og.jpg`):** composición con `_brief/og/` sobre un cuadro real del hero (IMG_3031).
- **Ícono (`img/apple-touch-icon.png`):** se renderizó desde `favicon.svg`.
- **No se suben** estas imágenes, que no se usan: `img/presa-qro*`, `img/laguna-cancun-2*`, `media/hero-poster.webp`, `media/laguna-poster.webp`. Tampoco los `*.md` ni `_brief/`.

## Lo que el cliente todavía debe (sitio INCOMPLETO en estos puntos)
1. **Reseñas reales**, con autor y fuente. Hoy hay un bloque que pide la primera reseña por Instagram.
2. **Horario de atención.** Hoy el sitio dice honestamente que no está publicado.
3. **Confirmar el WhatsApp.** El formulario arma el mensaje para `wa.me/524421247481`, que es el mismo número de ventas. No se ha confirmado que ese número tenga WhatsApp.
4. **El 125 kg contra 100 kg.** Hay que confirmar qué cifra de flotación es la vigente para corregir la presentación o el sitio.
5. **(Opcional) Fotos o video nuevos** de obras recientes, posteriores a 2018.

## Verificación (11-nov-2026, local)
- `verifica-motion.py --contrato`: CUMPLE (7 showstoppers, 5 ambientales).
- `verifica-entrega.py`: CUMPLE, con 2 notas (sólo hay 1 bloque de reseña y el directorio pesa 10.4 MB; la primera carga real ronda 3 MB).
- `prueba-motor.js`, en desktop y en móvil: 0 errores de consola, sin scroll horizontal.
- QA visual: 90 capturas en 390/820/1440 px, bajando y subiendo.
  - Bug corregido: la clase `.fino` del `<html>` chocaba con la clase de letra chica y lavaba toda la página a gris con opacity .72.
  - Ajustes de layout: el H2 de Configura, la saga en tablet y el botón fijo en tablet.
