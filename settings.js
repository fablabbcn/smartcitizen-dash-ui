let settings = {
  title: "Smart Citizen Dashboard",
  logo: "",
  showFilter: true,
  filter: {show: true, type: "", value: ""},
  primarySensor: { id : 56, threshold : 30 },
  indexView: ["name", "id", "city", "username", "tags", "battery", "updated"],
  sensors: [
    { id: 56, threshold: 30 },
    { id: 56, threshold: 30 },
    { id: 56, threshold: 30 },
    { id: 56, threshold: 30 }
  ],
  styles: {
    colorBase: "#000000",
    colorBody: "#ffffff",
    colorAction: "#0065ff",
    colorBackground: "#dfdfdf"
  }
}