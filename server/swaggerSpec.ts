export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Cardback API",
    version: "1.0.0",
    description: "Official REST API for Cardback — Action Figure Collector Archive and Collection Management.",
    contact: {
      name: "Cardback Developer Support",
      email: "support@cardback.io"
    }
  },
  servers: [
    {
      url: "/",
      description: "Current environment server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from /api/auth/login"
      }
    },
    schemas: {
      LoginDto: {
        type: "object",
        required: ["password"],
        properties: {
          usernameOrEmail: {
            type: "string",
            example: "collector@example.com",
            description: "Collector username or email address"
          },
          password: {
            type: "string",
            example: "your-account-password",
            description: "Collector account password"
          }
        }
      },
      AuthResponseDto: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          tokenType: { type: "string", example: "Bearer" },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              username: { type: "string" },
              email: { type: "string" },
              displayName: { type: "string" },
              role: { type: "string", example: "USER" }
            }
          }
        }
      },
      OwnedFigureDto: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          figureId: { type: "string" },
          figureName: { type: "string" },
          figureCode: { type: "string" },
          figureImageUrl: { type: "string" },
          lineName: { type: "string" },
          franchiseName: { type: "string" },
          condition: { type: "string", example: "MOC" },
          purchasePrice: { type: "number", example: 45.0 },
          currency: { type: "string", example: "EUR" },
          estimatedValue: { type: "number", example: 75.0 },
          quantity: { type: "number", example: 1 },
          storageLocation: { type: "string", example: "Display Shelf" }
        }
      }
    }
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login with credentials and receive JWT access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginDto"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponseDto"
                }
              }
            }
          },
          "401": {
            description: "Invalid credentials"
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user session",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated collector profile"
          },
          "401": {
            description: "Unauthorized or expired token"
          }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Sign out current collector session",
        responses: {
          "200": {
            description: "Signed out successfully"
          }
        }
      }
    },
    "/api/collection": {
      get: {
        tags: ["Collection"],
        summary: "Retrieve all owned figures in collector archive",
        responses: {
          "200": {
            description: "List of owned action figures"
          }
        }
      },
      post: {
        tags: ["Collection"],
        summary: "Add a figure to collector archive",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OwnedFigureDto"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Figure added successfully"
          }
        }
      }
    },
    "/api/collection/{id}": {
      delete: {
        tags: ["Collection"],
        summary: "Remove an owned figure from collector archive",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Figure deleted successfully"
          }
        }
      }
    },
    "/api/db/stats": {
      get: {
        tags: ["Catalogue"],
        summary: "Database record count summary for all entities",
        responses: {
          "200": {
            description: "Record counts across all database tables"
          }
        }
      }
    },
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Database connection and server health check",
        responses: {
          "200": {
            description: "Health check status"
          }
        }
      }
    }
  }
};
