// let settings = {
//   title: "Smart Citizen Dashboard",
//   logo: "",
//   filter: {search: true, type: "tag", value: "Inside"},
//   primarySensor: { id : 56, threshold : [20, 40] },
//   indexView: ["name", "id", "city", "username", "tags", "battery", "updated"],
//   sensors: [
//     { id: 56, threshold: [20, 40] },
//     { id: 56, threshold: [40, 20] },
//     { id: 56, threshold: [20, 40] },
//     { id: 56, threshold: [40, 20] }
//   ],
//   styles: {
//     colorBase: "#000000",
//     colorBody: "#ffffff",
//     colorAction: "#0065ff",
//     colorBackground: "#dfdfdf"
//   }
// }

let settings = {
  title: "CO-MIDA Dashboard",
  logo: "logo-sc.svg",
  filter: { search: true, type: "tag", value: "Inside" },
  primarySensor: { id: 56, threshold: [20, 40] },
  indexView: ["name", "id", "city", "username", "tags", "battery", "updated"],
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