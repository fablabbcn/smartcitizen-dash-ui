let settings = {
  title: "Smart Citizen Dashboard",
  //header: "Smart Citizen Dashboard"
  showFilterHeader: true,
  filter: {type: "", value: "" },
  searchBar: true,
  extraArea: true,
  activeByMinutes: 0,
  maxDataPoints: 500,
  requestInterval: '60', // In Minutes
  // primarySensor: { id: 50, threshold: [60, 100] },
  // sensors: [
  //   {id: 55, threshold: [5, 30] },
  //   {id: 50, threshold: [60, 100] },
  //   {id: 133, threshold: [0, 100] },
  // ],
  indexView: ["city", "tags"],
};