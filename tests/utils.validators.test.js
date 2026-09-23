const { isValidEmail, isStrongPassword } = require("../utils/validators");

describe("utils/validators", () => {
  describe("isValidEmail", () => {
    it("accepts a well-formed email", () => {
      expect(isValidEmail("admin@indexiafinance.com")).toBe(true);
    });

    it("rejects a missing @", () => {
      expect(isValidEmail("admin-indexiafinance.com")).toBe(false);
    });

    it("rejects non-string input", () => {
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("accepts a password with a letter and a number, 8+ chars", () => {
      expect(isStrongPassword("Passw0rd")).toBe(true);
    });

    it("rejects a password shorter than 8 characters", () => {
      expect(isStrongPassword("Pas0rd")).toBe(false);
    });

    it("rejects a password with no digit", () => {
      expect(isStrongPassword("Password")).toBe(false);
    });
  });
});
