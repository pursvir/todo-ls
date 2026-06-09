import { connection, documents } from "./server";

documents.listen(connection);
connection.listen();

connection.console.info("Starting Todo LS");
