let settings = {
  title: "Smart Citizen",
  logo: "logo-sc.svg",
  filter: {type: "", value: "" },
  searchBar: true,
  primarySensor: { id: 56, threshold: [75, 85] },
  // sensors: [
  //   {id: 10, threshold: [75, 85] },
  //   {id: 5, threshold: [75, 85] },
  //   {id: 4, threshold: [75, 85] },
  //   {id: 8, threshold: [75, 85] },
  //   {id: 9, threshold: [75, 85] },
  //   {id: 21, threshold: [75, 85] },
  //   {id: 7, threshold: [75, 85] },
  //   {id: 6, threshold: [25, 45] },
  // ],
  indexView: ["user", "city", "tags", "id"],
  styles: {
    colorBase: "#2e2e2e",
    colorBody: "#FFFFFF",
    colorBackground: "#ebebed",
    colorTrue: "#019b33",
    colorFalse: "#ff2626",
    borderWidth: "2px",
    borderRadius: "4px",
  },
  footer_logo: "logo-sc.svg",
  footer_description: "An easily deployable dashboard to display data from Smart Citizen kits.",
};

// let settings = {
//   title: "CO-MIDA",
//   logo: "logo-random.svg",
//   filter: {type: "tag", value: "habitas" },
//   searchBar: false,
//   primarySensor: { id: 56, threshold: [60, 80] },
//   sensors: [
//     {id: 14, threshold: [75, 85] },
//     {id: 56, threshold: [30, 85] },
//     {id: 55, threshold: [10, 30] },
//     {id: 53, threshold: [75, 85] },
//   ],
//   indexView: [],
//   styles: {
//     colorBase: "#0b0b0b",
//     colorBody: "#fffdf4",
//     colorBackground: "#fffdf4",
//     colorTrue: "#66b963",
//     colorFalse: "#f96341",
//     borderWidth: "1px",
//     borderRadius: "50%",
//   },
//   minimalistic: true,
//   footer_logo: "logo-random.svg",
//   footer_description: "An intelligent vertical system co-designed with the users to grow edible plants and produce energy thanks to bacteria",
//   footer_links: [
//     {text: "IAAC", url: "https://iaac.net", logo: "logo-iaac.png"},
//     {text: "Smart Citizen", url: "https://smartcitizen.me/", logo: "logo-sc.svg"}
//   ]
// };