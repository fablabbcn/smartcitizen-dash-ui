// Load
window.onload = function () {
  dashboardInit();
};

// Refresh
// setInterval(function () {
//   dashboardUpdate();
// }, 1000);

// Cache
let isCacheSupported = 'caches' in window;

let id;
let tag;

// Init
function dashboardInit() {
  document.title = settings.title;
  urlParameters();
  interface();
  loading(true);
  if (id) {
    getKit(id);
  } else if (tag) {
    getKits("tag", tag);
  } else if (city) {
    getKits("city", city);
  } else if (user) {
    getKits("user", user);  
  } else {
    getKits();
  }
}

// Update
// function dashboardUpdate() {
//   console.log("hello");
// }

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
function getKit(id) {
  const kitUrl = `https://api.smartcitizen.me/v0/devices/${id}`;
  https: fetch(kitUrl)
    .then((res) => {
      if (res.status == 429) alertUpdate(id, "tooManyRequests");
      return res.json();
    })
    .then((kit) => {
      displayKit(kit);
      getKitData(kit);
    });
}

// Api get kit data
function getKitData(kit) {
  let d = new Date();
  let today = d.toISOString().slice(0, 10);
  let then = new Date(d.setDate(d.getDate()-5)).toISOString().slice(0, 10); // 5 days ago
  for (let i = 0; kit.data.sensors.length > i; i++) {
    const sensorUrl = `https://api.smartcitizen.me/v0/devices/${kit.id}/readings?sensor_id=${kit.data.sensors[i].id}&rollup=1h&from=${then}&to=${today}`;
    https: fetch(sensorUrl)
      .then((res) => {
        return res.json();
      })
      .then((sensor) => {
        displaySensor(kit, sensor, i);
      });
  }
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
      } else if (filterType === "user" && kit.owner_username === filterValue) {
        kitsFiltered.push(kit);
      }
    } else {
      kitsFiltered.push(kit);
    }
  }
  // Sort active and inactive kits
  for (let kit of kitsFiltered) {
    let lastUpdate = new Date(kit.updated_at);
    let dateDifferenceMinutes = (dateNow.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
    dateDifferenceMinutes < 1 ? kitsActive.push(kit) : kitsInactive.push(kit);
  }
  // Display title
  const elemTitle = document.createElement("h1");
  elemTitle.id = "title";
  let titleComplement;
  filterType ? titleComplement = ": " + filterValue : titleComplement = "";
  elemTitle.innerHTML = settings.title + titleComplement;
  document.getElementById("main").appendChild(elemTitle);
  // Display subtitle
  const elemSubtitle = document.createElement("h2");
  elemSubtitle.id = "subtitle";
  elemSubtitle.innerHTML = `${kitsActive.length} active kits today, of a total of ${kitsFiltered.length}`;
  elemTitle.parentNode.insertBefore(elemSubtitle, elemTitle.nextSibling);
  // Display active and inactive kits
  const elemParent = document.createElement("section");
  elemParent.id = "kitsList";
  document.getElementById("main").appendChild(elemParent);
  // Display search
  if (settings.filter.search) {
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "filter";
    searchInput.classList.add("fuzzy-search");
    searchInput.id = "searchInput";
    elemParent.appendChild(searchInput);
  }
  // Display list
  const elemList = document.createElement("ul");
  elemList.classList.add("list");
  elemParent.appendChild(elemList);
  let x = 0;
  while (x < 2) {
    let currentKit;
    let kitStatus;
    if (x === 0) {
      kitStatus = "active";
      currentKit = kitsActive;
    } else {
      kitStatus = "inactive";
      currentKit = kitsInactive;
    }
    for (let i = 0; i < currentKit.length; i++) {
      const elem = document.createElement("li");
      elem.classList.add(kitStatus);
      elemList.appendChild(elem);
      // title & id
      const elemTitle = document.createElement("h2");
      const elemId = document.createElement("span");
      elem.id = currentKit[i].id;
      elemTitle.innerHTML = currentKit[i].name;
      elemId.innerHTML = currentKit[i].id;
      elemId.classList.add("id");
      elemTitle.classList.add("name");
      elemTitle.onclick = function () {
        urlAddParameter("id", currentKit[i].id);
        dashboardInit();
      };
      elem.appendChild(elemTitle);
      elemTitle.appendChild(elemId);
      // city
      if (currentKit[i].city) {
        const elemCity = document.createElement("h4");
        elemCity.innerHTML = "📍 " + currentKit[i].city + " (" + currentKit[i].country_code + ")";
        elemCity.classList.add("city");
        elem.appendChild(elemCity);
        elemCity.onclick = function () {
          urlAddParameter("city", currentKit[i].city);
          dashboardInit();
        };
      }
      // user
      if (currentKit[i].owner_username) {
        const elemUser = document.createElement("h4");
        elemUser.innerHTML = "👤 " + currentKit[i].owner_username;
        elemUser.classList.add("user");
        elem.appendChild(elemUser);
        elemUser.onclick = function () {
          urlAddParameter("user", currentKit[i].owner_username);
          dashboardInit();
        };
      }
      // tags
      if (currentKit[i].user_tags.length > 0) {
        const elemTags = document.createElement("div");
        elem.appendChild(elemTags);
        elemTags.classList.add("tags");
        for (let j = 0; j < currentKit[i].user_tags.length; j++) {
          const elemTag = document.createElement("span");
          elemTag.innerHTML = currentKit[i].user_tags[j];
          elemTag.classList.add('tag');
          elemTag.onclick = function () {
            urlAddParameter("tag", currentKit[i].user_tags[j]);
            dashboardInit();
          };
          elemTags.appendChild(elemTag);
        }
      }
      // update
      const elemUpdated = document.createElement("p");
      elemUpdated.classList.add("update");
      elemUpdated.innerHTML = "last update: " + new Date(currentKit[i].updated_at).toLocaleString("en-GB");
      // reset
      document.getElementById("reset").innerText = "Reset filter";
      // classes
      elem.appendChild(elemUpdated);
      document.getElementById("main").classList.remove("detail");
      document.getElementById("main").classList.add("index");
    }
    x++;
  }
  // Search init
  const kitsList = new List('kitsList', { 
    valueNames: ['name', 'city', 'tag', 'update']
  });
  loading(false);
}

// Display kit (detail)
function displayKit(kit) {
  document.getElementById("main").innerHTML = "";
  // title
  const elemTitle = document.createElement("h1");
  elemTitle.id = "title";
  elemTitle.innerHTML = settings.title;
  document.getElementById("main").appendChild(elemTitle);
  // subtitle
  const elemSubtitle = document.createElement("h2");
  elemSubtitle.id = "subtitle";
  elemSubtitle.innerHTML = `${kit.name}`;
  document.getElementById("main").appendChild(elemSubtitle);
  // sensors
  const elemSensors = document.createElement("ul");
  elemSensors.id = "sensors";
  elemSensors.classList.add('list');
  document.getElementById("main").appendChild(elemSensors);
  // link
  const elemLink = document.createElement("a");
  elemLink.innerHTML = 'More info on this kit&nbsp↗';
  elemLink.href = `https://smartcitizen.me/kits/${kit.id}`;
  elemLink.target = "_blank";
  elemLink.classList.add('more');
  document.getElementById("main").appendChild(elemLink);
  // reset
  document.getElementById("reset").innerText = "Back to index";
  // classes
  document.getElementById("main").classList.remove("index");
  document.getElementById("main").classList.add("detail");
}

// Display sensor
function displaySensor(kit, sensor, i) {
  let readings = sensor.readings;
  let data = [[], []];
  for (const reading of readings) {
    let date = new Date(reading[0]).getTime() / 1000;
    data[0].push(date);
    data[1].push(reading[1]);
  }
  if (data != undefined && data[0].length > 0) {
    const elem = document.createElement("li");
    elem.id = kit.data.sensors[i].id;
    // value
    const elemValue = document.createElement("h2");
    elemValue.innerHTML = Math.floor(kit.data.sensors[i].value) + " " + kit.data.sensors[i].unit;
    elem.appendChild(elemValue);
    // title
    const elemTitle = document.createElement("h3");
    elemTitle.innerHTML = kit.data.sensors[i].description;
    elem.appendChild(elemTitle);
    document.getElementById("sensors").appendChild(elem);
    const canvasWidth = 600;
    const canvasHeight = (canvasWidth / 3) * 2;
    const opts = {
      title: kit.data.sensors[i].description,
      id: kit.data.sensors[i].id,
      class: "chart",
      width: canvasWidth,
      height: canvasHeight,
      series: [
        {},
        {
          spanGaps: true,
          label: sensor.sensor_key,
          width: 1,
          stroke: "rgba(0, 0, 0, 1",
          fill: "rgba(0, 0, 0, 0.2)",
          width: 1,
        },
      ]
    };
    let uplot = new uPlot(opts, data, document.getElementById(kit.data.sensors[i].id));
  }
  loading(false);
}

// Get URL parameters
function urlParameters() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  params.has("id") === true ? (id = params.get("id")) : (id = null);
  params.has("tag") === true ? (tag = params.get("tag")) : (tag = null);
  params.has("city") === true ? (city = params.get("city")) : (city = null);
  params.has("user") === true ? (user = params.get("user")) : (user = null);
  /*console.log(settings.filter.type);
  if (settings.filter.type) {
    let type = settings.filter.type;
    if (type === "tag") {

    } else if (type === "user") {

    } else if (type === "city") {

    } else {
      tag = null;
      user = null;
      city = null;
    }
  }*/
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
  if (parameter != null) {
    params.set(parameter, value);
  }
  let new_url = url.toString();
  history.pushState({}, null, new_url);
}

function loading(status) {
  status ? document.body.classList.add("isLoading") : document.body.classList.remove("isLoading");
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

// Interface elements
function interface() {
  // reset
  document.getElementById("reset").onclick = function () {
    urlAddParameter(null);
    dashboardInit();
  };
}