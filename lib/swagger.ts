import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Barangay San Jose Annex Area 6 MIS API",
      version: "1.0.0",
      description: "API documentation for the Barangay MIS system",
    },
    servers: [
      { url: "http://localhost:5500", description: "Local dev server" },
    ],
  },
  // Path(s) to files containing your route JSDoc annotations
  apis: ["./src/server.ts", "./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);