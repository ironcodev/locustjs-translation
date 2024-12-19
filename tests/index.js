import TestRunner from "@locustjs/test";
import test1 from "./TranslatorDefault";
import test2 from "./TranslatorRemote";

const tests = [
  ...test1,
  ...test2
];

TestRunner.start(tests, true);
