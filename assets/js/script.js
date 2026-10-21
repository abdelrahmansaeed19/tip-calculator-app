// tipTotal       = bill × (tipPercent / 100)
// tipPerPerson   = tipTotal / people
// totalPerPerson = (bill + tipTotal) / people

const form = document.getElementById("tip-form");
const billInput = document.getElementById("bill");
const peopleInput = document.getElementById("people");
const customTipInput = document.getElementById("tip-custom");
const tipRadios = document.querySelectorAll(".tip__radio");

const billError = document.getElementById("bill-error");
const peopleError = document.getElementById("people-error");

const tipAmountOutput = document.getElementById("tip-amount");
const totalOutput = document.getElementById("total");

const MAX_VALUE = 1_000_000_000;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function readNumber(input) {
  const raw = input.value.trim();
  return raw === "" ? null : Number(raw);
}

function setFieldError(input, errorEl, message) {
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
  errorEl.textContent = message;
}

function readField(input, errorEl, { integer = false } = {}) {
  const value = readNumber(input);
  let error = "";

  if (value !== null) {
    if (value === 0) error = "Can't be zero";
    else if (value < 0) error = "Can't be negative";
    else if (integer && !Number.isInteger(value)) error = "Whole numbers only";
    else if (value > MAX_VALUE) error = "Too large";
  }

  setFieldError(input, errorEl, error);
  return value !== null && !error ? value : null;
}

function getTipPercent() {
  const custom = readNumber(customTipInput);
  if (custom !== null) return custom >= 0 ? custom : null;

  const checked = document.querySelector(".tip__radio:checked");
  return checked ? Number(checked.value) : null;
}

function calculate(bill, tipPercent, people) {
  const tipTotal = bill * (tipPercent / 100);
  return {
    tipPerPerson: tipTotal / people,
    totalPerPerson: (bill + tipTotal) / people,
  };
}

function render(tipPerPerson = 0, totalPerPerson = 0) {
  tipAmountOutput.textContent = currency.format(tipPerPerson);
  totalOutput.textContent = currency.format(totalPerPerson);
}

function update() {
  const bill = readField(billInput, billError);
  const people = readField(peopleInput, peopleError, { integer: true });
  const tipPercent = getTipPercent();

  if (bill === null || people === null || tipPercent === null) {
    render(); // back to $0.00
    return;
  }

  const { tipPerPerson, totalPerPerson } = calculate(bill, tipPercent, people);

  if (!Number.isFinite(tipPerPerson) || !Number.isFinite(totalPerPerson)) {
    render();
    return;
  }

  render(tipPerPerson, totalPerPerson);
}

form.addEventListener("input", (event) => {
  if (event.target.matches(".tip__radio")) {
    customTipInput.value = "";
  } else if (event.target === customTipInput) {
    tipRadios.forEach((radio) => (radio.checked = false));
  }

  update();
});

// The native reset clears the fields AFTER this event fires,
// so wait one tick, then re-run update() on the now-empty form.
form.addEventListener("reset", () => setTimeout(update, 0));

update(); // initial state
