let editId = null;
let users = [];
let port = localStorage.getItem('port') || 4000;
const ip = 'http://127.0.0.1';

init();

function init() {
    getUsers();
    document.addEventListener('DOMContentLoaded', () => {
        document.forms[0].elements.username.focus();
        document.querySelector('.port-value').textContent = port;
    });
}

function getHost() {
    return `${ip}:${port}`;
}

function setPort(event) {
    event.preventDefault();
    const oldPort = port;
    port = +prompt('Enter port', port);
    if (!(Number.isInteger(port) && port > 0 && port < 65535)) {
        port = oldPort;
        alert('Wrong port value');
        return;
    }
    localStorage.setItem('port', port);
    document.querySelector('.port-value').textContent = port;
    getUsers();
}

async function getUsers() {
    const url = new URL('api/users', getHost());
    let response;
    try {
        response = await fetch(url.toString());
    } catch (error) {
        alert(error.message + ' ' + url.toString());
        return;
    }

    if (response.ok) {
        try {
            users = await response.json();
            console.log('users', users);
            showUsers();
        } catch (error) {
            alert(error.message);
        }
    } else {
        showResponseAlert(response);
    }
}

async function getUser(event) {
    const id = event.target.dataset.id;
    if (!id) {
        return;
    }
    const url = new URL(`api/users/${id}`, getHost());
    let response;
    try {
        response = await fetch(url.toString());
    } catch (error) {
        alert(error.message + ' ' + url.toString());
        return;
    }
    if (response.ok) {
        try {
            const result = await response.json();
            console.log('user', result);
            const user = users.find(user => user.id === id);
            user.username = result.username;
            user.age = result.age;
            user.hobbies = result.hobbies;
            showUsers();
        } catch (error) {
            alert(error.message);
        }
    } else {
        showResponseAlert(response);
    }
}

function addHobby(event) {
    event.preventDefault();
    document.querySelector('.hobbies-list').insertAdjacentHTML('beforeend', `
        <label class="hobby">
            <input type="text" class="hobby-value" name="hobby">
            <button onclick="deleteHobby(event)">-</button>
        </label>
    `);
    hobbiesEl = document.forms[0].elements.hobby;
    if (hobbiesEl.length) {
        hobbiesEl[hobbiesEl.length - 1].focus();
    } else {
        hobbiesEl.focus();
    }
}

function deleteHobby(event) {
    event.preventDefault();
    event.target.parentElement.remove();
}

function editUser(event) {
    const id = event.target.dataset.id;
    if (!id) {
        return;
    }
    resetForm();
    editId = id;
    const user = users.find(u => u.id === id);
    document.forms[0].elements.username.value = user.username;
    document.forms[0].elements.age.value = user.age;
    const hobbiesListEl = document.querySelector('.hobbies-list');
    hobbiesListEl.innerHTML = '';
    for (const hobbie of user.hobbies) {
        hobbiesListEl.insertAdjacentHTML('beforeend', `
            <label class="hobby">
                <input type="text" class="hobby-value" name="hobby" value="${hobbie}">
                <button onclick="deleteHobby(event)">-</button>
            </label>
        `);
    }
}

async function deleteUser(event) {
    const id = event.target.dataset.id;
    if (!id) {
        return;
    }
    const url = new URL(`api/users/${id}`, getHost());
    let response;
    try {
        response = await fetch(url.toString(), { 
            method: 'DELETE'
        });
    } catch (error) {
        alert(error.message + ' ' + url.toString());
        return;
    }
    if (response.ok) {
        try {
            await getUsers();
        } catch (error) {
            alert(error.message);
        }
    } else {
        showResponseAlert(response);
    }
}

function showUsers() {
    const listEl = document.querySelector('.users-list');
    listEl.innerHTML = '';
    for (const user of users) {
        listEl.insertAdjacentHTML('beforeend', `
            <div class="user-item"">
                <div>Name: <span>${user.username}</span></div>
                <div>Age: <span>${user.age}</span></div>
                <div>Hobbies: <span>${user.hobbies.join(', ')}</span></div>
                <div class="user-buttons">
                    <button class="button" onclick="editUser(event)" data-id="${user.id}">Edit</button>
                    <button class="button" onclick="deleteUser(event)" data-id="${user.id}">Delete</button>
                    <button class="button" onclick="getUser(event)" data-id="${user.id}">Refresh</button>
                </div>
            </div>
        `);
    }
}

function resetForm(event) {
    if (event) {
        event.preventDefault();
    }
    document.forms[0].reset();
    document.querySelector('.hobbies-list').innerHTML = '';
    document.forms[0].elements.username.focus();
    editId = null;
}

async function save(event) {
    event.preventDefault();
    const username = document.forms[0].elements.username.value;
    let age = +document.forms[0].elements.age.value;
    if (isNaN(age)) {
        age = document.forms[0].elements.age.value;
    }
    let hobbies = [];
    const hobbiesEl = document.forms[0].elements.hobby;
    if (hobbiesEl) {
        if (hobbiesEl.length) {
            hobbiesEl.forEach(node => node.value.trim() ? hobbies.push(node.value) : null);
        } else {
            if (hobbiesEl.value.trim().length) {
                hobbies.push(hobbiesEl.value);
            }
        }
    }
    const user = {
        username,
        age,
        hobbies
    }
    const url = new URL(`api/users${editId ? '/' + editId : '' }`, getHost());
    let response;
    try {
        response = await fetch(url.toString(), {
            method: editId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });    
    } catch (error) {
        alert(error.message + ' ' + url.toString());
        return;
    }
    if (response.ok) {
        try {
            const user = await response.json();
            console.log(`${editId ? 'updated' : 'created'} user`, user);
            resetForm();
            await getUsers();
        } catch (error) {
            alert(error.message);
        }
    } else {
        showResponseAlert(response);
    }
}

async function showResponseAlert(response) {
    try {
        alert((await response.json())?.message);
    } catch (error) {
        alert(`${error}\nError message must be an object from JSON: { message }`);
    }
}