const API_URL = "/api/students";

const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");
const studentIdInput = document.getElementById("studentId");
const table = document.getElementById("studentTable");
const message = document.getElementById("message");

let students = [];

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "#28733b";
}

function setStatus(connected) {
    document.getElementById("apiStatus").textContent =
        connected ? "API Connected" : "API Disconnected";

    document.getElementById("statusText").textContent =
        connected ? "Online" : "Offline";
}

async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load students.");
        }

        students = await response.json();
        setStatus(true);
        renderStudents();
    } catch (error) {
        setStatus(false);
        table.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent =
            "Unable to connect. Make sure the server is running.";

        row.appendChild(cell);
        table.appendChild(row);
        showMessage("Could not connect to the API.", true);
    }
}

function renderStudents() {
    table.replaceChildren();

    document.getElementById("totalStudents").textContent =
        students.length;

    if (students.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No student records found.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    students.forEach(student => {
        const row = document.createElement("tr");

        [student.id, student.name, student.email, student.course]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        const actionCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", () => editStudent(student));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteStudent(student.id));

        actions.append(editButton, deleteButton);
        actionCell.appendChild(actions);
        row.appendChild(actionCell);
        table.appendChild(row);
    });
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const id = studentIdInput.value;

    const student = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        course: courseInput.value.trim()
    };

    const isEditing = id !== "";

    try {
        const response = await fetch(
            isEditing ? `${API_URL}/${id}` : API_URL,
            {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Request failed.");
        }

        showMessage(result.message);
        resetForm();
        await loadStudents();
    } catch (error) {
        showMessage(error.message, true);
    }
});

function editStudent(student) {
    studentIdInput.value = student.id;
    nameInput.value = student.name;
    emailInput.value = student.email;
    courseInput.value = student.course;

    document.getElementById("formTitle").textContent = "Edit Student";
    document.getElementById("submitBtn").textContent = "Update Student";
    document.getElementById("cancelBtn").hidden = false;

    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed.");
        }

        showMessage(result.message);
        await loadStudents();
    } catch (error) {
        showMessage(error.message, true);
    }
}

function resetForm() {
    form.reset();
    studentIdInput.value = "";

    document.getElementById("formTitle").textContent = "Add New Student";
    document.getElementById("submitBtn").textContent = "Add Student";
    document.getElementById("cancelBtn").hidden = true;
}

document.getElementById("cancelBtn").addEventListener("click", resetForm);
document.getElementById("refreshBtn").addEventListener("click", loadStudents);

loadStudents();
