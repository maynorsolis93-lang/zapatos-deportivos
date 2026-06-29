# Tasks — social-integrations

## Task List

- [ ] 1. Crear js/social.config.js
  - [ ] 1.1 Crear archivo con objeto global SOCIAL_CONFIG con las 5 claves y valores vacíos por defecto
  - [ ] 1.2 Agregar comentarios documentando origen y formato de cada variable

- [ ] 2. Crear js/social.js — estructura base y detección de página
  - [ ] 2.1 Crear archivo con IIFE que expone window.SocialModule
  - [ ] 2.2 Implementar detección de página activa via window.location.pathname
  - [ ] 2.3 Implementar listener DOMContentLoaded que llama a las funciones de init según la página
  - [ ] 2.4 Exponer trackViewContent, trackAddToCart, trackPurchase en window.SocialModule

- [ ] 3. Implementar Meta Pixel (Req 6, 7)
  - [ ] 3.1 Implementar initMetaPixel(): leer META_PIXEL_ID, inyectar script en document.head, incluir noscript fallback
  - [ ] 3.2 Implementar trackViewContent(product): guard fbq, llamar fbq con content_name, content_ids, value
  - [ ] 3.3 Implementar trackAddToCart(product): guard fbq, llamar fbq con content_name, content_ids, value, currency
  - [ ] 3.4 Implementar trackPurchase(order): guard fbq, llamar fbq con value, currency, content_ids

- [ ] 4. Implementar botón flotante de WhatsApp (Req 4)
  - [ ] 4.1 Implementar buildWhatsAppURL(number, text): retornar URL wa.me con texto codificado
  - [ ] 4.2 Implementar initWhatsAppFloat(): crear elemento fixed con aria-label, tooltip, animación de entrada con delay 1s
  - [ ] 4.3 Posicionar en bottom:5.5rem, right:2rem, z-index:1001

- [ ] 5. Implementar share buttons en product.html (Req 1)
  - [ ] 5.1 Implementar buildShareURL(network, product): construir URLs para facebook, twitter, pinterest, whatsapp
  - [ ] 5.2 Implementar openPopup(url): window.open con dimensiones 600x400
  - [ ] 5.3 Implementar initShareButtons(product): renderizar 4 botones con colores de marca y aria-labels en .product-info

- [ ] 6. Implementar botón WhatsApp de consulta en product.html (Req 5)
  - [ ] 6.1 Implementar initWhatsAppProductBtn(): renderizar botón en .product-info__actions
  - [ ] 6.2 Construir mensaje con nombre del producto, talla seleccionada (si existe) y URL del producto
  - [ ] 6.3 Leer selectedSize desde el DOM (botón con clase size--selected)

- [ ] 7. Implementar Social Login en checkout.html (Req 2)
  - [ ] 7.1 Implementar initSocialLogin(): renderizar sección con botones Facebook y Google y separador "o continúa con"
  - [ ] 7.2 Cargar Facebook SDK dinámicamente solo si FB_APP_ID está configurado
  - [ ] 7.3 Cargar Google Identity API dinámicamente solo si GOOGLE_CLIENT_ID está configurado
  - [ ] 7.4 Implementar handler de éxito: pre-rellenar #field-name y #field-email con datos del proveedor
  - [ ] 7.5 Implementar handler de error: mostrar mensaje no bloqueante .social-login__error

- [ ] 8. Implementar Instagram Feed en index.html (Req 3)
  - [ ] 8.1 Implementar initInstagramFeed(): crear sección entre .bestsellers y footer
  - [ ] 8.2 Si INSTAGRAM_TOKEN está configurado, fetch a Instagram Basic Display API; si no, usar INSTAGRAM_MOCK
  - [ ] 8.3 Renderizar exactamente 6 posts como grid con enlaces target="_blank" rel="noopener noreferrer"
  - [ ] 8.4 Mostrar título "Síguenos en Instagram" con handle @stepstyle

- [ ] 9. Agregar estilos CSS al final de css/styles.css (Req 10)
  - [ ] 9.1 Estilos para .share-buttons (layout, colores de marca por red social)
  - [ ] 9.2 Estilos para .social-login (separador, botones con colores de marca)
  - [ ] 9.3 Estilos para .instagram-feed (grid 3 col desktop / 2 col mobile, aspect-ratio:1/1, overlay hover)
  - [ ] 9.4 Estilos para .whatsapp-float (position:fixed, bottom:5.5rem, right:2rem, z-index:1001, animación scale+fade)
  - [ ] 9.5 Estilos para .whatsapp-product-btn y tooltip

- [ ] 10. Agregar <script src="/js/social.js"> a todas las páginas HTML
  - [ ] 10.1 Agregar script tag en index.html después de main.js
  - [ ] 10.2 Agregar script tag en product.html después de main.js
  - [ ] 10.3 Agregar script tag en cart.html después de main.js
  - [ ] 10.4 Agregar script tag en checkout.html después de main.js

- [ ] 11. Integrar llamadas de Pixel desde main.js (Req 7)
  - [ ] 11.1 En doAddToCart() de main.js: llamar window.SocialModule?.trackAddToCart(product) con optional chaining
  - [ ] 11.2 En initCartPage() al confirmar pedido (paso 4): llamar window.SocialModule?.trackPurchase(order)
  - [ ] 11.3 En initProductPage() al terminar de cargar datos: llamar window.SocialModule?.trackViewContent(product)

- [ ] 12. Escribir tests
  - [ ] 12.1 Crear js/__tests__/social.unit.test.js con los unit tests de ejemplos y edge cases
  - [ ] 12.2 Crear js/__tests__/social.property.test.js con los 12 property-based tests usando fast-check (numRuns: 100)
