# Requirements Document

## Introduction

Integración de redes sociales para el e-commerce de calzado StepStyle. El módulo añade botones de compartir en la página de producto, login social en el checkout, feed de Instagram en la página principal, botón flotante de WhatsApp en todas las páginas y seguimiento de eventos mediante Meta Pixel. Todo el código JavaScript se centraliza en `js/social.js` y los estilos se agregan a `css/styles.css`. La configuración de tokens y credenciales se gestiona mediante variables de entorno expuestas como constantes en un archivo de configuración separado.

## Glossary

- **Social_Module**: El archivo `js/social.js` que contiene todas las funciones de integración social.
- **Share_Buttons**: Conjunto de botones que permiten compartir la URL del producto en Facebook, Twitter, Pinterest y WhatsApp.
- **Social_Login**: Botones de autenticación que permiten al usuario continuar el checkout usando su cuenta de Facebook o Google.
- **Instagram_Feed**: Sección de la página principal que muestra las últimas 6 publicaciones del perfil de Instagram de StepStyle.
- **WhatsApp_Float**: Botón flotante persistente en todas las páginas que abre una conversación de WhatsApp con la tienda.
- **WhatsApp_Product_Btn**: Botón dentro de la página de producto que abre WhatsApp con un mensaje predefinido sobre disponibilidad del producto.
- **Meta_Pixel**: Código de seguimiento de Facebook/Meta que registra eventos de comportamiento del usuario.
- **Pixel_Event**: Evento estándar de Meta Pixel (ViewContent, AddToCart, Purchase) disparado en momentos clave del flujo de compra.
- **Env_Config**: Archivo `js/social.config.js` que expone las variables de entorno (tokens, IDs) como constantes JavaScript.
- **Storefront**: La interfaz pública del e-commerce visible para los clientes.

---

## Requirements

### Requirement 1: Botones de compartir en página de producto

**User Story:** As a user, I want to share a product on social networks, so that I can recommend it to my contacts.

#### Acceptance Criteria

1. THE Share_Buttons SHALL renderizarse en `product.html` dentro de la sección de información del producto, debajo de las acciones de compra.
2. THE Share_Buttons SHALL incluir botones para Facebook, Twitter, Pinterest y WhatsApp.
3. WHEN el usuario activa el botón de Facebook, THE Social_Module SHALL abrir una ventana emergente con la URL de compartir de Facebook usando la URL canónica del producto.
4. WHEN el usuario activa el botón de Twitter, THE Social_Module SHALL abrir una ventana emergente con la URL de compartir de Twitter incluyendo el nombre del producto y la URL canónica.
5. WHEN el usuario activa el botón de Pinterest, THE Social_Module SHALL abrir una ventana emergente con la URL de compartir de Pinterest incluyendo la imagen principal del producto y la URL canónica.
6. WHEN el usuario activa el botón de WhatsApp, THE Social_Module SHALL abrir el enlace de WhatsApp con un mensaje que incluya el nombre del producto y la URL canónica.
7. THE Share_Buttons SHALL aplicar los colores de marca de cada red social (#1877F2 Facebook, #1DA1F2 Twitter, #E60023 Pinterest, #25D366 WhatsApp).
8. THE Share_Buttons SHALL ser accesibles con atributos `aria-label` descriptivos en cada botón.

---

### Requirement 2: Login social en checkout

**User Story:** As a user, I want to continue checkout using my Facebook or Google account, so that I can avoid filling in my data manually.

#### Acceptance Criteria

1. THE Social_Login SHALL renderizarse en `checkout.html` en el paso 1 (Datos Personales), encima del formulario de datos.
2. THE Social_Login SHALL incluir un botón "Continuar con Facebook" y un botón "Continuar con Google".
3. WHEN el usuario activa "Continuar con Facebook", THE Social_Module SHALL iniciar el flujo de autenticación OAuth de Facebook usando el Facebook SDK.
4. WHEN el usuario activa "Continuar con Google", THE Social_Module SHALL iniciar el flujo de autenticación OAuth de Google usando la Google Identity API.
5. WHEN la autenticación social es exitosa, THE Social_Module SHALL pre-rellenar los campos `field-name` y `field-email` del formulario con los datos obtenidos del proveedor.
6. IF la autenticación social falla, THEN THE Social_Module SHALL mostrar un mensaje de error no bloqueante indicando que el inicio de sesión no pudo completarse.
7. THE Social_Login SHALL mostrar un separador visual con el texto "o continúa con" entre los botones sociales y el formulario.
8. THE Social_Login SHALL aplicar los colores de marca: #1877F2 para Facebook y #4285F4 para Google.

---

### Requirement 3: Feed de Instagram en página principal

**User Story:** As a visitor, I want to see StepStyle's latest Instagram posts on the homepage, so that I can discover new products and follow the brand.

#### Acceptance Criteria

1. THE Instagram_Feed SHALL renderizarse en `index.html` como una sección independiente entre la sección de bestsellers y el footer.
2. THE Instagram_Feed SHALL mostrar exactamente 6 publicaciones obtenidas mediante la Instagram Basic Display API o datos de ejemplo cuando el token no esté configurado.
3. WHEN los datos del feed están disponibles, THE Instagram_Feed SHALL mostrar cada publicación como una imagen cuadrada con overlay de ícono de Instagram al hacer hover.
4. WHEN el usuario activa una publicación del feed, THE Social_Module SHALL abrir el enlace directo al post de Instagram en una nueva pestaña con `rel="noopener noreferrer"`.
5. THE Instagram_Feed SHALL mostrar un título de sección "Síguenos en Instagram" con el handle `@stepstyle`.
6. IF la carga del feed falla o el token no está configurado, THEN THE Instagram_Feed SHALL mostrar 6 imágenes de placeholder con el mensaje "Visítanos en Instagram".
7. THE Instagram_Feed SHALL aplicar un layout de cuadrícula de 3 columnas en desktop y 2 columnas en mobile (viewport < 768px).

---

### Requirement 4: Botón flotante de WhatsApp

**User Story:** As a user, I want a persistent WhatsApp button on every page, so that I can contact the store quickly from anywhere.

#### Acceptance Criteria

1. THE WhatsApp_Float SHALL renderizarse en todas las páginas (`index.html`, `product.html`, `cart.html`, `checkout.html`) como un elemento flotante fijo en la esquina inferior derecha.
2. THE WhatsApp_Float SHALL posicionarse por encima del botón flotante de carrito existente, sin solaparse con él (separación mínima de 70px entre ambos botones).
3. WHEN el usuario activa THE WhatsApp_Float, THE Social_Module SHALL abrir `https://wa.me/{WHATSAPP_NUMBER}` con un mensaje de saludo predefinido en una nueva pestaña.
4. THE WhatsApp_Float SHALL usar el color de marca de WhatsApp (#25D366) y mostrar el ícono SVG oficial de WhatsApp.
5. THE WhatsApp_Float SHALL incluir un atributo `aria-label="Contactar por WhatsApp"` para accesibilidad.
6. THE WhatsApp_Float SHALL aplicar una animación de entrada (scale + fade) al cargar la página con un retraso de 1 segundo.
7. WHILE el usuario hace hover sobre THE WhatsApp_Float, THE Social_Module SHALL mostrar un tooltip con el texto "¿Necesitas ayuda?".

---

### Requirement 5: Botón de consulta de disponibilidad por WhatsApp en producto

**User Story:** As a user, I want to ask about product availability via WhatsApp, so that I can get a quick answer before purchasing.

#### Acceptance Criteria

1. THE WhatsApp_Product_Btn SHALL renderizarse en `product.html` dentro de las acciones del producto, junto a los botones "Comprar ahora" y "Agregar al carrito".
2. WHEN el usuario activa THE WhatsApp_Product_Btn, THE Social_Module SHALL construir un mensaje que incluya el nombre del producto, la talla seleccionada (si existe) y la URL del producto.
3. WHEN el usuario activa THE WhatsApp_Product_Btn sin talla seleccionada, THE Social_Module SHALL construir el mensaje sin incluir talla, usando solo el nombre del producto y la URL.
4. THE WhatsApp_Product_Btn SHALL usar el color #25D366 y el texto "Consultar disponibilidad por WhatsApp".
5. THE WhatsApp_Product_Btn SHALL incluir el ícono SVG de WhatsApp a la izquierda del texto.

---

### Requirement 6: Meta Pixel — instalación y configuración

**User Story:** As a store owner, I want the Meta Pixel installed on all pages, so that I can track user behavior and optimize ad campaigns.

#### Acceptance Criteria

1. THE Meta_Pixel SHALL inyectarse en el `<head>` de todas las páginas (`index.html`, `product.html`, `cart.html`, `checkout.html`) mediante el Social_Module al cargarse el DOM.
2. THE Meta_Pixel SHALL leer el ID del pixel desde la constante `SOCIAL_CONFIG.META_PIXEL_ID` definida en `js/social.config.js`.
3. IF `SOCIAL_CONFIG.META_PIXEL_ID` está vacío o no definido, THEN THE Social_Module SHALL omitir la inyección del pixel sin lanzar errores en consola.
4. THE Meta_Pixel SHALL incluir el `<noscript>` fallback de imagen de 1×1 píxel como parte del código de instalación estándar de Meta.

---

### Requirement 7: Meta Pixel — eventos de seguimiento

**User Story:** As a store owner, I want key shopping events tracked automatically, so that I can measure conversions and retarget users.

#### Acceptance Criteria

1. WHEN `product.html` termina de cargar los datos del producto, THE Social_Module SHALL disparar el evento `fbq('track', 'ViewContent')` con los parámetros `content_name`, `content_ids` y `value`.
2. WHEN el usuario activa "Agregar al carrito" en cualquier página, THE Social_Module SHALL disparar el evento `fbq('track', 'AddToCart')` con los parámetros `content_name`, `content_ids`, `value` y `currency`.
3. WHEN el checkout llega al paso 4 (Confirmación de pedido), THE Social_Module SHALL disparar el evento `fbq('track', 'Purchase')` con los parámetros `value`, `currency` y `content_ids`.
4. IF `fbq` no está definido en el contexto global, THEN THE Social_Module SHALL omitir el disparo del evento sin lanzar errores en consola.

---

### Requirement 8: Configuración de variables de entorno

**User Story:** As a developer, I want all social credentials managed in a single config file, so that I can update tokens without modifying business logic.

#### Acceptance Criteria

1. THE Env_Config SHALL existir en la ruta `js/social.config.js` y exportar un objeto global `SOCIAL_CONFIG` con las claves: `META_PIXEL_ID`, `FB_APP_ID`, `GOOGLE_CLIENT_ID`, `INSTAGRAM_TOKEN`, `WHATSAPP_NUMBER`.
2. THE Env_Config SHALL proveer valores vacíos (`""`) como valores por defecto para todas las claves, de modo que el Social_Module funcione en modo degradado sin credenciales.
3. THE Env_Config SHALL incluir comentarios que documenten el origen y formato esperado de cada variable.
4. THE Social_Module SHALL leer todas las credenciales exclusivamente desde `SOCIAL_CONFIG` y no contener ninguna credencial hardcodeada.

---

### Requirement 9: Archivo Social_Module (js/social.js)

**User Story:** As a developer, I want all social integration logic in a single file, so that the codebase remains organized and maintainable.

#### Acceptance Criteria

1. THE Social_Module SHALL existir en la ruta `js/social.js` y ser referenciado en todas las páginas HTML después de `js/main.js`.
2. THE Social_Module SHALL inicializarse automáticamente al dispararse el evento `DOMContentLoaded`.
3. THE Social_Module SHALL detectar en qué página se encuentra (mediante `document.body` o `window.location.pathname`) y activar únicamente las integraciones correspondientes a esa página.
4. THE Social_Module SHALL exponer las funciones de disparo de Pixel_Event (`trackViewContent`, `trackAddToCart`, `trackPurchase`) en el objeto global `window.SocialModule` para que `main.js` pueda invocarlas.
5. THE Social_Module SHALL funcionar sin errores en páginas donde las integraciones no aplican, sin requerir modificaciones en esas páginas.

---

### Requirement 10: Estilos CSS para componentes sociales

**User Story:** As a developer, I want social component styles appended to the existing stylesheet, so that the visual system remains unified.

#### Acceptance Criteria

1. THE Storefront SHALL agregar los estilos de los componentes sociales al final de `css/styles.css` sin modificar los estilos existentes.
2. THE Share_Buttons SHALL usar variables CSS existentes del proyecto (`--color-primary`, `--color-secondary`, `--color-accent`) para espaciado y tipografía, y colores de marca de cada red para los fondos de botón.
3. THE WhatsApp_Float SHALL usar `position: fixed`, `z-index` superior al del botón flotante de carrito existente, y una sombra consistente con el sistema de diseño.
4. THE Instagram_Feed SHALL aplicar `aspect-ratio: 1 / 1` en cada celda de la cuadrícula para mantener imágenes cuadradas.
5. THE Social_Login SHALL aplicar estilos de botón consistentes con el sistema de diseño existente, diferenciados únicamente por el color de fondo de cada proveedor.
