document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const eventForm = document.getElementById('event-form');
    const eventList = document.getElementById('event-list');
    const meetingForm = document.getElementById('meeting-form');
    const meetingList = document.getElementById('meeting-list');
    const themeToggle = document.getElementById('theme-toggle');
    const notificationArea = document.createElement('div');
    notificationArea.id = 'notification-area';
    document.body.appendChild(notificationArea);

    // Theme management
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    }

    // Load and render saved items
    loadItems('tasks', addTask);
    loadItems('events', addEvent);
    loadItems('meetings', addMeeting);

    // Form submissions
    taskForm.addEventListener('submit', handleNewTaskSubmit);
    eventForm.addEventListener('submit', handleNewEventSubmit);
    meetingForm.addEventListener('submit', handleNewMeetingSubmit);

    function handleNewTaskSubmit(event) {
        event.preventDefault();
        const task = getFormData(taskForm);
        if (task['new-task']) {
            addTask(task);
            saveItem('tasks', task);
            taskForm.reset();
            showNotification('Task Added', `New task "${task['new-task']}" has been added.`);
        }
    }

    function handleNewEventSubmit(event) {
        event.preventDefault();
        const eventItem = getFormData(eventForm);
        if (eventItem['event-description']) {
            addEvent(eventItem);
            saveItem('events', eventItem);
            eventForm.reset();
            showNotification('Event Added', `New event "${eventItem['event-description']}" has been added.`);
        }
    }

    function handleNewMeetingSubmit(event) {
        event.preventDefault();
        const meeting = getFormData(meetingForm);
        if (meeting['meeting-title']) {
            addMeeting(meeting);
            saveItem('meetings', meeting);
            meetingForm.reset();
            showNotification('Meeting Scheduled', `New meeting "${meeting['meeting-title']}" has been scheduled.`);
        }
    }

    function addTask(task) {
        const listItem = createListItem(task, 'task');
        taskList.appendChild(listItem);
        if (task['alarm-time']) {
            setAlarm(task['new-task'], task['alarm-time']);
        }
    }

    function addEvent(eventItem) {
        const listItem = createListItem(eventItem, 'event');
        eventList.appendChild(listItem);
        if (eventItem['alarm-time']) {
            setAlarm(eventItem['event-description'], eventItem['alarm-time']);
        }
    }

    function addMeeting(meeting) {
        const listItem = createListItem(meeting, 'meeting');
        meetingList.appendChild(listItem);
    }

    function createListItem(item, type) {
        const listItem = document.createElement('li');
        listItem.className = type;
        if (type === 'task') {
            listItem.classList.add(item.priority, item.category);
        }

        const itemSpan = document.createElement('span');
        updateItemSpan(itemSpan, item, type);
        itemSpan.style.flex = '1';

        const editButton = createButton('✏️', 'edit', `Edit ${item['new-task'] || item['event-description'] || item['meeting-title']}`, () => editItem(listItem, item, type));
        const deleteButton = createButton('🗑️', 'delete', `Delete ${item['new-task'] || item['event-description'] || item['meeting-title']}`, () => {
            listItem.remove();
            deleteItem(type + 's', item);
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Deleted`, `${type.charAt(0).toUpperCase() + type.slice(1)} "${item['new-task'] || item['event-description'] || item['meeting-title']}" has been deleted.`);
        });

        listItem.append(itemSpan, editButton, deleteButton);

        if (type === 'meeting') {
            const inviteButton = createButton('Invite on WhatsApp', 'invite', 'Invite participants', () => {
                inviteParticipants(item);
            });
            listItem.appendChild(inviteButton);
        }

        return listItem;
    }

    function editItem(listItem, item, type) {
        const editForm = createEditForm(item, type);
        const oldItemText = item['new-task'] || item['event-description'] || item['meeting-title'];
        listItem.replaceChildren(editForm);

        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = getFormData(editForm);
            Object.assign(item, formData);

            const itemSpan = document.createElement('span');
            updateItemSpan(itemSpan, item, type);
            const editButton = createButton('✏️', 'edit', `Edit ${item['new-task'] || item['event-description'] || item['meeting-title']}`, () => editItem(listItem, item, type));
            const deleteButton = createButton('🗑️', 'delete', `Delete ${item['new-task'] || item['event-description'] || item['meeting-title']}`, () => {
                listItem.remove();
                deleteItem(type + 's', item);
                showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Deleted`, `${type.charAt(0).toUpperCase() + type.slice(1)} "${item['new-task'] || item['event-description'] || item['meeting-title']}" has been deleted.`);
            });

            listItem.replaceChildren(itemSpan, editButton, deleteButton);
            if (type === 'meeting') {
                const inviteButton = createButton('Invite on WhatsApp', 'invite', 'Invite participants', () => {
                    inviteParticipants(item);
                });
                listItem.appendChild(inviteButton);
            }

            updateItem(type + 's', item);
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Edited`, `${type.charAt(0).toUpperCase() + type.slice(1)} "${oldItemText}" has been edited.`);
        });

        editForm.querySelector('.cancel').addEventListener('click', () => {
            const itemSpan = document.createElement('span');
            updateItemSpan(itemSpan, item, type);
            const editButton = createButton('✏️', 'edit', `Edit ${item['new-task'] || item['event-description'] || item['meeting-title']}`, () => editItem(listItem, item, type));
            const deleteButton = createButton('🗑️', 'delete', `Delete ${item['new-task'] || item['event-description'] || item['meeting-title']}`, () => {
                listItem.remove();
                deleteItem(type + 's', item);
                showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Deleted`, `${type.charAt(0).toUpperCase() + type.slice(1)} "${item['new-task'] || item['event-description'] || item['meeting-title']}" has been deleted.`);
            });

            listItem.replaceChildren(itemSpan, editButton, deleteButton);
            if (type === 'meeting') {
                const inviteButton = createButton('Invite on WhatsApp', 'invite', 'Invite participants', () => {
                    inviteParticipants(item);
                });
                listItem.appendChild(inviteButton);
            }
        });
    }

    function createEditForm(item, type) {
        const editForm = document.createElement('form');
        let formContent = '';

        if (type === 'task') {
            formContent = `
                <input name="new-task" type="text" value="${item['new-task']}" required>
                <input name="due-date" type="date" value="${item['due-date'] || ''}">
                <input name="alarm-time" type="time" value="${item['alarm-time'] || ''}">
                <select name="priority">
                    <option value="low" ${item.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${item.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${item.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
                <select name="category">
                    <option value="work" ${item.category === 'work' ? 'selected' : ''}>Work</option>
                    <option value="personal" ${item.category === 'personal' ? 'selected' : ''}>Personal</option>
                    <option value="shopping" ${item.category === 'shopping' ? 'selected' : ''}>Shopping</option>
                    <option value="meeting" ${item.category === 'meeting' ? 'selected' : ''}>Meeting</option>
                </select>
            `;
        } else if (type === 'event') {
            formContent = `
                <select name="event-type">
                    <option value="birthday" ${item['event-type'] === 'birthday' ? 'selected' : ''}>Birthday</option>
                    <option value="anniversary" ${item['event-type'] === 'anniversary' ? 'selected' : ''}>Anniversary</option>
                </select>
                <input name="event-date" type="date" value="${item['event-date'] || ''}" required>
                <input name="event-description" type="text" value="${item['event-description']}" required>
                <input name="alarm-time" type="time" value="${item['alarm-time'] || ''}">
            `;
        } else if (type === 'meeting') {
            formContent = `
                <input name="meeting-title" type="text" value="${item['meeting-title']}" required>
                <input name="meeting-date" type="date" value="${item['meeting-date'] || ''}" required>
                <input name="meeting-time" type="time" value="${item['meeting-time'] || ''}">
                <input name="meeting-details" type="text" value="${item['meeting-details']}" required>
                <input name="meeting-link" type="url" value="${item['meeting-link'] || ''}">
            `;
        }

        editForm.innerHTML = `
            ${formContent}
            <button type="submit">Save</button>
            <button type="button" class="cancel">Cancel</button>
        `;

        return editForm;
    }

    function updateItemSpan(span, item, type) {
        if (type === 'task') {
            span.textContent = `${item['new-task']} (Due: ${item['due-date'] || 'N/A'})`;
        } else if (type === 'event') {
            span.textContent = `${item['event-type']}: ${item['event-description']} on ${item['event-date'] || 'N/A'}`;
        } else if (type === 'meeting') {
            span.innerHTML = `
                <h3>${item['meeting-title']}</h3>
                <p>${item['meeting-details']}</p>
                <p>Date: ${item['meeting-date'] || 'N/A'}</p>
                <a href="${item['meeting-link']}" target="_blank">${item['meeting-link'] || 'N/A'}</a>
            `;
        }
    }

    function createButton(innerHTML, className, title, onClick) {
        const button = document.createElement('button');
        button.innerHTML = innerHTML;
        button.className = className;
        button.title = title;
        button.onclick = onClick;
        return button;
    }

    function getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        return data;
    }

    function loadItems(key, addFunction) {
        const items = JSON.parse(localStorage.getItem(key)) || [];
        items.forEach(addFunction);
    }

    function saveItem(key, item) {
        const items = JSON.parse(localStorage.getItem(key)) || [];
        items.push(item);
        localStorage.setItem(key, JSON.stringify(items));
    }

    function deleteItem(key, item) {
        const items = JSON.parse(localStorage.getItem(key)) || [];
        const updatedItems = items.filter(i => i !== item);
        localStorage.setItem(key, JSON.stringify(updatedItems));
    }

    function updateItem(key, item) {
        const items = JSON.parse(localStorage.getItem(key)) || [];
        const index = items.findIndex(i => i === item);
        if (index > -1) {
            items[index] = item;
            localStorage.setItem(key, JSON.stringify(items));
        }
    }

    function setAlarm(title, time) {
        const now = new Date();
        const alarmTime = new Date(`${now.toDateString()} ${time}`);

        if (alarmTime > now) {
            const timeout = alarmTime - now;
            setTimeout(() => {
                showNotification('Alarm', `Time for: ${title}`);
                alert(`Time for: ${title}`);
            }, timeout);
        }
    }

    function showNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<h4>${title}</h4><p>${message}</p>`;

        notificationArea.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    function inviteParticipants(meeting) {
        const message = `You're invited to a meeting "${meeting['meeting-title']}" on ${meeting['meeting-date']}. Join here: ${meeting['meeting-link']}`;
        const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');

        showNotification('Redirecting', `Redirecting to WhatsApp to share meeting link.`);
    }
});

// Tab functionality
function openSection(evt, sectionName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(sectionName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Set the first tab as active by default
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.tablinks').click();
});