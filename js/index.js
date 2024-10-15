document.addEventListener("DOMContentLoaded", () => {
  const transactionList = document.querySelector("#transactions-list");
  const transactionForm = document.querySelector("form");

  // Save the edited transaction
  const saveTransaction = (id, newDescription, newType, newAmount) => {
    const updatedTransaction = {
      description: newDescription,
      type: newType,
      amount: parseFloat(newAmount) // Ensure amount is numeric
    };

    fetch(`http://localhost:3000/transactions/${id}`, {
      method: "PATCH", // Using PATCH for partial updates
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedTransaction)
    })
      .then(response => response.json())
      .then(updatedTransaction => {
        console.log("Transaction updated:", updatedTransaction);
        location.reload(); // Refresh the page to reflect the changes (optional)
      })
      .catch(error => console.error("Error updating transaction:", error));
  };

  // Add a transaction to the transactions list.
  const addTransaction = transaction => {
    const newRow = document.createElement("tr");
    newRow.className = "border-b hover:bg-gray-50 transition-colors"

    // Create the td elements
    const descriptionCell = document.createElement("td");
    const typeCell = document.createElement("td");
    const amountCell = document.createElement("td");
    const actionCell = document.createElement("td");

    // Add classes and text into the td elements
    descriptionCell.textContent = transaction.description;
    descriptionCell.className = "p-2 text-gray-800";

    typeCell.textContent = transaction.type;
    typeCell.className = "p-2";
    typeCell.classList.add(transaction.type.toLowerCase() === 'income' ? 'text-secondary' : 'text-accent');

    amountCell.textContent = transaction.amount;
    amountCell.className = "p-2 font-medium";
    amountCell.classList.add(transaction.type.toLowerCase() === 'income' ? 'text-secondary' : 'text-accent');

    actionCell.className = "p-2";

    // Create buttons for Edit and Delete
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "bg-primary text-white py-1 px-3 rounded mr-2 hover:bg-primary/90 transition-colors";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors";

    // Append buttons to actionCell
    actionCell.appendChild(editBtn);
    actionCell.appendChild(delBtn);

    // Add event listener to the delete button
    delBtn.addEventListener("click", () => {
      fetch(`http://localhost:3000/transactions/${transaction.id}`, {
        method: "DELETE"
      })
        .then(() => newRow.remove())
        .catch(error => console.error("Error deleting transaction:", error));
    });

    // Add event listener to the edit button
    editBtn.addEventListener("click", () => {
      // Replace the td content with input fields
      const descriptionInput = document.createElement("input");
      descriptionInput.value = transaction.description;
      descriptionInput.className = "w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary";
      descriptionCell.replaceChildren(descriptionInput);

      const typeInput = document.createElement("input");
      typeInput.value = transaction.type;
      typeInput.className = "w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary";
      typeCell.replaceChildren(typeInput);

      const amountInput = document.createElement("input");
      amountInput.type = "number";
      amountInput.value = transaction.amount;
      amountInput.className = "w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary";
      amountCell.replaceChildren(amountInput);

      // Change Edit button to Save button
      editBtn.textContent = "Save";
      editBtn.className = "bg-secondary text-white py-1 px-3 rounded mr-2 hover:bg-secondary/90 transition-colors";

      // Remove the click event for Edit, and add a new one for Save
      editBtn.addEventListener(
        "click",
        () => {
          saveTransaction(
            transaction.id,
            descriptionInput.value,
            typeInput.value,
            amountInput.value
          );
        },
        { once: true }
      ); // Use `{ once: true }` to make sure the listener runs only once
    });

    // Append all td elements to the tr
    newRow.appendChild(descriptionCell);
    newRow.appendChild(typeCell);
    newRow.appendChild(amountCell);
    newRow.appendChild(actionCell);

    transactionList.insertBefore(newRow, transactionList.firstChild);
  };

  // Create a list of existing transaction on page load
  fetch("http://localhost:3000/transactions") // localhost == 127.0.0.1
    .then(response => response.json())
    .then(transactions => {
      transactions.forEach(transaction => {
        addTransaction(transaction);
      });
    })
    .catch(error => {
      console.error("Error fetching transactions:", error);
      // alert("Error fetching transactions:", error);
    });

  // Add new transaction from form
  transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form values
    let description = this.querySelector("#description").value;
    let type = this.querySelector("#type").value;
    let amount = parseFloat(this.querySelector("#amount").value);

    // Create new transaction object
    const newTransactionObj = { description, type, amount };

    // Add a new transaction to the db
    fetch("http://localhost:3000/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTransactionObj)
    })
      .then(response => response.json())
      .then(transaction => {
        console.log(transaction);
        // Add a new transaction to the transaction list in the DOM
        addTransaction(transaction);
      })
      .catch(error => console.error("Error adding transaction:", error));

    this.reset();
  });
});
