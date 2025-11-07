const form = document.getElementById("transactionForm");
const tableBody = document.querySelector("#transactionTable tbody");
const filterCategory = document.getElementById("filterCategory");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const balanceEl = document.getElementById("balance");
const exportBtn = document.getElementById("exportCSV");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  if (!amount || !date || !category) {
    alert("Please fill all required fields.");
    return;
  }

  const transaction = { amount, date, category, note };
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  form.reset();
  renderTransactions();
});

filterCategory.addEventListener("change", renderTransactions);

function renderTransactions() {
  const filter = filterCategory.value;
  tableBody.innerHTML = "";

  let filtered = transactions.filter(
    (t) => filter === "All" || t.category === filter
  );

  let totalIncome = 0;
  let totalExpenses = 0;

  filtered.forEach((t) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.category}</td>
      <td>${t.amount}</td>
      <td>${t.note || "-"}</td>
    `;
    tableBody.appendChild(row);

    if (t.category === "Income") totalIncome += t.amount;
    else totalExpenses += t.amount;
  });

  totalIncomeEl.textContent = totalIncome.toFixed(2);
  totalExpensesEl.textContent = totalExpenses.toFixed(2);
  balanceEl.textContent = (totalIncome - totalExpenses).toFixed(2);

  updateChart(totalIncome, totalExpenses);
}

exportBtn.addEventListener("click", () => {
  const csvContent = [
    ["Date", "Category", "Amount", "Note"],
    ...transactions.map((t) => [t.date, t.category, t.amount, t.note]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
});

let chart;
function updateChart(income, expenses) {
  const ctx = document.getElementById("financeChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [income, expenses],
          backgroundColor: ["#28a745", "#dc3545"],
        },
      ],
    },
  });
}

renderTransactions();
