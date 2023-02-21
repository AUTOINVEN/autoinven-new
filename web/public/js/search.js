let map;
let warehouses = 3;
let markers = {};
let i = 0;
let today = new Date();
let locale;
let center;
let infowindow;
let infowindowContent;
let lists;
let initial_lists;
let list_last_index = 0;
let search_type = 1;
let more_type = 1; // 1: 검색 X, 2: 검색했을 때
today.setHours(0, 0, 0, 0);

$('#searchBtn').click(() => {
  document.querySelector('#pac-input').focus();
  document.querySelector('#pac-input').dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 13,
    })
  );
});

const setWarehouses = (_warehouses, _locale) => {
  warehouses = _warehouses;
  locale = _locale;
};

const searchResultListing = (
  lists,
  searchType,
  startDate,
  endDate,
  leaseArea
) => {
  let l;
  for (l = list_last_index; l < list_last_index + 10; l++) {
    if (l >= lists.length) {
      break;
    }
    let index = lists[l].marker.index;
    let name;
    let address;
    let addressDetail;
    let dedicated_area;
    let type;
    let price;
    let detail;
    let warehouseImage;
    if (warehouses[index].WarehouseImages.length !== 0) {
      warehouseImage = warehouses[index].WarehouseImages[0].url;
    } else {
      warehouseImage = '/image/default-image_43.png';
    }
    if (locale === 'ko') {
      name = warehouses[index].name_ko;
      address = warehouses[index].address1_ko;
      addressDetail = warehouses[index].address2_ko;
      dedicated_area = warehouses[index].dedicated_area + ' m<sup>2</sup>';
      price = `&#8361;${warehouses[index].rent} m<sup>2</sup>/일`;
      detail = '자세히 보기';
      if (warehouses[index].is_verified) {
        type = '인증';
      } else {
        type = '미인증';
      }
    } else if (locale === 'en') {
      name = warehouses[index].name_en;
      address = warehouses[index].address1_en;
      addressDetail = warehouses[index].address2_en;
      dedicated_area = warehouses[index].dedicated_area + ' m<sup>2</sup>';
      price = `$${warehouses[index].rent} m<sup>2</sup>/day`;
      detail = 'more detail';
      if (warehouses[index].is_verified) {
        type = 'verified';
      } else {
        type = 'not verified';
      }
    }
    // 지도만 검색
    if (searchType === 1) {
      if (warehouses[index].is_verified) {
        $('.marker_list_items').append(
          ` 
            <div class="flex sm:flex !p-5 bg-[#fff] hover:bg-slate-100 rounded-xl shadow" id="marker${warehouses[index].warehouse_id}">
              <img class="w-40 h-30 sm:w-60 sm:h-48 rounded" src="${warehouseImage}" onerror="this.src='/image/default-image.png'" >
              <div class="pl-3 pt-2 pb-2 w-full text-left flex flex-col sm:flex sm:flex-col justify-between">
                <div class="frow">
                    <div class="text-lg font-bold sm:text-xl">${name}</div>
                    <div class="rounded w-12 h-6 text-sm p-0.5 font-bold sm:text-base sm:w-16 sm:h-8 sm:p-1 text-center bg-sky-500 text-white">${type}</div>
                </div>
                <div class="text-sm sm:text-lg">${address}<br>${addressDetail}</div>
                <div class="frow">
                    <div class="text-sm font-extrabold sm:text-lg">${price}</div>
                    <div class="text-sm font-bold sm:text-lg ">${lists[l].distance}km</div>
                </div>
                <div class="flex w-full flex-row-reverse">
                <a href="/warehouse/${warehouses[index].warehouse_id}" class="text-base font-bold text-purple-600 sm:text-lg">${detail}</a>
                </div>
              </div>
            </div>
          `
        );
      } else {
        $('.marker_list_items').append(
          ` 
            <div class="flex sm:flex !p-5 bg-[#fff] hover:bg-slate-100 rounded-xl shadow" id="marker${warehouses[index].warehouse_id}">
              <img class="w-40 h-30 sm:w-60 sm:h-48 rounded" src="${warehouseImage}" onerror="this.src='/image/default-image.png'" >
              <div class="pl-3 pt-2 pb-2 flex-1 text-left flex flex-col sm:flex sm:flex-col justify-between">
                <div class="frow">
                    <div class="text-lg font-bold sm:text-xl">${name}</div>
                    <div class="rounded w-12 h-6 text-sm p-0.5 font-bold sm:text-base sm:w-16 sm:h-8 sm:p-1 text-center bg-slate-400 text-white">${type}</div>
                </div>
                <div class="text-sm sm:text-lg">${address}<br></div>
                <div class="frow">
                    <div class="text-sm font-bold sm:text-lg ">${lists[l].distance}km</div>
                </div>
                <div class="flex w-full flex-row-reverse">
                <a href="/warehouse/${warehouses[index].warehouse_id}" class="text-base font-bold text-purple-600 sm:text-lg">${detail}</a>
                </div>
              </div>
            </div>
          `
        );
      }
    }
    // 사용가능 공간 포함 검색
    else {
      let available_area = lists[l].available_area;
      if (locale === 'ko') {
        available_area = `대여가능 면적: ${lists[l].available_area} m<sup>2</sup>`;
      } else if (locale === 'en') {
        available_area = `
        Usable area: ${lists[l].available_area} m<sup>2</sup>`;
      }
      $('.marker_list_items').append(
        ` 
          <div class="flex sm:flex !p-5 bg-[#fff] hover:bg-slate-100 rounded-xl shadow" id="marker${warehouses[index].warehouse_id}">
            <img class="w-40 h-30 sm:w-60 sm:h-48 rounded" src="${warehouseImage}" onerror="this.src='/image/default-image.png'" >
            <div class="pl-3 pt-2 pb-2 flex-1 text-left flex flex-col sm:flex sm:flex-col justify-between">
              <div class="frow">
                  <div class="text-lg font-bold sm:text-xl">${name}</div>
                  <div class="rounded w-12 h-6 text-sm p-0.5 font-bold sm:text-base sm:w-16 sm:h-8 sm:p-1 text-center bg-sky-500 text-white">${type}</div>
              </div>
              <div class="text-sm sm:text-lg">${address}<br>${addressDetail}</div>
              <div class="frow">
                  <div class="text-sm font-extrabold sm:text-lg">${price}</div>
                  <div class="text-sm font-bold sm:text-lg">${lists[l].distance}km</div>
              </div>
              <div class="flex w-full flex-row-reverse justify-between">
                <a href="/warehouse/${warehouses[index].warehouse_id}?start_date=${startDate}&end_date=${endDate}&selected_area=${leaseArea}&available_area=${lists[l].available_area}" class="text-base font-bold text-right text-purple-600 sm:text-lg">${detail}</a>
                <div class="text-sm font-bold sm:text-lg text-blue-600">${available_area}</div>
                </div>
            </div>
          </div>
        `
      );
    }

    let id = `#marker${warehouses[index].warehouse_id}`;
    const m = lists[l].marker;
    $(id).click(function () {
      google.maps.event.trigger(m, 'click');
    });
  }
  list_last_index = l;
};

const listing = (lists) => {
  let l;
  for (l = list_last_index; l < list_last_index + 10; l++) {
    if (l >= lists.length) {
      break;
    }
    let index = lists[l].index;
    let name;
    let address;
    let addressDetail;
    let dedicated_area;
    let type;
    let price;
    let detail;
    let warehouseImage;
    if (warehouses[index].WarehouseImages.length !== 0) {
      warehouseImage = warehouses[index].WarehouseImages[0].url;
    } else {
      warehouseImage = '/image/default-image_43.png';
    }
    if (locale === 'ko') {
      name = warehouses[index].name_ko;
      address = warehouses[index].address1_ko;
      addressDetail = warehouses[index].address2_ko;
      dedicated_area = warehouses[index].dedicated_area + ' m<sup>2</sup>';
      price = `&#8361;${warehouses[index].rent} m<sup>2</sup>/일`;
      detail = '자세히 보기';
      if (warehouses[index].is_verified) {
        type = '인증';
      } else {
        type = '미인증';
      }
    } else if (locale === 'en') {
      name = warehouses[index].name_en;
      address = warehouses[index].address1_en;
      addressDetail = warehouses[index].address2_en;
      dedicated_area = warehouses[index].dedicated_area + ' m<sup>2</sup>';
      price = `$${warehouses[index].rent} m<sup>2</sup>/day`;
      detail = 'more detail';
      if (warehouses[index].is_verified) {
        type = 'verified';
      } else {
        type = 'not verified';
      }
    }
    if (warehouses[index].is_verified) {
      $('.marker_list_items').append(
        ` 
          <div class="flex sm:flex !p-5 bg-[#fff] hover:bg-slate-100 rounded-xl shadow" id="marker${warehouses[index].warehouse_id}">
            <img class="w-40 h-30 sm:w-60 sm:h-48 rounded" src="${warehouseImage}" onerror="this.src='/image/default-image.png'" >
            <div class="pl-3 pt-2 pb-2 flex-1 text-left flex flex-col sm:flex sm:flex-col justify-between">
              <div class="frow">
                  <div class="text-lg font-bold sm:text-xl">${name}</div>
                  <div class="rounded w-12 h-6 text-sm p-0.5 font-bold sm:text-base sm:w-16 sm:h-8 sm:p-1 text-center bg-sky-500 text-white">${type}</div>
              </div>
              <div class="text-sm sm:text-lg">${address}<br>${addressDetail}</div>
              <div class="frow">
                  <div class="text-sm font-extrabold sm:text-lg">${price}</div>
              </div>
              <div class="flex w-full flex-row-reverse">
                <a href="/warehouse/${warehouses[index].warehouse_id}" class="text-base font-bold text-purple-600 sm:text-lg">${detail}</a>
              </div>
            </div>
          </div>
          `
      );
    } else {
      $('.marker_list_items').append(
        ` 
          <div class="flex sm:flex !p-5 bg-[#fff] hover:bg-slate-100 rounded-xl shadow" id="marker${warehouses[index].warehouse_id}">
            <img class="w-40 h-30 sm:w-60 sm:h-48 rounded" src="${warehouseImage}" onerror="this.src='/image/default-image.png'" >
            <div class="pl-3 pt-2 pb-2 flex-1 text-left flex flex-col sm:flex sm:flex-col justify-between">
              <div class="frow">
                  <div class="text-lg font-bold sm:text-xl">${name}</div>
                  <div class="rounded w-12 h-6 text-sm p-0.5 font-bold sm:text-base sm:w-16 sm:h-8 sm:p-1 text-center bg-slate-400 text-white">${type}</div>
              </div>
              <div class="text-sm sm:text-lg">${address}<br></div>
              <div class="flex w-full flex-row-reverse">
                <a href="/warehouse/${warehouses[index].warehouse_id}" class="text-base font-bold text-purple-600 sm:text-lg">${detail}</a>
              </div>
            </div>
          </div>
          `
      );
    }
    let id = `#marker${warehouses[index].warehouse_id}`;
    const m = lists[l];
    $(id).click(function () {
      google.maps.event.trigger(m, 'click');
    });
  }
  list_last_index = l;
};

async function initMap() {
  $('.marker_list_items').text('');
  center = { lat: 35.95, lng: 128.25 };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: center,
    mapTypeContorl: false,
  });
  const myIcon = new google.maps.MarkerImage('/image/warehouse_pin.png');
  const notAvailableIcon = new google.maps.MarkerImage(
    '/image/warehouse_pin_not_available.png'
  );
  lists = [];
  initial_lists = [];
  let markers_for_clustering = [];
  for (index in warehouses) {
    const mk = new google.maps.Marker({
      position: {
        lat: warehouses[index].Address.latitude,
        lng: warehouses[index].Address.longitude,
      },
      map,
      icon: notAvailableIcon,
      title: warehouses[index].name_ko,
    });
    markers_for_clustering.push(mk);
    markers[warehouses[index].warehouse_id] = mk;

    markers[warehouses[index].warehouse_id].index = index;
    let name;
    let address;
    if (locale === 'ko') {
      name = warehouses[index].name_ko;
      if (warehouses[index].address2_ko) {
        address = warehouses[index].address1_ko + warehouses[index].address2_ko;
      } else {
        address = warehouses[index].address1_ko;
      }
    } else if (locale == 'en') {
      name = warehouses[index].name_en;
      if (warehouses[index].address2_ko) {
        address = warehouses[index].address1_en + warehouses[index].address2_en;
      } else {
        address = warehouses[index].address1_en;
      }
    }
    const m = markers[warehouses[index].warehouse_id];
    const wid = warehouses[index].warehouse_id;
    markers[warehouses[index].warehouse_id].addListener('click', () => {
      infowindowContent.style.display = 'block';
      infowindowContent.children['place-name'].textContent = name;
      infowindowContent.children['place-address'].textContent = address;
      map.setZoom(16);
      infowindow.open(map, m);
      clickedMarker = document.querySelector(`#marker${wid}`);
      if (!clickedMarker) {
        lists = [];
        $('.marker_list_items').text('');
        for (const marker in markers) {
          const d = calcDistance(
            new google.maps.LatLng(markers[marker].position),
            new google.maps.LatLng(mk.position)
          );
          lists.push({ marker: markers[marker], distance: parseFloat(d) });
        }
        lists.sort(function (a, b) {
          if (a.distance > b.distance) return 1;
          if (a.distance === b.distance) return 0;
          if (a.distance < b.distance) return -1;
        });
        search_type = 1;
        more_type = 2;
        list_last_index = 0;
        searchResultListing(lists, search_type);
        clickedMarker = document.querySelector(`#marker${wid}`);
      }
      clickedMarker.focus();
      clickedMarker.scrollIntoView();
      clickedMarker.classList.add('bg-slate-100');
      map.setCenter(m.position);
      setTimeout(() => {
        clickedMarker.classList.remove('bg-slate-100');
      }, 500);
    });
    initial_lists.push(markers[warehouses[index].warehouse_id]);
  }

  mcOptions = {
    maxZoom: 15,
    minimumClusterSize: 1,
    imagePath: '/image/map/m',
  };

  const markerCluster = new MarkerClusterer(
    map,
    markers_for_clustering,
    mcOptions
  );

  const styles = markerCluster.getStyles();
  for (let i = 0; i < styles.length; i++) {
    styles[i].textColor = 'white';
  }

  // 줌 이벤트 발생시 센터에서 가까운곳 리스팅
  google.maps.event.addListener(map, 'zoom_changed', () => {
    lists = [];
    $('.marker_list_items').text('');
    for (const marker in markers) {
      const d = calcDistance(
        new google.maps.LatLng(markers[marker].position),
        new google.maps.LatLng(map.getCenter())
      );
      lists.push({ marker: markers[marker], distance: parseFloat(d) });
    }
    lists.sort(function (a, b) {
      if (a.distance > b.distance) return 1;
      if (a.distance === b.distance) return 0;
      if (a.distance < b.distance) return -1;
    });
    search_type = 1;
    more_type = 2;
    list_last_index = 0;
    searchResultListing(lists, search_type);
  });

  // 초기 리스팅
  initial_lists.sort(function (a, b) {
    const aindex = a.index;
    const bindex = b.index;
    if (warehouses[aindex].is_verified) {
      return -1;
    }
    if (warehouses[bindex].is_verified) {
      return 1;
    }
  });
  listing(initial_lists);

  const card = document.getElementById('pac-card');
  const input = document.getElementById('pac-input');


  map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);
  //const autocomplete = new google.maps.places.Autocomplete(input, options);


  const searchBox = new google.maps.places.SearchBox(input);



  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  //autocomplete.bindTo("bounds", map);
  map.addListener('bounds_changed', () => {
    searchBox.setBounds(map.getBounds());
  });
  infowindow = new google.maps.InfoWindow();
  infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);

  // 검색 결과를 표시할 마커
  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  // 검색 엔터 쳤을 때
  searchBox.addListener('places_changed', async () => {
    $('.marker_list_items').text('');
    more_type = 2;
    list_last_index = 0;
    const startDate = $('#startDate')[0].value;
    const endDate = $('#endDate')[0].value;
    let whType = [$('#whType option:selected').val()];
    let leaseArea = $('#leaseArea')[0].value;
    // 시작, 종료일 면적 모두 입력하거나 입력하지 않은 경우
    if (
      (startDate === '' && endDate === '' && leaseArea === '') ||
      (startDate !== '' && endDate !== '' && leaseArea !== '')
    ) {
      // 검색한 위치로 이동하는 작업
      const places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }
      const place = places[0]; // 검색 후보 중 가장 첫번째 것을 가져옴
      input.value = place.name;
      // 지도 이동
      if (!place.geometry || !place.geometry.location) {
        console.log('Returned place contains no geometry');
        return;
      }
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
      marker.setPosition(place.geometry.location);
      marker.setVisible(false);
      map.setZoom(15);
      infowindowContent.style.display = 'block';
      infowindowContent.children['place-name'].textContent = place.name;
      infowindowContent.children['place-address'].textContent =
        place.formatted_address;
      infowindow.open(map, marker);

      lists = [];
      if (startDate === '' && endDate === '' && leaseArea === '') {
        // 그냥 검색한 곳에서 가까운대로 리스팅
        $('.marker_list_items').text('');
        for (m in markers) {
          const d = calcDistance(
            new google.maps.LatLng(markers[m].position),
            new google.maps.LatLng(marker.position)
          );
          lists.push({ marker: markers[m], distance: parseFloat(d) });
        }
        lists.sort(function (a, b) {
          if (a.distance > b.distance) return 1;
          if (a.distance === b.distance) return 0;
          if (a.distance < b.distance) return -1;
        });
        search_type = 1;
        list_last_index = 0;
        searchResultListing(lists, search_type);
      } else {
        // 검색해서 주위 이용가능 한 창고만 리스팅
        // 입력 안했을 경우, 서버에서 인식 가능하도로 null로 변경
        if (whType[0] == '창고종류') {
          whType = null;
        }
        if (leaseArea == '') {
          leaseArea = null;
        }
        const searchResult = await $.get('api/warehouse/search', {
          startDate,
          endDate,
          type: whType,
          area: leaseArea,
          // 전송할 데이터
        });

        for (index in searchResult) {
          markers[searchResult[index].warehouse_id].setIcon(myIcon);
          const d = calcDistance(
            new google.maps.LatLng(
              markers[searchResult[index].warehouse_id].position
            ),
            new google.maps.LatLng(marker.position)
          );
          lists.push({
            marker: markers[searchResult[index].warehouse_id],
            distance: d,
            available_area: searchResult[index].available_area,
          });
        }
        lists.sort(function (a, b) {
          if (a.distance > b.distance) return 1;
          if (a.distance === b.distance) return 0;
          if (a.distance < b.distance) return -1;
        });
        search_type = 2;
        list_last_index = 0;
        searchResultListing(lists, search_type, startDate, endDate, leaseArea);
      }
    } else {
      // 시작일, 종료일, 면적 중 1개 또는 2개 빼먹은 경우
      // 경고창만 뜨게
      alert(
        '사용 가능한 면적 계산을 위해 시작일, 종료일, 면적 모두 입력해주세요'
      );
    }

    let data = {};
  });

  
}

function calcDistance(p1, p2) {
  var d = (
    google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000
  ).toFixed(2);
  return d;
}
