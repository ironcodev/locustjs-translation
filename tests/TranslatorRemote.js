import { TranslatorRemote } from "../index.esm.js";
import seasonsEn from "./locales/en/seasons.json";
import seasonsFa from "./locales/fa/seasons.json";

const translator = new TranslatorRemote();

const tests = [
  [
    "TranslatorRemote 1",
    async (expect) => {
      translator.addResource(seasonsEn, "en", "seasons");
      translator.addResource(seasonsFa, "fa", "seasons");

      translator.currentLang = "en";

      expect(translator.translate("seasons.spring")).toBe("Spring");
      expect(translator.translate("seasons.season1")).toBe("Spring");
      expect(translator.translate("seasons.springEn")).toBe("Spring");

      translator.currentLang = "fa";

      expect(translator.translate("seasons.springEn")).toBe("Spring");
    },
  ],
  [
    "TranslatorRemote 2",
    async (expect) => {
      const sr1 = await translator.loadResource(
        "https://raw.githubusercontent.com/ironcodev/locustjs-translation/refs/heads/main/tests/locales/en/seasons.json",
        "en",
        "seasons"
      );
      const sr2 = await translator.loadResource(
        "https://raw.githubusercontent.com/ironcodev/locustjs-translation/refs/heads/main/tests/locales/fa/seasons.json",
        "fa",
        "seasons"
      );

      expect(sr1.success).toBeTrue();
      expect(sr2.success).toBeTrue();

      translator.currentLang = "en";

      expect(translator.translate("seasons.spring")).toBe("Spring");
      expect(translator.translate("seasons.season1")).toBe("Spring");
      expect(translator.translate("seasons.springEn")).toBe("Spring");

      translator.currentLang = "fa";

      expect(translator.translate("seasons.springEn")).toBe("Spring");
    },
  ],
  [
    "TranslatorRemote 3",
    async (expect) => {
      const sr1 = await translator.loadResources(
        "https://raw.githubusercontent.com/ironcodev/locustjs-translation/refs/heads/main/tests/locales/en.json",
        "https://raw.githubusercontent.com/ironcodev/locustjs-translation/refs/heads/main/tests/locales/fa.json"
      );

      expect(sr1.success).toBeTrue();
      expect(sr2.success).toBeTrue();

      translator.currentLang = "en";

      expect(translator.translate("seasons.spring")).toBe("Spring");
      expect(translator.translate("seasons.season1")).toBe("Spring");
      expect(translator.translate("seasons.springEn")).toBe("Spring");

      translator.currentLang = "fa";

      expect(translator.translate("seasons.springEn")).toBe("Spring");
    },
  ],
];

export default tests;
