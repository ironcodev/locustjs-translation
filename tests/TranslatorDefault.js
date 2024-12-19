import { TranslatorDefault } from "../index.esm.js";

const enResource = {
  en: {
    menu: {
      home: "Home",
      about: "About",
      blogs: "Blogs",
      contact: "Contact",
    },
    messages: {
      account: {
        user_not_found: "User '{0}' was not found.",
        invalid_password: "Password must have {min} to {max} characters.",
      },
    },
    home: "#{menu.home}",
    aboutEn: "#en{menu.about}",
    contactEn: "#1. #en{menu.contact} {{0}}"
  },
};
const faResource = {
  fa: {
    menu: {
      home: "خانه",
      about: "درباره",
      blogs: "وب‌لاگ",
      contact: "تماس",
    },
    messages: {
      account: {
        user_not_found: "کاربر {0} پیدا نشد.",
        invalid_password: "رمز عبور باید بین {min} و {max} کاراکتر داشته باشد.",
      },
    },
    home: "#{menu.home}",
    aboutEn: "#en{menu.about}",
    contactEn: "#1. #en{menu.contact} {{0}}"
  },
};
const translator = new TranslatorDefault();

translator.addResource(enResource);
translator.addResource(faResource);

const tests = [
  [
    "TranslatorDefault 1: using translate()",
    (expect) => {
      translator.currentLang = "en";

      expect(translator.translate("some.not-existing.key")).toBe(
        "some.not-existing.key"
      );
      expect(translator.translate("menu.home")).toBe("Home");
      expect(translator.translate("messages.account.user_not_found")).toBe(
        "User '{0}' was not found."
      );
      expect(
        translator.translate("messages.account.user_not_found", "user1")
      ).toBe("User 'user1' was not found.");
      expect(translator.translate("messages.account.invalid_password")).toBe(
        "Password must have {min} to {max} characters."
      );
      expect(
        translator.translate("messages.account.invalid_password", {
          min: 5,
          max: 15,
        })
      ).toBe("Password must have 5 to 15 characters.");
      expect(translator.translate("home")).toBe("Home");
      expect(translator.translate("aboutEn")).toBe("About");
      expect(translator.translate("contactEn")).toBe("#1. Contact {0}");

      translator.currentLang = "fa";

      expect(translator.translate("menu.home")).toBe("خانه");
      expect(translator.translate("messages.account.user_not_found")).toBe(
        "کاربر {0} پیدا نشد."
      );
      expect(
        translator.translate("messages.account.user_not_found", "user1")
      ).toBe("کاربر user1 پیدا نشد.");
      expect(translator.translate("messages.account.invalid_password")).toBe(
        "رمز عبور باید بین {min} و {max} کاراکتر داشته باشد."
      );
      expect(
        translator.translate("messages.account.invalid_password", {
          min: 5,
          max: 15,
        })
      ).toBe("رمز عبور باید بین 5 و 15 کاراکتر داشته باشد.");
      expect(
        translator.translate("messages.account.invalid_password", {
          min: 5,
        })
      ).toBe("رمز عبور باید بین 5 و {max} کاراکتر داشته باشد.");
      expect(translator.translate("home")).toBe("خانه");
      expect(translator.translate("aboutEn")).toBe("About");
      expect(translator.translate("contactEn")).toBe("#1. Contact {0}");
    },
  ]
];

export default tests;
