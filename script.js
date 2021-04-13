let id;
let tag;

// Load
window.onload = function () {
  dashboardInit();
};

// Refresh
// setInterval(function () {
//   dashboardUpdate();
// }, 1000);

// Init
function dashboardInit() {
  urlParameters();
  id ? getKit() : getKits();
}

// API get kits
function getKits() {
  const kitsUrl = "https://api.smartcitizen.me/v0/devices/world_map";
  https: fetch(kitsUrl)
    .then((res) => {
      if (res.status == 429) alertUpdate(id, "tooManyRequests");
      return res.json();
    })
    .then((kits) => {
      displayKits(kits);
    });
}

// API get kit
function getKit() {
  console.log("kit");
}

// Display kits (index)
function displayKits(kits) {
  let dateNow = new Date();
  let kitsActive = [];
  let kitsInactive = [];
  // Sort kits arrays by date
  kits.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  // Sort active and inactive kits
  for (let kit of kits) {
    let lastUpdate = new Date(kit.updated_at);
    let dateDifferenceMinutes = (dateNow.getTime() - lastUpdate.getTime()) / (1000 * 3600);
    dateDifferenceMinutes < 30 ? kitsActive.push(kit) : kitsInactive.push(kit);
  }
  // Display title
  const elemTitle = document.createElement("h1");
  elemTitle.id = "subtitle";
  elemTitle.innerHTML = "Smart Citizen Dashboard";
  document.getElementById("main").appendChild(elemTitle);
  // Display subtitle
  const elemSubtitle = document.createElement("h2");
  elemSubtitle.id = "subtitle";
  elemSubtitle.innerHTML = `${kitsActive.length} Kits connected from a total of ${kitsActive.length + kitsInactive.length} (${Math.round((kitsActive.length / kitsInactive.length) * 100)} %)`;
  elemTitle.parentNode.insertBefore(elemSubtitle, elemTitle.nextSibling);
  let x = 0;
  // Display active and inactive kits
  while (x < 2) {
    let currentKit;
    x === 0 ? (currentKit = kitsActive) : (currentKit = kitsInactive);
    for (let i = 0; i < currentKit.length; i++) {
      const elem = document.createElement("article");
      const elemTitle = document.createElement("h2");
      const elemUpdated = document.createElement("p");
      elem.id = currentKit[i].id;
      elemTitle.innerHTML = currentKit[i].name;
      elemUpdated.innerHTML = "last update: " + new Date(currentKit[i].updated_at).toLocaleString("en-GB");
      document.getElementById("main").appendChild(elem);
      document.getElementById("main").classList.remove("detail");
      document.getElementById("main").classList.add("index");
      elem.appendChild(elemTitle);
      elem.appendChild(elemUpdated);
      elem.onclick = function () {
        displayKit(currentKit[i].id);
      };
    }
    x++;
  }
}

// Display kit (detail)
function displayKit(id) {
  console.log(id);
}

// Get URL parameters
function urlParameters() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  params.has("id") === true ? (id = params.get("id")) : (id = null);
  params.has("tag") === true ? (tag = params.get("tag")) : (tag = null);
}

// Alert update
function alertUpdate(id, status) {
  let alert;
  switch (status) {
    case "tooManyRequests":
      message = "Too many requests, please wait 10 seconds before trying again.";
      break;
    default:
      message = "";
      break;
  }
  document.getElementById("alert").innerText = alert;
}
