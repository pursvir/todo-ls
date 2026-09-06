import pkg from "../package.json";
import { NAME, VERSION } from "../src/info";

describe("Asserting description metadata", () => {
  test("Name assert", () => {
    expect(pkg.name).toStrictEqual(NAME);
  });
  test("Version assert", () => {
    expect(pkg.version).toStrictEqual(VERSION);
  });
});
