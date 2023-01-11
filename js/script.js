const usd = document.getElementById('USD-rate');
const eur = document.getElementById('EUR-rate');
const currentDate = document.getElementById('current-date');
const select1 = document.getElementById('select-1');
const select2 = document.getElementById('select-2');
const input = document.getElementById('input');
const btnConvert = document.getElementById('btn-convert');
const resultList = document.getElementById('result-list');

const date = new Date().toLocaleDateString();
currentDate.innerHTML = `Current rate for ${date}:`;

const API_URL = 'https://api.exchangerate.host/latest';
const API_URL_BASE =
  'https://api.exchangerate.host/latest?base=UAH&symbols=USD,EUR';

const getDailyRate = async (url) => {
  try {
    const response = await axios.get(url);
    const rates = Object.values(response.data.rates).map((rate) =>
      (1 / Number(rate)).toFixed(2)
    );
    eur.innerHTML = `1 EUR = ${rates[0]} UAH`;
    usd.innerHTML = `1 USD = ${rates[1]} UAH`;
  } catch (error) {
    console.error(error);
  }
};

getDailyRate(API_URL_BASE);

const getAllCurrencies = async (url, parentTag) => {
  try {
    const response = await axios.get(url);
    const rates = Object.entries(response.data.rates);

    rates.forEach((rate) => {
      const option = document.createElement('option');
      option.appendChild(document.createTextNode(`${rate[0]}`));
      option.value = rate[1];
      parentTag.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
};

getAllCurrencies(API_URL, select1);
getAllCurrencies(API_URL, select2);

let rateFrom;
let rateTo;
let currencyFrom;
let currencyTo;

select1.onchange = () => {
  rateFrom = select1.value;
  currencyFrom = select1.options[select1.selectedIndex].text;
};

select2.onchange = () => {
  rateTo = select2.value;
  currencyTo = select2.options[select2.selectedIndex].text;
};

btnConvert.onclick = () => {
  if (rateFrom && rateTo) {
    const result = ((rateTo / rateFrom) * input.value).toFixed(4);
    const li = document.createElement('li');
    li.innerHTML = `${input.value} ${currencyFrom} = ${result} ${currencyTo}`;
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.style.color = 'red';
    icon.style.position = 'relative';
    icon.style.top = '6px';
    icon.style.marginLeft = '10px';
    icon.appendChild(document.createTextNode('cancel'));
    li.appendChild(icon);
    resultList.appendChild(li);
    input.value = '';
  }
};
