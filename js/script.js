const usd = document.getElementById('USD-rate');
const eur = document.getElementById('EUR-rate');
const dateInfo = document.getElementById('current-date');
const select1 = document.getElementById('select-1');
const select2 = document.getElementById('select-2');
const input = document.getElementById('input');
const date = document.getElementById('date');
const btnConvert = document.getElementById('btn-convert');
const resultList = document.getElementById('result-list');
const btnHistory = document.getElementById('btn-history');
const btnsHistory = document.getElementById('btns-history');
const errorMessHistory = document.getElementById('error-history');
const errorMessInput = document.getElementById('error-input');

// change dark/light mode

const themeIcon = document.getElementById('theme-icon');
themeIcon.src = '/assets/dark-mode.svg';
const theme = window.localStorage.getItem('theme');

if (theme === 'light') {
  document.body.classList.add('light');
  themeIcon.src = '/assets/light-mode.svg';
}

themeIcon.onclick = () => {
  document.body.classList.toggle('dark');
  if (theme === 'light') {
    localStorage.setItem('theme', 'dark');
  } else localStorage.setItem('theme', 'light');
  window.location.reload();
};

// display current date in the header

const dateCurr = new Date().toLocaleDateString();
dateInfo.innerHTML = `Current rate for ${dateCurr}:`;
date.value = dateCurr.split('.').reverse().join('-');
date.max = date.value;

// if date was changed get new data according search date

date.onchange = () => {
  if (dateCurr.split('.').reverse().join('-') !== date.value) {
    select1.length = 1;
    select2.length = 1;

    getAllCurrencies(select1, date.value);
    getAllCurrencies(select2, date.value);
  }
};

const axiosInstance = axios.create({
  baseURL: 'https://api.exchangerate.host',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// fetch today's data from api & display daily rate in the header

const getDailyRate = async () => {
  try {
    const response = await axiosInstance.get('/latest', {
      params: {
        base: 'UAH',
        symbols: 'USD,EUR',
      },
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

// fetch data from api & append currencies in select

const appendOptionsToSelectTag = (arr2d, tag) => {
  return arr2d.forEach((arr) => {
    const option = document.createElement('option');
    option.appendChild(document.createTextNode(arr[0]));
    option.value = arr[1];
    tag.appendChild(option);
  });
};

const getAllCurrencies = async (parentTag, historyDate = null) => {
  if (historyDate !== null) {
    try {
      const response = await axiosInstance.get(`/${historyDate}`);
      const rates = Object.entries(response.data.rates);

      appendOptionsToSelectTag(rates, parentTag);
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      const response = await axiosInstance.get('/latest');
      const rates = Object.entries(response.data.rates);

      appendOptionsToSelectTag(rates, parentTag);
    } catch (error) {
      console.error(error);
    }
  }
};

window.onload = () => {
  getDailyRate();
  getAllCurrencies(select1);
  getAllCurrencies(select2);
};

// select currencies, count & display in list result exchange currencies
// with delete button for each of items

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
  li.innerHTML = localStorage.getItem(id);

  const btnDeleteItem = document.createElement('button');
  btnDeleteItem.className = 'btn-delete-item';
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
  const liContent = `<small>${date.value}:</small> ${amount} ${currency1} = ${result} ${currency2}`;
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

// show list with history of currency conversions with two buttons (clear & close)

const btnClearHistory = document.createElement('button');
const btnCloseHistory = document.createElement('button');

const appendElem = (parent, child, text, name) => {
  parent.appendChild(child);
  child.innerHTML = text;
  child.className = name;
};

btnHistory.onclick = () => {
  if (Object.keys(localStorage).filter((key) => key !== 'theme').length === 0) {
    errorMessHistory.innerHTML = 'The history of currency conversion is empty';
    setTimeout(() => (errorMessHistory.innerHTML = ''), 4000);
    return;
  }

  resultList.innerHTML = '';
  Object.keys(localStorage).forEach((key) => {
    if (key === 'theme') {
      return;
    } else {
      createListItem(key);
    }
  });
  appendElem(
    btnsHistory,
    btnCloseHistory,
    'Close',
    'btn btn-outline-primary me-4'
  );
  appendElem(btnsHistory, btnClearHistory, 'Clear', 'btn btn-outline-danger');
};

const clearHistorySection = () => {
  resultList.innerHTML = '';
  btnClearHistory.remove();
  btnCloseHistory.remove();
};

btnClearHistory.onclick = () => {
  Object.keys(localStorage).forEach((key) =>
    key !== 'theme' ? localStorage.removeItem(key) : key
  );
  clearHistorySection();
};

btnCloseHistory.onclick = () => {
  clearHistorySection();
};
