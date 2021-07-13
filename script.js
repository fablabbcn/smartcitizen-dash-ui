let id, tag;

// Load
window.onload = function () {
  dashboardInit();
};

// Init
function dashboardInit() {
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

// Websockets update
// const socket = io.connect("wss://ws.smartcitizen.me", {reconnect: true});
// socket.on("data-received", () => {
//   console.log(socket.json.io);
// });

// API get kits
function getKits(filterType = null, filterValue = null) {
  const cacheName = "dashboardCache";
  const kitsUrl = "https://api.smartcitizen.me/v0/devices/world_map";
  // Add to cache
  caches.open(cacheName).then(cache => {
    cache.add(kitsUrl).then(() => {});
  });
  // Retrieve from cache
  caches.open(cacheName).then(cache => {
    cache.match(kitsUrl)
    .then((response) => {
      if (response.status == 429) alertUpdate(id, "tooManyRequests");
      return response.json();
    })
    .then((kits) => {
      displayKits(kits, filterType, filterValue);
    });
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
    const sensorUrl = `https://api.smartcitizen.me/v0/devices/${kit.id}/readings?sensor_id=${kit.data.sensors[i].id}&rollup=${settings.rollup}&from=${then}&to=${today}`;
    https: fetch(sensorUrl)
    .then((res) => {
      return res.json();
    })
    .then((sensor) => {
      displaySensor(kit, sensor, i);
    });
  }
}

// API get sensor data
function getLatestReadings(kitId, sensorId) {
  const kitUrl = `https://api.smartcitizen.me/v0/devices/${kitId}`;
  let kitContent;
  https: fetch(kitUrl)
  .then((res) => {
    if (res.status == 429) alertUpdate(id, "tooManyRequests");
    return res.json();
  })
  .then((kit) => {
    primarySensor(kit);
  });
}


const alreadySeenIndex = {};
let isFirstLoad = true;
let kitsActiveTotal = 0;
// Display kits (index)
function displayKits(kits, filterType = null, filterValue = null) {
  // Empty main
  document.getElementById("main").innerHTML = "";
  // Check if already seen
  let filter = filterType + filterValue;
  const indexElem = document.createElement("article");
  if (filter in alreadySeenIndex) {
    // already seen
    indexHtml = alreadySeenIndex[filter];
  } else {
    // new request
    let {activeCounter, kitsFiltered} = filterKits();
    indexHtml =
      buildInterfaceElements(activeCounter, kitsFiltered).outerHTML +
      buildList(kitsFiltered).outerHTML;
    alreadySeenIndex[filter] = indexHtml;
  }
  // reset button
  document.getElementById("reset").innerText = "Reset filter";
  // classes
  document.body.classList.remove("detail");
  document.body.classList.add("index");
  // Update html
  document.getElementById("main").innerHTML = indexHtml;
  // Search init
  const kitsList = new List('kitsList', { 
    valueNames: ['name', 'city', 'tag', 'update']
  });
  // Build interactions
  buildInteractions()
  loading(false);
  
  // Build list
  function buildList(kitsFiltered) {
    // Wrapper
    const elemWrapper = document.createElement("section");
    elemWrapper.id = "kitsList";
    // Display search
    if (settings.filter.search) {
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.placeholder = "filter";
      searchInput.classList.add("fuzzy-search");
      searchInput.id = "searchInput";
      elemWrapper.appendChild(searchInput);
    }
    const listHtml = document.createElement("ul");
    listHtml.classList.add('list');
    for (let kit of kitsFiltered) {
      const elem = document.createElement("li");
      // Element attributes
      elem.id = kit.id;
      elem.classList.add(kit.isActive ? "active" : "inactive");
      // Add sub elements according to settings
      for (let i = 0; i < settings.indexView.length; i++) {
        displayIndexElement(settings.indexView[i], elem);
      }
      function displayIndexElement(elemSettings, elemHtml) {
        switch (elemSettings) {
          case "name":
            const elemName = document.createElement("h2");
            elemName.innerHTML = kit.name;
            elemName.classList.add("name");
            elemHtml.appendChild(elemName);
          break;
          case "id":
            const elemId = document.createElement("p");
            elemId.innerHTML = "id:" + kit.id;
            elemId.classList.add("id");
            elemHtml.appendChild(elemId);
          break;
          case "city":
            if (kit.city) {
              const elemCity = document.createElement("h4");
              elemCity.innerHTML = "📍 " + kit.city + " (" + kit.country_code + ")";
              elemCity.classList.add("city");
              const attr = document.createAttribute("city");
              attr.value = kit.city;
              elemCity.setAttributeNode(attr);
              elemHtml.appendChild(elemCity);
            }
          break;
          case "user":
            if (kit.owner_username) {
              const elemUser = document.createElement("h4");
              elemUser.innerHTML = "👤 " + kit.owner_username;
              elemUser.classList.add("user");
              const attr = document.createAttribute("user");
              attr.value = kit.owner_username;
              elemUser.setAttributeNode(attr);
              elemHtml.appendChild(elemUser);
            }
          break;
          case "tags":
            if (kit.user_tags.length > 0) {
              const elemTags = document.createElement("div");
              elemHtml.appendChild(elemTags);
              elemTags.classList.add("tags");
              for (let j = 0; j < kit.user_tags.length; j++) {
                const elemTag = document.createElement("span");
                elemTag.innerHTML = kit.user_tags[j];
                elemTag.classList.add('tag');
                const attr = document.createAttribute("tag");
                attr.value = kit.user_tags[j];
                elemTag.setAttributeNode(attr);
                elemTags.appendChild(elemTag);
              }
            }
          break;
          case "last_update":
            // update
            const elemUpdated = document.createElement("p");
            elemUpdated.classList.add("update");
            elemUpdated.innerHTML = "last update: " + new Date(kit.last_reading_at).toLocaleString("en-GB");
            elemHtml.appendChild(elemUpdated);
          break;
          default:
            console.log("This element does not exist");
          break;
        }
      }
      // Display primary sensor
      if (settings.primarySensor != undefined && settings.primarySensor.id && kit.isActive) {
        getLatestReadings(kit.id);
      }
      // Update html
      listHtml.appendChild(elem);
      elemWrapper.append(listHtml);
    }
    return elemWrapper; 
  }

  // Filter kits
  function filterKits() {
    let kitsFiltered = [];
    let activeCounter = 0;
    let dateNow = new Date();
    for (let kit of kits) {
      // Add 'is active' value
      let lastReading = new Date(kit.last_reading_at);
      let dateDifferenceMinutes = Math.abs(Math.round((dateNow.getTime() - lastReading.getTime()) / 1000 / 60));
      if (dateDifferenceMinutes < 30) {
        kit.isActive = true;
      } else {
        kit.isActive = false;
      }
      if (filterType != null) {
        if (filterType === "tag" && kit.user_tags.includes(filterValue)) {
          kitsFiltered.push(kit);
          if (kit.isActive) {activeCounter++;}
        } else if (filterType === "city" && kit.city === filterValue) {
          kitsFiltered.push(kit);
          if (kit.isActive) {activeCounter++;}
        } else if (filterType === "user" && kit.owner_username === filterValue) {
          kitsFiltered.push(kit);
          if (kit.isActive) {activeCounter++;}
        }
      } else {
        kitsFiltered.push(kit);
        if (kit.isActive) {activeCounter++;}
      }
    }
    // Sort kits by date
    kitsFiltered.sort(function(a,b){
      return new Date(b.last_reading_at) - new Date(a.last_reading_at);
    });
    return {activeCounter, kitsFiltered}
  }

  function buildInterfaceElements(KitsActive,kitsFiltered) {
    if (kitsFiltered === undefined) {
      kitsFiltered = kits;
    }
    let interfaceHeader = document.createElement("header");
    // Display title
    const elemTitle = document.createElement("h1");
    elemTitle.id = "title";
    let titleComplement;
    filterType ? titleComplement = ": " + filterValue : titleComplement = "";
    elemTitle.innerHTML = settings.title + titleComplement;
    interfaceHeader.appendChild(elemTitle);
    // Display subtitle
    const elemSubtitle = document.createElement("h2");
    elemSubtitle.id = "subtitle";
    elemSubtitle.innerHTML = `${KitsActive} active kits today, of a total of ${kitsFiltered.length}`;
    interfaceHeader.appendChild(elemSubtitle);
    // Return html
    return interfaceHeader;
  }

  function buildInteractions() {
    for (const item of document.querySelectorAll(".list li")) {
      const childs = item.childNodes;
      for (const child of childs) {
        if (child.classList.contains("name")) {
          child.onclick = function () {
            urlAddParameter("id", item.id);
            dashboardInit();
          }
        } else if (child.classList.contains("city")) {
          child.onclick = function () {
            attr = child.getAttribute("city");
            urlAddParameter("city", attr);
            dashboardInit();
          }
        } else if (child.classList.contains("user")) {
          child.onclick = function () {
            attr = child.getAttribute("user");
            urlAddParameter("user", attr);
            dashboardInit();
          }
        } else if (child.classList.contains("tags")) {
          tags = child.childNodes;
          for (const tag of tags) {
            tag.onclick = function () {
              attr = tag.getAttribute("tag");
              urlAddParameter("tag", attr);
              dashboardInit();
            }
          }
        }
      }
    }
  }
}

// Primary Sensor
function primarySensor(kit) {
  let sensorId = settings.primarySensor.id;
  let sensorValue, sensorUnit, sensorDesc;
  for (let key in kit.data.sensors) {
    if (kit.data.sensors[key].id === sensorId) {
      sensorValue = kit.data.sensors[key].value;
      sensorUnit = kit.data.sensors[key].unit;
      sensorDesc = kit.data.sensors[key].description;
      let elem = document.getElementById(kit.id);
      elem.innerHTML = `<h3 class="primarySensor">${sensorValue} ${sensorUnit} <span>${sensorDesc}</span></p>` + elem.innerHTML;
    }
  }
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
  document.body.classList.remove("index");
  document.body.classList.add("detail");
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
  if (isFirstLoad) {
    if ((settings.filter.type) && (settings.filter.value)) {
      settings.filter.type === "tag" ? (tag = settings.filter.value) : (tag = null);
      settings.filter.type === "city" ? (city = settings.filter.value) : (city = null);
      settings.filter.type === "user" ? (user = settings.filter.value) : (user = null);
    } else {
      urlNatural();
    }
    isFirstLoad = false;
  } else {
    urlNatural();
  }
  function urlNatural() {
    params.has("id") === true ? (id = params.get("id")) : (id = null);
    params.has("tag") === true ? (tag = params.get("tag")) : (tag = null);
    params.has("city") === true ? (city = params.get("city")) : (city = null);
    params.has("user") === true ? (user = params.get("user")) : (user = null);
  }
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
  if (!settings.filter.search) {
    document.body.classList.add("simple");
  }
  // Title
  document.title = settings.title;
  // reset
  document.getElementById("reset").onclick = function () {
    ((settings.filter.type) && (settings.filter.value)) ? urlAddParameter(settings.filter.type, settings.filter.value) : urlAddParameter(null);
    dashboardInit();
  };
  // logo
  if (! document.getElementById("logo")) {
    const logoImage = document.createElement("img");
    logoImage.src  = "assets/" + settings.logo;
    logoImage.id = "logo"
    document.body.prepend(logoImage);
  }
  document.getElementById("logo").onclick = function () {
    ((settings.filter.type) && (settings.filter.value)) ? urlAddParameter(settings.filter.type, settings.filter.value) : urlAddParameter(null);
    dashboardInit();
  };
}