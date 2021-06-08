// Display kits (index)
function displayKits(kits, filterType = null, filterValue = null) {
  // Empty main
  document.getElementById("main").innerHTML = "";
  // Filter kits
  let kitsFiltered = [];
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
  elemSubtitle.innerHTML = `${kits.length} active kits today, of a total of ${kitsFiltered.length}`;
  document.getElementById("main").appendChild(elemSubtitle);
  // Display section
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
  // Sort kits by date
  kitsFiltered.sort(function(a,b){
    return new Date(b.last_reading_at) - new Date(a.last_reading_at);
  });
  // Build list element
  let dateNow = new Date();
  let listHtml;
  for (let kit of kitsFiltered) {
    let lastUpdate = new Date(kit.last_reading_at);
    let dateDifferenceMinutes = (dateNow.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
    dateDifferenceMinutes < 1 ? kit.isActive = true : kit.isActive = false;
    const elem = document.createElement("li");
    let activeClass;
    kit.isActive ? activeClass = "active" : activeClass = "inactive";
    elem.classList.add(activeClass);
    elem.id = kit.id;
    elemList.appendChild(elem);
    for (let i = 0; i < settings.indexView.length; i++) {
      displayIndexElement(settings.indexView[i], elem);
    }
    function displayIndexElement(elemSettings, elemHtml) {
      switch (elemSettings) {
        case "name":
          const elemName = document.createElement("h2");
          elemName.innerHTML = kit.name;
          elemName.classList.add("name");
          elemName.onclick = function () {
            urlAddParameter("id", kit.id);
            dashboardInit();
          };
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
            elemHtml.appendChild(elemCity);
            elemCity.onclick = function () {
              urlAddParameter("city", kit.city);
              dashboardInit();
            };
          }
        break;
        case "user":
          if (kit.owner_username) {
            const elemUser = document.createElement("h4");
            elemUser.innerHTML = "👤 " + kit.owner_username;
            elemUser.classList.add("user");
            elemHtml.appendChild(elemUser);
            elemUser.onclick = function () {
              urlAddParameter("user", kit.owner_username);
              dashboardInit();
            };
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
              elemTag.onclick = function () {
                urlAddParameter("tag", kit.user_tags[j]);
                dashboardInit();
              };
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
          console.log("yoyo");
        break;
      }
    }
  }
  // Search init
  const kitsList = new List('kitsList', { 
    valueNames: ['name', 'city', 'tag', 'update']
  });
  // reset
  document.getElementById("reset").innerText = "Reset filter";
  // classes
  document.body.classList.remove("detail");
  document.body.classList.add("index");
  loading(false);
}

