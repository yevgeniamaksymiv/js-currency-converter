const usd = document.getElementById('USD-rate');
const eur = document.getElementById('EUR-rate');
const currentDate = document.getElementById('current-date');
const select1 = document.getElementById('select-1');
const select2 = document.getElementById('select-2');
const input = document.getElementById('input');
const btnConvert = document.getElementById('btn-convert');
const resultList = document.getElementById('result-list');
const btnHistory = document.getElementById('btn-history');
const clearHistory = document.getElementById('clear-history');
const errorMessHistory = document.getElementById('error-history');
const errorMessInput = document.getElementById('error-input');

const date = new Date().toLocaleDateString();
currentDate.innerHTML = `Current rate for ${date}:`;

const axiosInstance = axios.create({
  baseURL: 'https://api.exchangerate.host',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getDailyRate = async () => {
  try {
    const response = await axiosInstance.get('/latest', {
      base: 'UAH',
      symbols: 'USD, EUR',
    });
    const rates = Object.values(response.data.rates).map((rate) =>
      (1 / Number(rate)).toFixed(2)
    );
    eur.innerHTML = `1 EUR = ${rates[0]} UAH`;
    usd.innerHTML = `1 USD = ${rates[1]} UAH`;
  } catch (error) {
    console.error(error);
  }
};

const getAllCurrencies = async (parentTag) => {
  try {
    const response = await axiosInstance.get('/latest');
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

window.onload = () => {
  getDailyRate();
  getAllCurrencies(select1);
  getAllCurrencies(select2);
};

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

const createListItem = (id) => {
  const li = document.createElement('li');
  li.id = id;
  li.innerHTML = localStorage.getItem(`${id}`);

  const btnDeleteItem = document.createElement('button');
  btnDeleteItem.style.backgroundColor = '#121212';
  btnDeleteItem.style.border = 'none';
  btnDeleteItem.id = li.id;

  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.classList.add('icon-delete');
  icon.appendChild(document.createTextNode('cancel'));
  btnDeleteItem.appendChild(icon);
  li.appendChild(btnDeleteItem);
  resultList.appendChild(li);

  btnDeleteItem.onclick = () => {
    li.innerHTML = '';
    localStorage.removeItem(`${id}`);
    if (Object.keys(localStorage).length === 0) {
      btnClearHistory.remove();
    }
  };
};

const addItemToList = (amount, currency1, currency2, result) => {
  const uniqueId = Math.random().toString(16).slice(2);
  const liContent = `${amount} ${currency1} = ${result} ${currency2}`;
  localStorage.setItem(`${uniqueId}`, `${liContent}`);
  createListItem(uniqueId);
};

btnConvert.onclick = () => {
  if (input.value < 0) {
    errorMessInput.innerHTML =
      'That is not a valid input, enter a number greater than zero';
    setTimeout(() => (errorMessInput.innerHTML = ''), 4000);
    return;
  }
  if (rateFrom && rateTo) {
    const convertResult = ((rateTo / rateFrom) * input.value).toFixed(4);

    addItemToList(input.value, currencyFrom, currencyTo, convertResult);
    input.value = '';
  }
};

const btnClearHistory = document.createElement('button');

btnHistory.onclick = () => {
  if (Object.keys(localStorage).length === 0) {
    errorMessHistory.innerHTML = 'The history of currency conversion is empty';
    setTimeout(() => (errorMessHistory.innerHTML = ''), 4000);
    return;
  }

  resultList.innerHTML = '';
  Object.keys(localStorage).forEach((id) => createListItem(id));
  clearHistory.appendChild(btnClearHistory);
  btnClearHistory.innerHTML = 'Clear history';
  btnClearHistory.className = 'btn btn-danger';
};

btnClearHistory.onclick = () => {
  localStorage.clear();
  resultList.innerHTML = '';
  btnClearHistory.remove();
};
