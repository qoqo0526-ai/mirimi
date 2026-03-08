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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  calculate();
});

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
