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
  if (id) {
    getKit();
  } else if (tag) {
    getKits("tag", tag);
  } else if (city) {
    getKits("city", city);
  } else {
    getKits();
  }
}

// API get kits
function getKits(filterType = null, filterValue = null) {
  const kitsUrl = "https://api.smartcitizen.me/v0/devices/world_map";
  https: fetch(kitsUrl)
    .then((res) => {
      if (res.status == 429) alertUpdate(id, "tooManyRequests");
      return res.json();
    })
    .then((kits) => {
      displayKits(kits, filterType, filterValue);
    });
}

// API get kit
function getKit() {
  console.log("kit");
}

// Display kits (index)
function displayKits(kits, filterType = null, filterValue = null) {
  document.getElementById("main").innerHTML = "";
  let dateNow = new Date();
  let kitsFiltered = [];
  let kitsActive = [];
  let kitsInactive = [];
  // Sort kits arrays by date
  kits.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  // Filter kits
  for (let kit of kits) {
    if (filterType != null) {
      if (filterType === "tag" && kit.user_tags.includes(filterValue)) {
        kitsFiltered.push(kit);
      } else if (filterType === "city" && kit.city === filterValue) {
        kitsFiltered.push(kit);
      }
    } else {
      kitsFiltered.push(kit);
    }
  }
  // Sort active and inactive kits
  for (let kit of kitsFiltered) {
    let lastUpdate = new Date(kit.updated_at);
    let dateDifferenceMinutes = (dateNow.getTime() - lastUpdate.getTime()) / (1000 * 3600);
    dateDifferenceMinutes < 30 ? kitsActive.push(kit) : kitsInactive.push(kit);
  }
  // Display title
  const elemTitle = document.createElement("h1");
  elemTitle.id = "title";
  elemTitle.innerHTML = "Smart Citizen Dashboard";
  document.getElementById("main").appendChild(elemTitle);
  // Display subtitle
  const elemSubtitle = document.createElement("h2");
  elemSubtitle.id = "subtitle";
  elemSubtitle.innerHTML = `${kitsActive.length} Kits connected from a total of ${kitsFiltered.length} (${Math.round((kitsActive.length / kitsFiltered.length) * 100)} %)`;
  elemTitle.parentNode.insertBefore(elemSubtitle, elemTitle.nextSibling);
  let x = 0;
  // Display active and inactive kits
  const elemParent = document.createElement("ul");
  document.getElementById("main").appendChild(elemParent);
  while (x < 2) {
    let currentKit;
    x === 0 ? (currentKit = kitsActive) : (currentKit = kitsInactive);
    for (let i = 0; i < currentKit.length; i++) {
      const elem = document.createElement("li");
      const elemTitle = document.createElement("h2");
      const elemCity = document.createElement("h3");
      const elemTags = document.createElement("ul");
      const elemUpdated = document.createElement("p");
      elem.id = currentKit[i].id;
      elemTitle.innerHTML = currentKit[i].name + " (" + currentKit[i].id + ")";
      elemCity.innerHTML = currentKit[i].city;
      elem.appendChild(elemTitle);
      elem.appendChild(elemCity);
      elem.appendChild(elemTags);
      if (currentKit[i].user_tags.length > 0) {
        for (let j = 0; j < currentKit[i].user_tags.length; j++) {
          const elemTag = document.createElement("li");
          elemTag.innerHTML = currentKit[i].user_tags[j];
          elemTag.onclick = function () {
            urlAddParameter("tag", currentKit[i].user_tags[j]);
            dashboardInit();
          };
          elemTags.appendChild(elemTag);
        }
      }
      elemUpdated.innerHTML = "last update: " + new Date(currentKit[i].updated_at).toLocaleString("en-GB");
      elem.appendChild(elemUpdated);
      elemParent.appendChild(elem);
      document.getElementById("main").classList.remove("detail");
      document.getElementById("main").classList.add("index");
      elemTitle.onclick = function () {
        urlAddParameter("id", currentKit[i].id);
        dashboardInit();
      };
      elemCity.onclick = function () {
        urlAddParameter("city", currentKit[i].city);
        dashboardInit();
      };
    }
    x++;
  }
}

// Display kit (detail)
function displayKit(id) {
  document.getElementById("main").innerHTML = "";
  // Display title
  const elemTitle = document.createElement("h1");
  elemTitle.id = "title";
  elemTitle.innerHTML = "Smart Citizen Dashboard";
  document.getElementById("main").appendChild(elemTitle);
}

// Get URL parameters
function urlParameters() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  params.has("id") === true ? (id = params.get("id")) : (id = null);
  params.has("tag") === true ? (tag = params.get("tag")) : (tag = null);
  params.has("city") === true ? (city = params.get("city")) : (city = null);
}

// Add url parameter
function urlAddParameter(parameter, value) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  // Purge current parameter
  params.forEach(function (value, key) {
    params.delete(key);
  });
  // Add new parameter
  params.set(parameter, value);
  let new_url = url.toString();
  history.pushState({}, null, new_url);
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
