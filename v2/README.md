# CUPISSA WEB V2

Nueva implementación aislada en la rama `cupissa-web-v2`. La rama `main` permanece intacta.

## Principios
- Identidad CUPISSA: fucsia, negro y blanco.
- Identidad cromática por mundo mediante variables CSS.
- Temporadas y animaciones configurables desde datos.
- Clasificación relacional: mundo > categoría > subcategoría.
- Temáticas, ocasiones, temporadas y públicos reutilizables entre mundos.
- Ningún secreto, clave privada ni credencial de pago en el frontend.
- Diseño responsive y accesible, con respeto a `prefers-reduced-motion`.

## Estado
Fundación frontend y catálogo taxonómico inicial. La conexión real a Supabase, autenticación, administración, pagos y servicios transaccionales se implementará por fases y no se simulará como si ya estuviera operativa.

## Próximas fases
1. Modelo SQL y políticas RLS de Supabase.
2. Panel de administración de taxonomía y catálogo.
3. Catálogo público y búsqueda.
4. Autenticación, perfil y pedidos.
5. Crédito CUPISSA y cartera.
6. Checkout e integraciones verificadas.
7. SEO, analítica y publicación.
