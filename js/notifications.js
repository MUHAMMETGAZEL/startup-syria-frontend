// وظيفة لعرض الإشعارات
function showNotification(title, message) {
    const notification = document.getElementById('notification');
    const titleElement = document.getElementById('notification-title');
    const messageElement = document.getElementById('notification-message');
    titleElement.textContent = title;
    messageElement.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// تحديث وقت آخر حفظ
function updateLastSaveTime() {
    const now = new Date();
    document.getElementById('last-save-time').textContent = now.toLocaleTimeString('ar-SA');
}