// Schemas and shared parameters for OpenAPI (Swagger) documentation.

export const parameters = {
  ShopIdQuery: {
    name: "shop_id",
    in: "query",
    description: "Shop UUID (alternative: `shopId` query or `x-shop-id` header)",
    schema: { type: "string", format: "uuid" }
  },
  ShopIdQueryAlt: {
    name: "shopId",
    in: "query",
    description: "Shop UUID (alternative: `shop_id` query or `x-shop-id` header)",
    schema: { type: "string", format: "uuid" }
  },
  XShopId: {
    name: "x-shop-id",
    in: "header",
    description: "Shop UUID tenant header",
    schema: { type: "string", format: "uuid" }
  },
  Slug: {
    name: "slug",
    in: "path",
    required: true,
    schema: { type: "string", minLength: 1, maxLength: 128 }
  },
  CartItemId: {
    name: "itemId",
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" }
  },
  OrderId: {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" }
  }
};

export const schemas = {
  Error: {
    type: "object",
    properties: {
      error: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          details: {}
        },
        required: ["code", "message"]
      }
    },
    required: ["error"]
  },
  RegisterRequest: {
    type: "object",
    required: ["shopId", "email", "password"],
    properties: {
      shopId: { type: "string", format: "uuid" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6, maxLength: 128 },
      displayName: { type: "string", maxLength: 120, nullable: true }
    }
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6, maxLength: 128 },
      shopId: { type: "string", format: "uuid" }
    }
  },
  OauthJwtRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      email: { type: "string", format: "email" },
      shopId: { type: "string", format: "uuid" }
    }
  },
  SessionResponse: {
    type: "object",
    properties: {
      accessToken: { type: "string" },
      role: { type: "string", example: "customer" },
      user: { type: "object" },
      customer: { type: "object" },
      shopIds: { type: "array", items: { type: "string", format: "uuid" } },
      profile: { type: "array", items: { type: "object" } },
      shop: { type: "object" }
    }
  },
  PatchProfileRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      displayName: { type: "string", maxLength: 120, nullable: true },
      address: {
        type: "object",
        additionalProperties: false,
        properties: {
          line1: { type: "string", maxLength: 500, nullable: true },
          line2: { type: "string", maxLength: 500, nullable: true },
          landmark: { type: "string", maxLength: 500, nullable: true },
          city: { type: "string", maxLength: 200, nullable: true },
          state: { type: "string", maxLength: 200, nullable: true },
          postalCode: { type: "string", maxLength: 32, nullable: true },
          country: { type: "string", maxLength: 200, nullable: true },
          lat: { type: "number", minimum: -90, maximum: 90, nullable: true },
          lng: { type: "number", minimum: -180, maximum: 180, nullable: true },
          raw: { type: "string", maxLength: 8000, nullable: true }
        }
      }
    }
  },
  LocationCheckRequest: {
    type: "object",
    required: ["lat", "lng"],
    additionalProperties: false,
    properties: {
      lat: { type: "number", minimum: -90, maximum: 90 },
      lng: { type: "number", minimum: -180, maximum: 180 }
    }
  },
  LocationCheckResponse: {
    type: "object",
    properties: {
      serviceable: { type: "boolean" },
      distanceM: { type: "integer", nullable: true },
      maxRadiusM: { type: "integer", nullable: true }
    }
  },
  StorefrontAddress: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      line1: { type: "string" },
      line2: { type: "string", nullable: true },
      landmark: { type: "string", nullable: true },
      city: { type: "string", nullable: true },
      state: { type: "string", nullable: true },
      postalCode: { type: "string", nullable: true },
      country: { type: "string", nullable: true },
      lat: { type: "number", nullable: true },
      lng: { type: "number", nullable: true },
      raw: { type: "string", nullable: true }
    }
  },
  AddressPostRequest: {
    type: "object",
    required: ["line1"],
    properties: {
      line1: { type: "string", minLength: 1, maxLength: 200 },
      line2: { type: "string", maxLength: 200, nullable: true },
      landmark: { type: "string", maxLength: 200, nullable: true },
      city: { type: "string", maxLength: 120, nullable: true },
      state: { type: "string", maxLength: 120, nullable: true },
      postalCode: { type: "string", maxLength: 32, nullable: true },
      country: { type: "string", maxLength: 120, nullable: true },
      lat: { type: "number", minimum: -90, maximum: 90, nullable: true },
      lng: { type: "number", minimum: -180, maximum: 180, nullable: true },
      raw: { type: "string", maxLength: 2000, nullable: true }
    }
  },
  StorefrontProfilePost: {
    type: "object",
    properties: {
      displayName: { type: "string", maxLength: 120, nullable: true },
      phone: { type: "string", maxLength: 32, nullable: true }
    },
    description: "At least one of displayName or phone required"
  },
  CartItemBody: {
    type: "object",
    required: ["productId", "quantity"],
    properties: {
      productId: { type: "string", format: "uuid" },
      quantity: { type: "number", exclusiveMinimum: 0 }
    }
  },
  CartItemPatch: {
    type: "object",
    required: ["quantity"],
    properties: {
      quantity: { type: "number", exclusiveMinimum: 0 }
    }
  },
  CheckoutBody: {
    type: "object",
    required: ["addressId"],
    properties: {
      addressId: { type: "string", format: "uuid" },
      notes: { type: "string", maxLength: 2000, nullable: true }
    }
  },
  SocialSignInBody: {
    type: "object",
    required: ["provider"],
    additionalProperties: false,
    properties: {
      provider: { type: "string", enum: ["google"] },
      disableRedirect: { type: "boolean" },
      callbackURL: { type: "string", format: "uri" },
      additionalData: {
        type: "object",
        additionalProperties: false,
        properties: {
          shopId: { type: "string", format: "uuid" }
        }
      }
    }
  },
  OauthUrlResponse: {
    type: "object",
    properties: {
      url: { type: "string", format: "uri" }
    }
  }
};
