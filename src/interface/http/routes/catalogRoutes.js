// Purpose: Legacy/query-param catalog API under /api/catalog.

export function mountCatalogRoutes(r, deps) {
  const { validate, handlers, catalogSearchQuerySchema } = deps;

  r.get("/api/catalog/categories", handlers.listCategories);
  r.get("/api/catalog/products", handlers.listProducts);
  r.get("/api/catalog/items", handlers.listItems);
  r.get("/api/catalog/search", validate({ query: catalogSearchQuerySchema }), handlers.search);
}
