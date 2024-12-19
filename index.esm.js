import { throwIfInstantiateAbstract } from "@locustjs/exception";
import {
  isArray,
  isEmpty,
  isObject,
  isSomeObject,
  isSomeString,
  query,
  set,
} from "@locustjs/base";
import { format, isWord } from "@locustjs/extensions-string";
import { merge } from "@locustjs/extensions-object";
import { LoggerBase, NullLogger } from "@locustjs/logging";
import { ServiceResponse } from "@locustjs/services";

class TranslatorBase {
  constructor() {
    throwIfInstantiateAbstract(TranslatorBase, this);

    this.currentLang = "en";
    this.resources = {};
    this.t = this.t.bind(this);
  }
  addResource(resource, lang, path) {
    if (isSomeString(lang)) {
      if (isSomeString(path)) {
        resource = set({}, lang + "." + path, resource);
      } else {
        resource = set({}, lang, resource);
      }
    }

    this.resources = merge(this.resources, resource);
  }
  addResources(...resources) {
    if (resources.length) {
      let lang = isSomeString(resources[0]) ? resources[0] : undefined;
      let path =
        resources.length > 1 && isSomeString(resources[1])
          ? resources[1]
          : undefined;

      for (let resource of this.resources.filter(isSomeObject)) {
        this.addResource(resource, lang, path);
      }
    }
  }
  removeResource(lang) {
    delete this.resources[lang];
  }
  getResource(lang) {
    return this.resources[lang];
  }
  parse(value) {
    let i = 0;
    let prev = 0;
    let state = 0;
    let lang = "";
    let key = "";
    let result = [];

    if (value) {
      while (i < value.length) {
        let ch = value[i];

        switch (state) {
          case 0:
            if (ch == "#") {
              if (i > prev) {
                result.push(value.substr(prev, i - prev));
              }

              prev = i;
              state = 1;
            }

            break;
          case 1:
            if (isWord(ch) || ch == "-") {
              state = 2;
            } else if (ch == "{") {
              state = 3;
            } else {
              state = 0;
            }

            break;
          case 2:
            if (isWord(ch) || ch == "-") {
              state = 2;
            } else if (ch == "{") {
              lang = value.substr(prev + 1, i - prev - 1);
              state = 3;
            } else {
              lang = "";
              state = 0;
            }

            break;
          case 3:
            if (isWord(ch) || ch == "_" || ch == ".") {
              key = ch;
              state = 4;
            } else {
              state = 0;
            }

            break;
          case 4:
            if (isWord(ch) || ch == "_" || ch == ".") {
              key += ch;
              state = 4;
            } else if (ch == "}") {
              if (key) {
                const parsedValue = query(
                  this.resources,
                  `${lang || this.currentLang}.${key}`
                );

                result.push(parsedValue);

                key = "";
              }

              prev = i + 1;
              state = 0;
            } else {
              key = "";
              lang = "";
              state = 0;
            }

            break;
        }

        i++;
      }

      if (prev < i) {
        result.push(value.substr(prev, i - prev));
      }
    }

    return result.join("");
  }
  translate(key, ...args) {
    let value = key ? query(this.resources, `${this.currentLang}.${key}`) : "";

    value = this.parse(value);

    const result = format(value, ...args);

    return isEmpty(result) ? key : result;
  }
  t(...args) {
    return this.translate(...args);
  }
}

class TranslatorDefault extends TranslatorBase {}
class TranslatorRemote extends TranslatorBase {
  constructor(logger) {
    super();

    if (logger instanceof LoggerBase) {
      this.logger = logger;
    } else {
      this.logger = new NullLogger();
    }
  }
  async loadResource(url, lang, path) {
    this.logger.enterScope("TranslatorRemote.loadResource");
    const response = new ServiceResponse();

    try {
      this.logger.debug(`Loading language resource ${url} ...`);

      const res = await fetch(url);
      const json = await res.json();

      this.addResource(json, lang, path);

      response.succeeded();
    } catch (ex) {
      this.logger.danger(ex);

      response.failed(ex);
    }

    this.logger.exitScope();

    return response;
  }
  loadResources(...urls) {
    return this.loadLanguagePathResources(undefined, undefined, ...urls);
  }
  loadLanguageResources(lang, ...urls) {
    return this.loadLanguagePathResources(lang, undefined, ...urls);
  }
  async loadLanguagePathResources(lang, path, ...urls) {
    this.logger.enterScope("TranslatorRemote.loadResources");
    const response = new ServiceResponse();

    if (urls.length) {
      let i = 0;

      for (let url of this.resources.filter(isSomeObject)) {
        if (isSomeString(url)) {
          const sr = await this.loadResource(url, lang);

          response.addResponse(
            sr,
            `${i}. loadResource lang = ${lang}, path = ${path}, url = ${url}`
          );
        } else {
          response.addResponse(
            ServiceResponse.fromStatus("invalid-url").setSubject(
              `${i}. loadResource lang = ${lang}, path = ${path}, url = ${url}`
            )
          );
        }

        i++;
      }
    } else {
      response.setStatus("no-urls");
    }

    this.logger.exitScope();

    return response;
  }
}

export { TranslatorBase, TranslatorDefault, TranslatorRemote };
