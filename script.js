const form = document.getElementById('calculator-form');
const resultsEl = document.getElementById('results');
const cardA = document.getElementById('card-a');
const cardB = document.getElementById('card-b');
const roundTripAEl = document.getElementById('round-trip-a');
const roundTripBEl = document.getElementById('round-trip-b');
const fuelAEl = document.getElementById('fuel-a');
const fuelBEl = document.getElementById('fuel-b');
const totalAEl = document.getElementById('total-a');
const totalBEl = document.getElementById('total-b');
const cheaperOptionEl = document.getElementById('cheaper-option');
const savingsEl = document.getElementById('savings');
const badgeA = document.getElementById('badge-a');
const badgeB = document.getElementById('badge-b');
const resetButton = document.getElementById('reset-button');
const geoButton = document.getElementById('geo-button');
const locationInfoEl = document.getElementById('location-info');
let costChart = null;

const STORAGE_KEY = 'gas-station-comparison-inputs';

const inputFields = [
  { id: 'price-a', key: 'priceA' },
  { id: 'price-b', key: 'priceB' },
  { id: 'distance-a', key: 'distanceA' },
  { id: 'distance-b', key: 'distanceB' },
  { id: 'efficiency', key: 'efficiency' },
  { id: 'fuel-amount', key: 'fuelAmount' },
];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  calculate();
});

initPersistence();

if (resetButton) {
  resetButton.addEventListener('click', handleReset);
}

if (geoButton) {
  geoButton.addEventListener('click', handleGetLocation);
} else if (locationInfoEl && !('geolocation' in navigator)) {
  locationInfoEl.textContent = '이 브라우저에서는 위치 정보를 사용할 수 없습니다.';
}

function initPersistence() {
  loadInputs();

  inputFields.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', saveInputs);
  });
}

function saveInputs() {
  const data = {};
  inputFields.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;
    data[key] = el.value;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore storage errors
  }
}

function handleReset() {
  // Clear input values
  inputFields.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
  });

  // Clear stored data
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore storage errors
  }

  // Clear results & highlights
  resultsEl.classList.add('hidden');
  cardA.classList.remove('cheaper');
  cardB.classList.remove('cheaper');
  badgeA.textContent = '';
  badgeB.textContent = '';
  badgeA.classList.remove('cheaper-badge');
  badgeB.classList.remove('cheaper-badge');

  if (locationInfoEl) {
    locationInfoEl.textContent = '현재 위치를 가져오려면 버튼을 눌러주세요.';
  }
}

function loadInputs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    inputFields.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (data && Object.prototype.hasOwnProperty.call(data, key)) {
        el.value = data[key];
      }
    });
  } catch (e) {
    // ignore parse errors
  }
}

function calculate() {
  const priceA = parseFloat(document.getElementById('price-a').value) || 0;
  const priceB = parseFloat(document.getElementById('price-b').value) || 0;
  const distanceA = parseFloat(document.getElementById('distance-a').value) || 0;
  const distanceB = parseFloat(document.getElementById('distance-b').value) || 0;
  const efficiency = parseFloat(document.getElementById('efficiency').value) || 0;
  const fuelAmount = parseFloat(document.getElementById('fuel-amount').value) || 0;

  // Round-trip fuel consumption (liters)
  const roundTripFuelA = (distanceA * 2) / efficiency;
  const roundTripFuelB = (distanceB * 2) / efficiency;

  // Round-trip fuel cost (fuel burned × price at destination)
  const roundTripCostA = roundTripFuelA * priceA;
  const roundTripCostB = roundTripFuelB * priceB;

  // Fuel cost for filling up
  const fuelCostA = fuelAmount * priceA;
  const fuelCostB = fuelAmount * priceB;

  // Total cost = round-trip cost + fuel fill cost
  const totalCostA = roundTripCostA + fuelCostA;
  const totalCostB = roundTripCostB + fuelCostB;

  // Determine cheaper option and savings
  const cheaper = totalCostA <= totalCostB ? 'A' : 'B';
  const cheaperCost = Math.min(totalCostA, totalCostB);
  const costlierCost = Math.max(totalCostA, totalCostB);
  const savings = costlierCost - cheaperCost;

  // Display travel (round-trip) costs
  roundTripAEl.textContent = formatCurrency(roundTripCostA);
  roundTripBEl.textContent = formatCurrency(roundTripCostB);

  // Display fuel costs
  fuelAEl.textContent = formatCurrency(fuelCostA);
  fuelBEl.textContent = formatCurrency(fuelCostB);

  // Display total costs
  totalAEl.textContent = formatCurrency(totalCostA);
  totalBEl.textContent = formatCurrency(totalCostB);

  // Update chart
  updateChart(totalCostA, totalCostB);

  // Highlight cheaper card (only when one is actually cheaper)
  cardA.classList.remove('cheaper');
  cardB.classList.remove('cheaper');
  badgeA.textContent = '';
  badgeB.textContent = '';
  badgeA.classList.remove('cheaper-badge');
  badgeB.classList.remove('cheaper-badge');
  if (savings > 0) {
    if (cheaper === 'A') {
      cardA.classList.add('cheaper');
      badgeA.textContent = '더 저렴';
      badgeA.classList.add('cheaper-badge');
    } else {
      cardB.classList.add('cheaper');
      badgeB.textContent = '더 저렴';
      badgeB.classList.add('cheaper-badge');
    }
  }

  // Display cheaper option and savings
  if (savings === 0) {
    cheaperOptionEl.textContent = '비용 동일';
  } else {
    cheaperOptionEl.textContent = cheaper === 'A' ? 'A 주유소' : 'B 주유소';
  }
  savingsEl.textContent = formatCurrency(savings);

  resultsEl.classList.remove('hidden');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(Math.round(value)) + '₩';
}

function handleGetLocation() {
  if (!('geolocation' in navigator)) {
    if (locationInfoEl) {
      locationInfoEl.textContent = '이 브라우저에서는 위치 정보를 사용할 수 없습니다.';
    }
    return;
  }

  if (locationInfoEl) {
    locationInfoEl.textContent = '현재 위치를 가져오는 중입니다...';
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      if (locationInfoEl) {
        locationInfoEl.textContent = `현재 위치: 위도 ${latitude.toFixed(
          4
        )} / 경도 ${longitude.toFixed(4)}`;
      }
      updateStationDistancesFromLocation(latitude, longitude);
    },
    (error) => {
      if (!locationInfoEl) return;
      if (error.code === error.PERMISSION_DENIED) {
        locationInfoEl.textContent = '위치 권한이 필요합니다.';
      } else {
        locationInfoEl.textContent = '위치 정보를 가져오지 못했습니다.';
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

function updateStationDistancesFromLocation(latitude, longitude) {
  // TODO: 지도/거리 API 연동 시
  // 이 함수에서 현재 위치(latitude, longitude)를 기준으로
  // A, B 주유소까지의 거리를 계산해
  // distance-a, distance-b 입력칸을 자동으로 채워 주세요.
  //
  // 예시:
  // document.getElementById('distance-a').value = 계산된거리A;
  // document.getElementById('distance-b').value = 계산된거리B;
}

function updateChart(totalA, totalB) {
  const canvas = document.getElementById('cost-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const data = [totalA, totalB];

  if (!costChart) {
    costChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['A 주유소', 'B 주유소'],
        datasets: [
          {
            data,
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(148, 163, 184, 0.7)',
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(148, 163, 184, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '주유소 총 비용 비교',
            color: '#e7eaef',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#e7eaef',
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#94a3b8',
              callback: (value) =>
                new Intl.NumberFormat('ko-KR', {
                  style: 'decimal',
                  maximumFractionDigits: 0,
                }).format(value),
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.2)',
            },
          },
        },
      },
    });
  } else {
    costChart.data.datasets[0].data = data;
    costChart.update();
  }
}
