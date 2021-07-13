let settings = {
  title: "Smart Citizen Dashboard",
  logo: "logo-sc.svg",
  filter: { search: true, type: "", value: "" },
  // primarySensor: { id: 56, threshold: [20, 40] },
  indexView: ["name", "city", "user", "tags", "id", "last_update"],
  // https://developer.smartcitizen.me/#get-historical-readings
  plots: {rollup: '1m', delta_days: 5},
  sensors: [
    { id: 56, threshold: [20, 40] },
    { id: 56, threshold: [40, 20] },
    { id: 56, threshold: [20, 40] },
    { id: 56, threshold: [40, 20] },
  ],
  styles: {
    colorBase: "#000000",
    colorBody: "#ffffff",
    colorAction: "#0065ff",
    colorBackground: "#dfdfdf",
  },
};

// let settings = {
//   title: "CO-MIDA Dashboard",
//   logo: "logo-random.svg",
//   filter: { search: false, type: "user", value: "IAAC-Cristian_Rizzuti" },
//   primarySensor: { id: 56, threshold: [20, 40] },
//   indexView: ["name","last_update"],
//   sensors: [
//     { id: 56, threshold: [20, 40] },
//     { id: 56, threshold: [40, 20] },
//     { id: 56, threshold: [20, 40] },
//     { id: 56, threshold: [40, 20] },
//   ],
//   styles: {
//     colorBase: "#000000",
//     colorBody: "#ffffff",
//     colorAction: "#0065ff",
//     colorBackground: "#dfdfdf",
//   },
// };