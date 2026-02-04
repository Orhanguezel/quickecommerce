// This is required for firebase messaging to work on web
importScripts('https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js');

firebase.initializeApp({
        apiKey: "customize_your_api_key",
        authDomain: "customize_your_auth_domain",
        projectId: "customize_your_project_id",
        storageBucket: "customize_your_store_bucket",
        messagingSenderId: "customize_your_message_sender_id",
        appId: "customize_your_app_id",
        measurementId: "customize_your_measurement_id",
});

const messaging = firebase.messaging();
