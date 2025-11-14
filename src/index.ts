import { connection, documents } from "./server";

documents.listen(connection);
connection.listen();
