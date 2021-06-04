// Global variable
let indexBuilt = false;
let htmlIndex;

// Load
window.onload = function () {
  dashboardInit();
};

// Init
function dashboardInit() {
  loading(true);
  getKits();
}

// Get Kits
function getKits(filterType = null, filterValue = null) {
  const cacheName = "dashboardCache";
  const kitsUrl = "https://api.smartcitizen.me/v0/devices/world_map";
  // Add to cache
  caches.open(cacheName).then(cache => {
    cache.add(kitsUrl).then(() => {
      console.log("Kits data cached");
    });
  });
  // Retrieve from cache
  caches.open(cacheName).then((cache) => {
    cache
      .match(kitsUrl)
      .then((response) => {
        if (response.status == 429) alertUpdate(id, "tooManyRequests");
        return response.json();
      })
      .then((kits) => {
        displayKits(kits, filterType, filterValue);
      });
  });
}

// Display Kits (index)
function displayKits(kits, filterType = null, filterValue = null) {
  document.getElementById("main").innerHTML = "";
  if (!indexBuilt) {
    filterOrderKits(kits, filterType, filterValue);
    indexInterface(kits, filterType, filterValue);
    displayIndexList(kits, filterType, filterValue);
  } else {

  }
  loading(false);
}

// Filtering and Ordering Kits
function filterOrderKits(kits, filterType = null, filterValue = null) {
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
    let dateDifferenceMinutes =
      (dateNow.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
    dateDifferenceMinutes < 1 ? kitsActive.push(kit) : kitsInactive.push(kit);
  }
}

function indexInterface(kits, filterType = null, filterValue = null) {
  // Title
  const elemTitle = document.createElement("h1");
  let titleComplement;
  elemTitle.id = "title";
  filterType ? (titleComplement = ": " + filterValue) : (titleComplement = "");
  elemTitle.innerHTML = settings.title + titleComplement;
  console.log(elemTitle);
  // Subtitle
  const elemSubtitle = document.createElement("h2");
  // Search
  const searchInput = document.createElement("input");
  elemTitle.id = "title";
}

function displayIndexList(kits, filterType = null, filterValue = null) {

}


// Loading
function loading(status) {
  status ? document.body.classList.add("isLoading") : document.body.classList.remove("isLoading");
}
