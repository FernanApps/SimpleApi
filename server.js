/**
 * This is the main server script that provides the API endpoints
 *
 * Uses sqlite.js to connect to db
 */

const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

fastify.register(require("@fastify/formbody"));

const db = require("./sqlite.js");
const errorMessage = "Whoops! Error";
const errorInternal = "Internal Server Error";

// OnRoute hook to list endpoints
const routes = { endpoints: [] };
fastify.addHook("onRoute", (routeOptions) => {
  routes.endpoints.push(routeOptions.method + " " + routeOptions.path);
});

// Just send some info at the home route
fastify.get("/", (request, reply) => {
  const data = {
    title: "Hello SQLite (blank)",
    intro: "This is a database-backed API with the following endpoints",
    routes: routes.endpoints,
  };
  reply.status(200).send(data);
});

// Function Generic :C
async function executeSecureFunction(dbFunction, request, reply) {
  const auth = authorized(request.headers.key);

  if (!auth) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  try {
    const data = await dbFunction();
    if (!data) {
      return reply.code(400).send({ error: errorMessage });
    }
    return reply.code(200).send(data);
  } catch (error) {
    console.error("Error retrieving messages from the database:", error);
    return reply.code(500).send({ error: "Internal Server Error" });
  }
}

function checkFieldsExist(body, fields) {
  if (!body) {
    return null; // Return an empty object if body is missing
  }

  const fieldValues = {};

  for (let field of fields) {
    fieldValues[field] = body[field];
  }

  if (Object.keys(fieldValues).length === 0) {
    return null;
  } else if (Object.keys(fieldValues).length !== fields.length) {
    return null;
  } else {
  }
  return fieldValues;
}

// Routes

fastify.get("/messages", async (request, reply) => {
  await executeSecureFunction(db.getMessages, request, reply);
});

fastify.post("/message", async (request, reply) => {
  const requiredFields = ["id"];
  const fieldValues = checkFieldsExist(request.body, requiredFields);

  if (fieldValues === null) {
    return reply.code(400).send({ success: false, error: "Missing fields" });
  }
  await executeSecureFunction(
    () => db.getMessagesById(fieldValues.id),
    request,
    reply
  );
});

const authorized = (key) => {
  // $env:TOKEN = "tu_clave_secreta" : PowerShell
  // console.log("key " + key);
  if (!key || key < 1 || !process.env.TOKEN || key !== process.env.TOKEN)
    return false;
  else return true;
};

// Run the server and report out to the logs
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
});
