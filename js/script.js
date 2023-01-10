const usd = document.getElementById('USD-rate');
const eur = document.getElementById('EUR-rate');
const currentDate = document.getElementById('current-date');

const API_URL = 'https://api.exchangerate.host/latest?base=UAH&symbols=USD,EUR';

const getAPI = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  const rates = Object.values(data.rates).map((rate) =>
    (1 / Number(rate)).toFixed(2)
  );
  eur.innerHTML = `1 EUR = ${rates[0]} UAH`;
  usd.innerHTML = `1 USD = ${rates[1]} UAH`;
  currentDate.innerHTML = `Current rate for ${data.date}:`;
};

getAPI(API_URL);
