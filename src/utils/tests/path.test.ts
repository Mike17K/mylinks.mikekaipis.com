import { Item } from "../../components";
import { getDepth } from "../path";

describe("getDepth", () => {
  const tests: {
    name: string;
    path: string;
    type: Item["type"];
    expected: number;
  }[] = [
    {
      name: "/youtube",
      type: "link-folder",
      path: "/",
      expected: 0,
    },
    {
      name: "/youtube/logging-go",
      type: "link-folder",
      path: "/youtube/logging-go",
      expected: 1,
    },
    {
      name: "/robotics/arm-simpler---cad-links",
      type: "link",
      path: "/robotics/arm-simpler---cad-links",
      expected: 1,
    },
    {
      name: "/youreventpro/environments/production/customer",
      type: "link",
      path: "/youreventpro/environments/production/customer",
      expected: 3,
    },
  ];

  tests.forEach(({ name, path, expected }) => {
    test(`${name}`, () => {
      const result = getDepth(path);
      expect(result).toBe(expected);
    });
  });
});

// [
//     '/youtube',
//     '/youtube/logging-go',
//     '/youtube/logging-go/implementing-distributed-tracing-in-golang-with-opentelemetry',
//     '/youtube/logging-go/structured-logging-in-go-with-slog!-golang-logging-like-a-10x-engineer',
//     '/youreventpro',
//     '/youtube/general',
//     '/youtube/general/why-has-everyone-stopped-having-children?',
//     '/pcb',
//     '/pcb/kicad-7-pcb-layout-in-5-steps',
//     '/youreventpro/todo',
//     '/youreventpro/todo/tailwind-v4-migrate',
//     '/robotics',
//     '/robotics/arm-design-video',
//     '/robotics/arm-simpler',
//     '/robotics/arm-simpler---cad-links',
//     '/jobs',
//     '/jobs/ηλεκτρολογος-βολο',
//     '/youreventpro/todo/τιμολόγια-mydata',
//     '/youreventpro/todo/stripe-credits',
//     '/ai',
//     '/ai/napkin',
//     '/mushrooms',
//     '/mushrooms/video-factory-growing',
//     '/mushrooms/substrate-instructions',
//     '/mushrooms/m2-calculation-of-mushroom-growing',
//     '/systemdesign',
//     '/systemdesign/excalidraw',
//     '/ai/repomix',
//     '/ai/how-to-use-cursor',
//     '/robotics/esptool',
//     '/youreventpro/emailservice-sendpulse',
//     '/scaling-tools',
//     '/scaling-tools/micro-frontends-(0.3-deploy-as-versel-)',
//     '/scaling-tools/salesforce-crm+agents',
//     '/libraries',
//     '/libraries/shadcn-ui-free-library',
//     '/youreventpro/environments',
//     '/youreventpro/environments/testing',
//     '/youreventpro/environments/production',
//     '/youreventpro/environments/production/customer',
//     '/youreventpro/environments/production/partner',
//     '/youreventpro/environments/production/admin'
//   ]
